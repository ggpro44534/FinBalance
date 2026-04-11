import type { PropsWithChildren } from "react";

export default function Card({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={[
        "rounded-2xl border border-slate-200 bg-white text-slate-900",
        "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
