import type { PropsWithChildren } from "react";

export default function Modal({
  open,
  title,
  onClose,
  children,
}: PropsWithChildren<{ open: boolean; title: string; onClose: () => void }>) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl border">
        <div className="px-5 py-4 border-b">
          <div className="font-semibold">{title}</div>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
