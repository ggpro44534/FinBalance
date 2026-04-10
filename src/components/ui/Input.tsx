import type { InputHTMLAttributes } from "react";

export default function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={[
        "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 outline-none sm:text-sm",
        "placeholder:text-slate-400 focus:ring-2 focus:ring-slate-300",
        "dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-slate-700",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
