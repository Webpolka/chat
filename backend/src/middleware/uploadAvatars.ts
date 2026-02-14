import multer from "multer";

const storage = multer.memoryStorage(); // в RAM -> sharp -> файл

export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5mb
  },
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Только изображения"));
  },
}).single("avatar");
