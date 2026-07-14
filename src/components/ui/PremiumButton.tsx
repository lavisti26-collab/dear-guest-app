import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface PremiumButtonProps {
  children: React.ReactNode;
  variant?: "apple" | "pill" | "sharp" | "glass" | "neo";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const variantStyles: Record<string, string> = {
  apple:
    "bg-primary text-primary-foreground rounded-[var(--radius)] px-6 py-3 font-medium shadow-sm",
  pill:
    "bg-card text-foreground rounded-full px-8 py-3 border border-border shadow-sm",
  sharp:
    "bg-foreground text-background rounded-none px-6 py-3 font-medium uppercase tracking-wider",
  glass:
    "bg-card/60 backdrop-blur-md text-foreground rounded-[var(--radius)] px-6 py-3 border border-white/20 dark:border-white/10 shadow-sm",
  neo:
    "bg-card text-foreground rounded-[var(--radius)] px-6 py-3 border-2 border-foreground/20 shadow-[3px_3px_0px_0px_hsl(var(--foreground))] dark:shadow-[3px_3px_0px_0px_hsl(var(--foreground))] font-bold",
};

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ children, variant = "apple", className, disabled, onClick }, ref) => {
    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-all duration-300",
          variantStyles[variant] || variantStyles.apple,
          className
        )}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
        }}
      >
        {children}
      </motion.button>
    );
  }
);

PremiumButton.displayName = "PremiumButton";

export default PremiumButton;
