import { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
};

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return <div className={`glass-box rounded-2xl p-4 ${className}`.trim()}>{children}</div>;
}
