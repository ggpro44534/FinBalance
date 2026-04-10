import type { SelectHTMLAttributes } from "react";

export default function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={[
        "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 outline-none sm:text-sm",
        "focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-slate-700",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
