import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SkeletonLoaderProps {
  variant?: "card" | "text" | "avatar" | "image" | "timeline";
  className?: string;
  count?: number;
}

const shimmerProps = {
  initial: { x: "100%" },
  animate: { x: "-100%" },
  transition: { repeat: Infinity, duration: 1.5, ease: [0.4, 0, 0.2, 1] },
};

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant = "card", className, count = 1 }) => {
  switch (variant) {
    case "card":
      return (<div className={cn("relative overflow-hidden rounded-[var(--radius)] bg-card border border-border p-6 space-y-4", className)}><div className="h-40 w-full rounded-[var(--radius)] bg-muted" /><div className="space-y-3"><div className="h-4 w-3/4 rounded-[var(--radius)] bg-muted" /><div className="h-4 w-1/2 rounded-[var(--radius)] bg-muted" /></div><div className="absolute inset-0 w-full h-full overflow-hidden"><motion.div className="h-full w-full bg-gradient-to-r from-transparent via-card/80 to-transparent" {...shimmerProps} /></div></div>);
    case "text":
      return (<div className={cn("space-y-3", className)}>{Array.from({ length: count }).map((_, i) => (<div key={i} className="relative overflow-hidden"><div className={cn(i === count - 1 ? "h-4 w-1/3" : "h-4 w-full", "rounded-[var(--radius)] bg-muted")} /><div className="absolute inset-0 w-full h-full overflow-hidden"><motion.div className="h-full w-full bg-gradient-to-r from-transparent via-muted/50 to-transparent" {...shimmerProps} /></div></div>))}</div>);
    case "avatar":
      return (<div className={cn("flex items-center gap-4", className)}><div className="relative overflow-hidden rounded-full w-12 h-12 flex-shrink-0"><div className="w-full h-full rounded-full bg-muted" /><div className="absolute inset-0 w-full h-full overflow-hidden"><motion.div className="h-full w-full bg-gradient-to-r from-transparent via-muted/50 to-transparent" {...shimmerProps} /></div></div><div className="space-y-2 flex-1"><div className="relative overflow-hidden h-4 w-3/4 rounded-[var(--radius)]"><div className="w-full h-full rounded-[var(--radius)] bg-muted" /><div className="absolute inset-0 w-full h-full overflow-hidden"><motion.div className="h-full w-full bg-gradient-to-r from-transparent via-muted/50 to-transparent" {...shimmerProps} /></div></div><div className="relative overflow-hidden h-3 w-1/2 rounded-[var(--radius)]"><div className="w-full h-full rounded-[var(--radius)] bg-muted" /><div className="absolute inset-0 w-full h-full overflow-hidden"><motion.div className="h-full w-full bg-gradient-to-r from-transparent via-muted/50 to-transparent" {...shimmerProps} /></div></div></div></div>);
    case "image":
      return (<div className={cn("relative overflow-hidden rounded-[var(--radius)] bg-card border border-border", className)}><div className="aspect-[3/2]" /><div className="absolute inset-0 w-full h-full bg-muted" /><div className="absolute inset-0 w-full h-full overflow-hidden"><motion.div className="h-full w-full bg-gradient-to-r from-transparent via-card/80 to-transparent" {...shimmerProps} /></div></div>);
    case "timeline":
      return (<div className={cn("space-y-6", className)}>{Array.from({ length: count }).map((_, i) => (<div key={i} className="flex gap-4 items-start"><div className="relative overflow-hidden rounded-full w-8 h-8 flex-shrink-0 mt-1"><div className="w-full h-full rounded-full bg-muted" /><div className="absolute inset-0 w-full h-full overflow-hidden"><motion.div className="h-full w-full bg-gradient-to-r from-transparent via-muted/50 to-transparent" {...shimmerProps} /></div></div><div className="space-y-2 flex-1"><div className="relative overflow-hidden h-4 w-full rounded-[var(--radius)]"><div className="w-full h-full rounded-[var(--radius)] bg-muted" /><div className="absolute inset-0 w-full h-full overflow-hidden"><motion.div className="h-full w-full bg-gradient-to-r from-transparent via-muted/50 to-transparent" {...shimmerProps} /></div></div><div className="relative overflow-hidden h-3 w-2/3 rounded-[var(--radius)]"><div className="w-full h-full rounded-[var(--radius)] bg-muted" /><div className="absolute inset-0 w-full h-full overflow-hidden"><motion.div className="h-full w-full bg-gradient-to-r from-transparent via-muted/50 to-transparent" {...shimmerProps} /></div></div></div></div>))}</div>);
    default: return null;
  }
};

export default SkeletonLoader;
