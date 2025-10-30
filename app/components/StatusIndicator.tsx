import { motion } from "framer-motion";
import type { AgentState } from "@livekit/components-react";

export function StatusIndicator({ state }: { state: AgentState }) {
  const getStatusText = () => {
    switch (state) {
      case "listening":
        return "Listening...";
      case "thinking":
        return "Thinking...";
      case "speaking":
        return "Speaking...";
      case "connecting":
        return "Connecting...";
      default:
        return "";
    }
  };

  const getStatusColor = () => {
    switch (state) {
      case "listening":
        return "bg-blue-500";
      case "thinking":
        return "bg-indigo-500";
      case "speaking":
        return "bg-purple-500";
      case "connecting":
        return "bg-gray-400";
      default:
        return "bg-transparent";
    }
  };

  if (state === "disconnected") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-2 px-4 py-1 rounded-full bg-black/20 backdrop-blur-sm text-sm font-medium"
    >
      <motion.div 
        className={`w-2 h-2 rounded-full ${getStatusColor()}`}
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.2, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
        }}
      />
      <span>{getStatusText()}</span>
    </motion.div>
  );
}