// src/components/AuthModal.tsx
import { type FC, useState, useCallback } from "react";
import { useAuth } from "@/app/providers/auth/useAuth";
import { useDropzone } from "react-dropzone";

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
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setAvatarFile(acceptedFiles[0]);
      setAvatarPreview(URL.createObjectURL(acceptedFiles[0]));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  if (!isOpen) return null;

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(undefined);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched(true);

    // Проверки для регистрации
    if (type === "register") {
      if (password.length < 7) {
        setError("Пароль должен содержать минимум 7 символов");
        return;
      }
      if (!avatarFile) {
        setError("Аватар обязателен");
        return;
      }
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
      const message = err instanceof Error ? err.message : "Произошла неизвестная ошибка";
      setError(message);
      console.log(`[AuthModal] ${type} error:`, message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="relative modal-bg bg-gray-800 md:rounded-[20px] max-w-[500px] w-full px-[30px] py-[80px] sm:p-[60px] flex flex-col items-center text-center transition-transform duration-300 transform scale-95 opacity-100">

        {/* Закрытие */}
        <button
          onClick={onClose}
          className="absolute top-[20px] right-[20px] text-white text-[24px] hover:text-gray-300 transition-colors"
        >
          ✕
        </button>

        {/* Заголовок */}
        <h2 className="text-white text-[36px] sm:text-[44px] font-bold uppercase tracking-[-0.03em] mb-4">
          {type === "login" ? "Вход в чат" : "Регистрация"}
        </h2>
        <p className="text-white text-[16px] sm:text-[18px] mb-[30px]">
          {type === "login"
            ? "Введите свой никнейм и пароль для входа"
            : "Введите ник, пароль и выберите аватар"}
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-[350px] flex flex-col items-center gap-6 relative">

          {/* Аватарка только при регистрации */}
          {type === "register" && (
            <div className="flex justify-center relative w-full">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-full w-36 h-36 flex items-center justify-center cursor-pointer overflow-hidden
                  ${!avatarFile && touched ? "border-red-300" : "border-white/50"}`}
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
                      className="absolute top-1 right-1 bg-white rounded-full w-7 h-7 flex items-center justify-center text-gray-700 shadow-md hover:bg-gray-100"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <p className={`absolute text-center px-3 text-sm
                    ${!avatarFile && touched ? "text-red-200" : "text-white"}`}
                  >
                    {isDragActive ? "Отпустите файл" : !avatarFile && touched ? "Аватар обязателен" : "Перетащите или выберите"}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Никнейм */}
          <input
            type="text"
            placeholder="Никнейм"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="rounded-[30px] py-[15px] px-[30px] text-[14px] placeholder-gray-300 w-full border border-gray-300 focus:outline-gray-200 transition-colors text-white"
            required
          />

          {/* Пароль */}
          <div className="w-full relative">
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-[30px] py-[15px] px-[30px] text-[14px] placeholder-gray-300 w-full border border-gray-300 focus:outline-gray-200 transition-colors text-white"
              required
            />
            {error && (
              <p className="absolute left-0 top-full mt-1 text-red-300 text-[15px] font-semibold text-center w-full">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="mt-[20px] w-full py-[15px] rounded-[30px] text-white bg-gradient-to-r from-[#f4a77f] to-[#ee7c7f] transition-all duration-300 hover:brightness-105 active:scale-95"
          >
            {type === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>
      </div>
    </div>
  );
};
