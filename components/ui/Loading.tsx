"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  show: boolean;
  text?: string;
}

export default function LoadingOverlay({ show, text }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-3" />
            <p className="text-gray-700 font-medium text-sm">
              {text || "Loading..."}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
