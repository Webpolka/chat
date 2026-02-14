// shared/lib/formatTime.ts

/**
 * ==========================================================
 * Преобразует секунды в формат MM:SS
 * ==========================================================
*/

export const formatTime = (time: number) => {
  // --- Приводим время к секундам
  const totalSeconds = Math.floor(time / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const formattedTime =
    hours > 0
      ? `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      : `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;
  return formattedTime;
};
