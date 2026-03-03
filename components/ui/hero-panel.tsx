import { ReactNode } from "react";

type HeroPanelProps = {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export function HeroPanel({ title, description, children, className = "" }: HeroPanelProps) {
  return (
    <div className={`card-shell rounded-3xl p-6 md:p-7 ${className}`.trim()}>
      <h1 className="text-2xl font-extrabold">{title}</h1>
      {description ? <p className="mt-1 text-sm text-white/80">{description}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
