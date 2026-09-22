"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type TemplateProps = {
  children: ReactNode;
};

export default function Template({ children }: TemplateProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
