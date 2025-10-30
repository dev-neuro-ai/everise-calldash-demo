import { motion } from "framer-motion";

export function LoadingDots() {
  const dotVariants = {
    initial: { opacity: 0, y: 0 },
    animate: {
      opacity: [0, 1, 0],
      y: [0, -5, 0],
      transition: {
        repeat: Infinity,
        duration: 1,
      },
    },
  };

  return (
    <div className="flex gap-1 justify-center items-center h-6">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          className="w-2 h-2 bg-white rounded-full"
          transition={{
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}
