import { type FC, useState, useCallback } from "react";
import { useAuth } from "@/app/providers/auth/useAuth";
import { useDropzone } from "react-dropzone";
import { generateId } from "@/utils/generate";

type AuthModalProps = {
  type: "login" | "register";
  isOpen: boolean;
  onClose: () => void;
};

export const AuthModal: FC<AuthModalProps> = ({ type, isOpen, onClose }) => {
  const { login, register } = useAuth();

  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setAvatarFile(acceptedFiles[0]);
      setAvatarPreview(URL.createObjectURL(acceptedFiles[0]));
      setError("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  if (!isOpen) return null;

  const handleRemoveAvatar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setAvatarFile(null);
    setAvatarPreview(undefined);
  };

  // ===== ВАЛИДАЦИЯ =====
  const isNicknameValid = nickname.trim().length >= 5;
  const isPasswordValid = password.trim().length >= 5;

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    if (val.length === 1) val = val.toUpperCase();
    else if (val.length > 1) val = val.charAt(0).toUpperCase() + val.slice(1);

    setNickname(val);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched(true);

    if (!isNicknameValid || !isPasswordValid) {
      setError("Минимум 5 символов");
      return;
    }

    if (type === "register" && !avatarFile) {
      setError("Аватар не загружен");
      return;
    }

    try {
      if (type === "login") {
        await login({ username: nickname, password });
      } else if (type === "register" && avatarFile) {
        await register({ username: nickname, password, avatar: avatarFile });
      }

      setError("");
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ошибка сервера";
      setError(message);
      console.log(`[AuthModal] ${type} error:`, message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="relative modal-bg bg-gray-800 md:rounded-[20px] max-w-[500px] w-full px-[30px] py-[80px] sm:p-[60px] flex flex-col items-center text-center">

        {/* закрыть */}
        <button
          onClick={onClose}
          className="absolute top-[20px] right-[20px] text-white text-[24px] hover:text-gray-300"
        >
          ✕
        </button>

        <h2 className="text-white text-[36px] sm:text-[44px] font-bold mb-4">
          {type === "login" ? "Вход в чат" : "Регистрация"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[350px] flex flex-col items-center gap-4 relative"
        >
          {/* АВАТАР */}
          {type === "register" && (
            <div className="flex justify-center relative w-full">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-full w-36 h-36 flex items-center justify-center cursor-pointer overflow-hidden
                ${!avatarFile && touched ? "border-red-300" : "border-gray-300"}`}
              >
                <input {...getInputProps()} />

                {avatarPreview ? (
                  <>
                    <img
                      src={avatarPreview}
                      alt="avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="z-10 absolute top-1 right-1 bg-white rounded-full w-7 h-7 flex items-center justify-center text-gray-700 shadow-md"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <p
                    className={`absolute text-center px-3 font-extrabold text-md
                    ${!avatarFile && touched ? "text-red-300" : "text-white"}`}
                  >
                    {isDragActive ? "Отпустите файл" : "Загрузите !"}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* НИК */}
          <input
            type="text"
            placeholder="Никнейм"
            name={generateId()}
            value={nickname}
            autoComplete="off"
            onChange={handleNicknameChange}
            className={`rounded-[30px] py-[15px] px-[30px] text-[14px] w-full text-white transition-colors focus:outline-gray-300
            ${touched && !isNicknameValid ? "border border-red-300" : "border border-gray-300"}`}
            required
          />

          {/* ПАРОЛЬ */}
          <input
            type="password"
            placeholder="Пароль"
            value={password}
             name={generateId()}
            autoComplete="new-password"
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            className={`rounded-[30px] py-[15px] px-[30px] text-[14px] w-full text-white transition-colors focus:outline-gray-300
            ${touched && !isPasswordValid ? "border border-red-300" : "border border-gray-300"}`}
            required
          />

          {/* ===== ОШИБКА (ABSOLUTE) ===== */}
          {error && (
            <p className="absolute bottom-[-28px] text-red-300 text-[15px] font-semibold text-center w-full">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-[20px] w-full py-[15px] rounded-[30px] text-white bg-gradient-to-r from-[#f4a77f] to-[#ee7c7f] hover:brightness-105 active:scale-95"
          >
            {type === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>
      </div>
    </div>
  );
};
