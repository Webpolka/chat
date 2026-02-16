import { useEffect } from "react";

export const useScrollbarPadding = (deps?: unknown) => {
  useEffect(() => {
    const update = () => {
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.paddingRight =
        scrollBarWidth > 0 ? `${scrollBarWidth}px` : "0px";
    };

    // первый запуск
    requestAnimationFrame(() => {
      requestAnimationFrame(update);
    });

    // при ресайзе
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
      document.body.style.paddingRight = "0px";
    };
  }, [deps]);
};
