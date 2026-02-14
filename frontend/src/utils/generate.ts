/**
 * Генерирует случайный ID
 * @param length - длина ID (по умолчанию 4)
 * @param chars - набор символов для генерации (по умолчанию цифры 0-9)
 * @returns случайный ID
 */
export function generateId(
  length: number = 4,
  chars: string = "0123456789"
): string {
  let id = "";
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * chars.length);
    id += chars[index];
  }
  return id;
}
