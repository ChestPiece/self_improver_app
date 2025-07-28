"use client";

import { motion } from "framer-motion";

interface AuthPageClientProps {
  children: React.ReactNode;
}

export default function AuthPageClient({ children }: AuthPageClientProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
