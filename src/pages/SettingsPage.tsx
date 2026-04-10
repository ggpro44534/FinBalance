import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Select from "../components/ui/Select";

import { financeService } from "../services/FinanceService";
import type {
  AppCurrency,
  DateFormat,
  Language,
  SettingsProps,
  StartPage,
  Theme,
} from "../models/Settings";
import { useFinanceStore } from "../store/financeStore";
import { useI18n } from "../i18n";
import {
  getCurrencyOptionLabel,
  SUPPORTED_CURRENCIES,
} from "../lib/utils";

type Status = { type: "success" | "error"; message: string } | null;

type DraftSettings = Omit<SettingsProps, "id">;

function toDraft(settings: SettingsProps): DraftSettings {
  return {
    firstDayOfWeek: settings.firstDayOfWeek,
    theme: settings.theme,
    language: settings.language,
    baseCurrency: settings.baseCurrency,
    dateFormat: settings.dateFormat,
    showDecimals: settings.showDecimals,
    confirmBeforeDelete: settings.confirmBeforeDelete,
    startPage: settings.startPage,
  };
}

export default function SettingsPage() {
  const { settings, refresh } = useFinanceStore();
  const { t } = useI18n();
  const [status, setStatus] = useState<Status>(null);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [draft, setDraft] = useState<DraftSettings>(() =>
    toDraft({
      id: settings.id,
      firstDayOfWeek: settings.firstDayOfWeek,
      theme: settings.theme,
      language: settings.language,
      baseCurrency: settings.baseCurrency,
      dateFormat: settings.dateFormat,
      showDecimals: settings.showDecimals,
      confirmBeforeDelete: settings.confirmBeforeDelete,
      startPage: settings.startPage,
    })
  );

  useEffect(() => {
    setDraft(
      toDraft({
        id: settings.id,
        firstDayOfWeek: settings.firstDayOfWeek,
        theme: settings.theme,
        language: settings.language,
        baseCurrency: settings.baseCurrency,
        dateFormat: settings.dateFormat,
        showDecimals: settings.showDecimals,
        confirmBeforeDelete: settings.confirmBeforeDelete,
        startPage: settings.startPage,
      })
    );
  }, [settings]);

  const setField = <K extends keyof DraftSettings>(
    key: K,
    value: DraftSettings[K]
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleApply = async () => {
    setStatus(null);
    setSaving(true);

    try {
      await financeService.updateSettings(draft);
      await refresh();
      setStatus({ type: "success", message: t("settings.saved") });
    } catch {
      setStatus({ type: "error", message: t("settings.saveError") });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm(t("settings.resetConfirm"))) {
      return;
    }

    setStatus(null);
    setResetting(true);

    try {
      await financeService.resetToFirstLaunch();
      await refresh();
      setStatus({ type: "success", message: t("settings.resetSuccess") });
    } catch {
      setStatus({ type: "error", message: t("settings.resetError") });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t("settings.title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("settings.subtitle")}
        </p>
      </div>

      <Card className="space-y-5 p-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t("settings.general")}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("settings.generalSubtitle")}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t("settings.language")}
            </div>
            <div className="mt-2 w-full sm:max-w-xs">
              <Select
                value={draft.language}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setField("language", e.target.value as Language)
                }
              >
                <option value="uk">Українська</option>
                <option value="en">English</option>
                <option value="cs">Čeština</option>
              </Select>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t("settings.dateFormat")}
            </div>
            <div className="mt-2 w-full sm:max-w-xs">
              <Select
                value={draft.dateFormat}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setField("dateFormat", e.target.value as DateFormat)
                }
              >
                <option value="dd.MM.yyyy">dd.MM.yyyy</option>
                <option value="yyyy-MM-dd">yyyy-MM-dd</option>
              </Select>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t("settings.baseCurrency")}
            </div>
            <div className="mt-2 w-full sm:max-w-xs">
              <Select
                value={draft.baseCurrency}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setField("baseCurrency", e.target.value as AppCurrency)
                }
              >
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {getCurrencyOptionLabel(currency)}
                  </option>
                ))}
              </Select>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {t("settings.baseCurrencyHint")}
            </p>
          </div>

          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t("settings.firstDay")}
            </div>
            <div className="mt-2 w-full sm:max-w-xs">
              <Select
                value={String(draft.firstDayOfWeek)}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setField("firstDayOfWeek", Number(e.target.value) as 1 | 7)
                }
              >
                <option value="1">{t("settings.monday")}</option>
                <option value="7">{t("settings.sunday")}</option>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <Card className="space-y-5 p-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t("settings.interface")}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("settings.interfaceSubtitle")}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t("settings.theme")}
            </div>
            <div className="mt-2 w-full sm:max-w-xs">
              <Select
                value={draft.theme}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setField("theme", e.target.value as Theme)
                }
              >
                <option value="system">{t("settings.systemTheme")}</option>
                <option value="light">{t("settings.lightTheme")}</option>
                <option value="dark">{t("settings.darkTheme")}</option>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
            <input
              id="showDecimals"
              type="checkbox"
              checked={draft.showDecimals}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setField("showDecimals", e.target.checked)
              }
              className="h-4 w-4 cursor-pointer accent-slate-900 dark:accent-slate-100"
            />
            <label
              htmlFor="showDecimals"
              className="flex-1 cursor-pointer text-sm font-medium text-slate-900 dark:text-slate-100"
            >
              {t("settings.showDecimals")}
            </label>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {draft.showDecimals ? t("common.enabled") : t("common.disabled")}
            </span>
          </div>
        </div>
      </Card>

      <Card className="space-y-5 p-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t("settings.behavior")}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("settings.behaviorSubtitle")}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t("settings.startPage")}
            </div>
            <div className="mt-2 w-full sm:max-w-xs">
              <Select
                value={draft.startPage}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setField("startPage", e.target.value as StartPage)
                }
              >
                <option value="dashboard">{t("nav.dashboard")}</option>
                <option value="transactions">{t("nav.transactions")}</option>
                <option value="accounts">{t("nav.accounts")}</option>
                <option value="savings">{t("nav.savings")}</option>
              </Select>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t("settings.startPageHint")}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
            <input
              id="confirmBeforeDelete"
              type="checkbox"
              checked={draft.confirmBeforeDelete}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setField("confirmBeforeDelete", e.target.checked)
              }
              className="h-4 w-4 cursor-pointer accent-slate-900 dark:accent-slate-100"
            />
            <label
              htmlFor="confirmBeforeDelete"
              className="flex-1 cursor-pointer text-sm font-medium text-slate-900 dark:text-slate-100"
            >
              {t("settings.confirmBeforeDelete")}
            </label>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {draft.confirmBeforeDelete
                ? t("common.enabled")
                : t("common.disabled")}
            </span>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t("settings.info")}
          </h2>
        </div>

        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <div>
            <span className="font-medium">{t("settings.version")}:</span> 1.0.0
          </div>
          <div>
            <span className="font-medium">{t("settings.currentLanguage")}:</span>{" "}
            {draft.language === "uk"
              ? "Українська"
              : draft.language === "en"
              ? "English"
              : "Čeština"}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2 xs:flex-row">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleApply}
            disabled={saving || resetting}
          >
            {saving ? `${t("common.applyChanges")}...` : t("common.applyChanges")}
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleReset}
            disabled={saving || resetting}
          >
            {resetting
              ? `${t("common.resetFirstLaunch")}...`
              : t("common.resetFirstLaunch")}
          </Button>
        </div>

        {status && (
          <div
            className={[
              "rounded-2xl border p-4 text-sm",
              status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
            ].join(" ")}
          >
            {status.message}
          </div>
        )}
      </Card>
    </div>
  );
}
