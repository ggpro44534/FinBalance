import type { PropsWithChildren } from "react";

export default function Card({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={["rounded-2xl border bg-white shadow-sm", className].join(" ")}>
      {children}
    </div>
  );
}
