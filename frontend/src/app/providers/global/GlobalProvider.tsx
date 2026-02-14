import React from "react";
import { motion } from "framer-motion";
import { usePreloadImages } from "@/hooks/usePreloadImages";
import { PageLoader } from "@/components/PageLoader";
import OrientationGuard from "@/app/orientationGuard";

export const GlobalProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const imagesLoaded = usePreloadImages([
    '/images/login-bg.webp',
    '/images/modal-bg.webp'
  ]);

  if (!imagesLoaded) return <PageLoader />;

  return (
    <OrientationGuard>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </OrientationGuard>
  );
};
