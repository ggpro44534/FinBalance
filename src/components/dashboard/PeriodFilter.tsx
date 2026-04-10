import Select from "../ui/Select";
import { useI18n } from "../../i18n";

export type PeriodType = "current-month" | "last-3-months" | "year";

type PeriodFilterProps = {
  value: PeriodType;
  onChange: (value: PeriodType) => void;
};

export default function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const { t } = useI18n();

  return (
    <Select value={value} onChange={(e) => onChange(e.target.value as PeriodType)}>
      <option value="current-month">{t("dashboard.filter.period.currentMonth")}</option>
      <option value="last-3-months">{t("dashboard.filter.period.last3months")}</option>
      <option value="year">{t("dashboard.filter.period.year")}</option>
    </Select>
  );
}
