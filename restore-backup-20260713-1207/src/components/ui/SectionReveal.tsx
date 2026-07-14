import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SectionRevealProps {
  children: React.ReactNode;
  animation?: "fade" | "slide-up" | "scale" | "flip";
  delay?: number;
  duration?: number;
  once?: boolean;
  threshold?: number;
  className?: string;
}

const animationVariants: Record<string, { initial: Record<string, unknown>; animate: Record<string, unknown> }> = {
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  "slide-up": { initial: { opacity: 0, y: 60 }, animate: { opacity: 1, y: 0 } },
  scale: { initial: { opacity: 0, scale: 0.85 }, animate: { opacity: 1, scale: 1 } },
  flip: { initial: { opacity: 0, rotateX: -90, perspective: 1000 }, animate: { opacity: 1, rotateX: 0, perspective: 1000 } },
};

const SectionReveal: React.FC<SectionRevealProps> = ({
  children,
  animation = "slide-up",
  delay = 0,
  duration = 0.6,
  once = true,
  threshold = 0.1,
  className,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold]);

  const variant = animationVariants[animation] || animationVariants["slide-up"];

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <AnimatePresence mode="wait">
        {isInView && (
          <motion.div
            key={animation}
            initial={variant.initial}
            animate={variant.animate}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SectionReveal;
