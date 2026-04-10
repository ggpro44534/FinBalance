import Card from "../ui/Card";

export type SummaryTone = "default" | "positive" | "negative";

type SummaryCardProps = {
  title: string;
  value: string;
  tone?: SummaryTone;
};

export default function SummaryCard({
  title,
  value,
  tone = "default",
}: SummaryCardProps) {
  const getToneClass = (tone: SummaryTone): string => {
    switch (tone) {
      case "positive":
        return "text-emerald-600 dark:text-emerald-400";
      case "negative":
        return "text-rose-600 dark:text-rose-400";
      default:
        return "text-slate-900 dark:text-slate-100";
    }
  };

  return (
    <Card className="p-5">
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className={`mt-1 break-words text-xl font-semibold sm:text-2xl ${getToneClass(tone)}`}>
        {value}
      </p>
    </Card>
  );
}
