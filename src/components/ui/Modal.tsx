import type { PropsWithChildren } from "react";

export default function Modal({
  open,
  title,
  onClose,
  children,
}: PropsWithChildren<{ open: boolean; title: string; onClose: () => void }>) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-auto my-6 w-full max-w-lg rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 sm:my-10">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="font-semibold">{title}</div>
        </div>
        <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto p-4 sm:p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
