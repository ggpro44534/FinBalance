import Input from "../ui/Input";
import { DEFAULT_CATEGORY_COLORS, DEFAULT_CATEGORY_EMOJIS } from "../../lib/categoryUtils";
import { useI18n } from "../../i18n";

type CategoryAppearancePickerProps = {
  emoji: string;
  color: string;
  onEmojiChange: (value: string) => void;
  onColorChange: (value: string) => void;
};

export default function CategoryAppearancePicker({
  emoji,
  color,
  onEmojiChange,
  onColorChange,
}: CategoryAppearancePickerProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {t("categories.emoji")}
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-2xl dark:border-slate-700 dark:bg-slate-800"
            style={{ boxShadow: `inset 0 0 0 2px ${color}22` }}
          >
            {emoji || "🏷️"}
          </div>
          <Input
            maxLength={3}
            value={emoji}
            onChange={(event) => onEmojiChange(event.target.value)}
            placeholder="🏷️"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {DEFAULT_CATEGORY_EMOJIS.map((presetEmoji) => (
            <button
              key={presetEmoji}
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
              onClick={() => onEmojiChange(presetEmoji)}
            >
              {presetEmoji}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {t("categories.color")}
        </div>
        <div className="mt-2 flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(event) => onColorChange(event.target.value)}
            className="h-12 w-12 cursor-pointer rounded-2xl border border-slate-200 bg-transparent p-1 dark:border-slate-700"
          />
          <Input value={color} onChange={(event) => onColorChange(event.target.value)} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {DEFAULT_CATEGORY_COLORS.map((presetColor) => (
            <button
              key={presetColor}
              type="button"
              aria-label={presetColor}
              className="h-9 w-9 rounded-full border-2 border-white ring-1 ring-slate-200 transition hover:scale-105 dark:border-slate-900 dark:ring-slate-700"
              style={{ backgroundColor: presetColor }}
              onClick={() => onColorChange(presetColor)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
