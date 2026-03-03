import { ButtonHTMLAttributes, ReactNode } from "react";

type GradientButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "cyan" | "amber";
  full?: boolean;
};

const variantMap = {
  primary: "from-fuchsia-300 to-cyan-300 text-slate-900",
  cyan: "from-cyan-300 to-blue-400 text-slate-900",
  amber: "from-amber-300 to-pink-300 text-slate-900",
};

export function GradientButton({ children, variant = "primary", full = false, className = "", ...props }: GradientButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-full bg-gradient-to-r px-6 py-2 text-sm font-bold ${variantMap[variant]} ${full ? "w-full rounded-xl py-3" : ""} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
