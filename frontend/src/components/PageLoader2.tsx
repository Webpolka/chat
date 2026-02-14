import { motion } from "framer-motion";

export const PageLoader2 = () => {
  // цвета для кружочков, можно менять на любые градиенты
  const colors = ["#FF8C42", "#FF3C38", "#FF6EC7", "#FFB347", "#FF4E50"];

  return (
    <motion.div
      className="flex items-center justify-center h-screen w-screen"
      style={{
        background: "linear-gradient(120deg, #ffffff, #1e3a8a, #4f46e5)",
      }}
      animate={{
        background: [
          "linear-gradient(120deg, #ffffff, #1e3a8a, #4f46e5)",
          "linear-gradient(120deg, #1e3a8a, #4f46e5, #93c5fd)",
          "linear-gradient(120deg, #ffffff, #4f46e5, #1e3a8a)",
        ],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      }}
    >
      <div className="relative flex gap-6">
        {colors.map((color, i) => (
          <motion.div
            key={i}
            className="w-6 h-6 rounded-full shadow-lg"
            style={{ background: color }}
            animate={{
              y: [0, -30, 0],
              scale: [1, 1.4, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "loop",
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};
