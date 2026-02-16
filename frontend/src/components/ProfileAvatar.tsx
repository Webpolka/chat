import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface ProfileAvatarProps {
    avatarPreview: string;
    onChangeAvatar: (file: File | null, preview: string) => void;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
    avatarPreview,
    onChangeAvatar,
}) => {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                const preview = URL.createObjectURL(file);
                onChangeAvatar(file, preview);
            }
        },
        [onChangeAvatar]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
        maxFiles: 1,
    });

    const handleRemoveAvatar = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onChangeAvatar(null, "");
    };

    return (
        <div className="flex justify-center relative w-full">
            <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-full w-36 h-36 flex items-center justify-center cursor-pointer
    ${isDragActive ? "border-indigo-500" : "border-gray-300"}`}
            >
                <input {...getInputProps()} />
                {avatarPreview ? (
                    <>
                        <img
                            src={avatarPreview}
                            alt="avatar"
                            className="w-full h-full object-cover rounded-full overflow-hidden"
                        />
                        <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className="cursor-pointer absolute top-0 right-0 -translate-x-1/4 -translate-y-1/4 bg-white rounded-full w-7 h-7 flex items-center justify-center text-gray-700 shadow-md z-10"
                        >
                            ✕
                        </button>
                    </>
                ) : (
                    <p className="absolute text-center px-3 font-semibold text-gray-400 text-sm">
                        {isDragActive ? "Отпустите файл" : "Загрузите аватар"}
                    </p>
                )}
            </div>

        </div>
    );
};
