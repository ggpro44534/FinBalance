import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const styles: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200",
  secondary:
    "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
};

export default function Button({ variant = "primary", className = "", ...props }: Props) {
  return (
    <button
      className={[
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        styles[variant],
        className,
      ].join(" ")}
      {...props}
    />
  );
}
