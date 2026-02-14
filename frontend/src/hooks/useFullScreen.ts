import { useState, useEffect, useCallback } from "react";

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(
    Boolean(document.fullscreenElement)
  );


  // Слежка за изменением fullscreen
  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Открыть fullscreen
  const openFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error("Не удалось войти в fullscreen:", err);
      });
       setIsFullscreen(true); 
    }
  }, []);

  // Закрыть fullscreen
  const closeFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.error("Не удалось выйти из fullscreen:", err);
      });
      setIsFullscreen(false); 
    }
  }, []);

  return { isFullscreen, openFullscreen, closeFullscreen };
}
