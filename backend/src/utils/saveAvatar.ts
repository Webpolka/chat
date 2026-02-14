import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import sharp from "sharp";

// Получаем __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Папка для аватаров
const UPLOADS_DIR = path.join(__dirname, "../../../uploads");
const AVATARS_DIR = path.join(UPLOADS_DIR, "avatars");
fs.mkdirSync(AVATARS_DIR, { recursive: true });

export const saveAvatar = async (file: Express.Multer.File) => {
  // Проверка расширения
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = [".png", ".jpg", ".jpeg", ".webp"];
  if (!allowed.includes(ext)) {
    throw new Error("Неподдерживаемый формат файла");
  }

  // Генерация имени
  const baseName = path.basename(file.originalname, ext).split(" ").join("-");
  const fileName = `${Date.now()}-${baseName}.webp`;
  const filePath = path.join(AVATARS_DIR, fileName);

  // Ресайз и сохранение через sharp
  await sharp(file.buffer)
    .resize(256, 256)
    .webp({ quality: 80 })
    .toFile(filePath);

  // URL для фронта
  return `/uploads/avatars/${fileName}`;
};
