import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface PremiumCardProps {
  children: React.ReactNode;
  variant?: "glass" | "luxury" | "minimal" | "flat" | "neo-brutalism";
  className?: string;
  onClick?: () => void;
  noAnimation?: boolean;
  animationDelay?: number;
}

const variantStyles: Record<string, string> = {
  glass:
    "bg-card/70 backdrop-blur-xl border border-white/20 shadow-lg dark:border-white/10",
  luxury:
    "bg-card border-2 border-[hsl(var(--card-border)/0.5)] shadow-xl",
  minimal:
    "bg-card border border-border/50 shadow-none",
  flat:
    "bg-card border border-border shadow-sm",
  "neo-brutalism":
    "bg-card border-2 border-foreground/20 shadow-[4px_4px_0px_0px_hsl(var(--foreground))] dark:shadow-[4px_4px_0px_0px_hsl(var(--foreground))]",
};

const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  (
    {
      children,
      variant = "glass",
      className,
      onClick,
      noAnimation = false,
      animationDelay = 0,
    },
    ref
  ) => {
    const style = {
      border: "var(--card-border)",
      boxShadow: "var(--card-shadow)",
    };

    const Component = motion.div;

    const motionProps = noAnimation
      ? {}
      : {
          initial: { opacity: 0, y: 20, scale: 0.97 },
          animate: { opacity: 1, y: 0, scale: 1 },
          transition: {
            type: "spring",
            stiffness: 120,
            damping: 20,
            delay: animationDelay,
          },
        };

    return (
      <Component
        ref={ref}
        style={style}
        onClick={onClick}
        className={cn(
          "rounded-[var(--radius)] p-6 transition-all duration-300 ease-out",
          variantStyles[variant] || variantStyles.glass,
          "hover:shadow-xl hover:-translate-y-0.5",
          onClick && "cursor-pointer",
          className
        )}
        {...motionProps}
      >
        {children}
      </Component>
    );
  }
);

PremiumCard.displayName = "PremiumCard";

export default PremiumCard;

