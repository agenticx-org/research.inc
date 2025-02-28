import { motion } from "framer-motion";

interface WordCountDisplayProps {
  wordCount: number;
  charCount: number;
}

export const WordCountDisplay = ({
  wordCount,
  charCount,
}: WordCountDisplayProps) => {
  return (
    <div className="sticky bottom-2 left-0 right-0 flex justify-center z-10">
      <motion.div
        className="text-xs text-white bg-black opacity-80 px-2 py-1 rounded-md shadow-sm"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 0.8 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2,
        }}
      >
        {wordCount} words | {charCount} characters
      </motion.div>
    </div>
  );
};
