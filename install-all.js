import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folders = ["", "frontend", "backend"];

for (const folder of folders) {
  const folderPath = path.resolve(__dirname, folder);
  console.log(`\n Устанавливаем зависимости в: ${folderPath}`);
  try {
    execSync("npm install", { cwd: folderPath, stdio: "inherit" });
    console.log(`Зависимости установлены в ${folderPath}`);
  } catch (err) {
    console.error(`Ошибка установки в ${folderPath}`);
    process.exit(1);
  }
}

console.log("\n Все зависимости установлены!");
