// src/components/ProfileModal.tsx
import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { AppButton } from "@/components/AppButton";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nickname: string, avatarFile: File | null) => void;
  initialNickname?: string;
  initialAvatarUrl?: string;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialNickname = "",
  initialAvatarUrl,
}) => {
  const [nickname, setNickname] = useState(initialNickname);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    initialAvatarUrl
  );
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        setNickname(initialNickname);
        setAvatarPreview(initialAvatarUrl);
        setAvatarFile(null);
        setTouched(false);
      });
    }
  }, [isOpen, initialNickname, initialAvatarUrl]);

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

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(undefined);
  };

  const isNicknameValid = nickname.trim().length >= 5;
  const isAvatarValid = Boolean(avatarFile);
  const isFormValid = isNicknameValid && isAvatarValid;

  const handleSave = () => {
    setTouched(true);
    if (!isFormValid) return;
    onSave(nickname.trim(), avatarFile);
    onClose();
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.length === 1) {
      val = val.toUpperCase();
    } else if (val.length > 1) {
      val = val.charAt(0).toUpperCase() + val.slice(1);
    }
    setNickname(val);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50
                    bg-black/45 backdrop-blur-[2px] p-4">
      <div className="bg-gradient-to-br from-blue-700 via-purple-700 to-indigo-800
                      rounded-2xl shadow-2xl shadow-black/50
                      w-full max-w-md p-6 flex flex-col gap-6 animate-fadeIn">

        <h2 className="text-3xl font-extrabold text-white text-center drop-shadow-lg">
          Настройка профиля
        </h2>

        {/* Аватар по центру с динамическим текстом */}
        <div className="flex justify-center relative">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-full w-36 h-36 flex items-center justify-center cursor-pointer overflow-hidden relative
                        ${!isAvatarValid && touched ? "border-red-300" : "border-white/50"}`}
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
                  onClick={handleRemoveAvatar}
                  className="absolute top-1 right-1 bg-white rounded-full w-7 h-7 flex items-center justify-center text-gray-700 shadow-md hover:bg-gray-100"
                  type="button"
                >
                  ✕
                </button>
              </>
            ) : (
              // Абсолютный текст внутри кружка, не дергает контент
              <p
                className={`absolute text-center px-3 text-sm text-center
                  ${!isAvatarValid && touched ? "text-red-200" : "text-white"}`}
              >
                {isDragActive
                  ? "Отпустите файл"
                  : !isAvatarValid && touched
                  ? "Аватар обязателен"
                  : "Перетащите или выберите"}
              </p>
            )}
          </div>
        </div>

        {/* Nickname */}
        <div className="flex flex-col gap-1 relative">
          <input
            className={`w-full border rounded-lg px-4 py-3
                        text-white bg-white/20 font-medium
                        focus:outline focus:outline-2 focus:outline-white/50
                        placeholder:text-white/80
                        ${!isNicknameValid && touched ? "border-red-300" : "border-transparent"}`}
            placeholder="Введите ник"
            value={nickname}
            onChange={handleNicknameChange}
            onBlur={() => setTouched(true)}
          />
          {/* Абсолютный текст ошибки */}
          <p className={`absolute bottom-[-1.2rem] left-2 text-red-200 text-[12px]`}>
            {!isNicknameValid && touched ? "Ник должен быть не менее 5 букв" : ""}
          </p>
        </div>

        {/* Кнопки */}
        <div className="flex justify-between gap-3">
          <AppButton
            variant="secondary"
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl font-semibold"
          >
            Отмена
          </AppButton>
          <AppButton
            variant="accent"
            onClick={handleSave}
            className="flex-1 px-6 py-3 rounded-xl font-semibold"
          >
            Сохранить
          </AppButton>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
