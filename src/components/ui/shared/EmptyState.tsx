export default function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border bg-white p-6 text-center">
      <div className="text-lg font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-500">{text}</div>
    </div>
  );
}
