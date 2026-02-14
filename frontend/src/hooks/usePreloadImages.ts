import { useState, useEffect } from "react";

export const usePreloadImages = (urls: string[]) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let count = 0;
    const images: HTMLImageElement[] = [];

    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        count += 1;
        if (count === urls.length) setLoaded(true);
      };
      images.push(img);
    });

    return () => {
      // очистка
      images.forEach((img) => (img.onload = null));
    };
  }, [urls]);

  return loaded;
};
