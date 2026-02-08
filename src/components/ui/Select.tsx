import type { SelectHTMLAttributes } from "react";

export default function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={[
        "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none",
        "focus:ring-2 focus:ring-slate-300",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
