import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Select from "../components/ui/Select";
import CategoryAppearancePicker from "../components/categories/CategoryAppearancePicker";

import { useFinanceStore } from "../store/financeStore";
import { financeService } from "../services/FinanceService";
import { useI18n } from "../i18n";
import type { AppCurrency } from "../models/Settings";
import {
  convertCurrency,
  formatCurrency,
  formatDate,
  getCurrencyOptionLabel,
  SUPPORTED_CURRENCIES,
  toISODate,
} from "../lib/utils";

type GoalDraft = {
  id?: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  currency: string;
  targetDate: string;
  note: string;
  emoji: string;
  color: string;
  isArchived: boolean;
};

const EMPTY_DRAFT: GoalDraft = {
  name: "",
  targetAmount: "",
  currentAmount: "",
  currency: "UAH",
  targetDate: "",
  note: "",
  emoji: "🎯",
  color: "#6366f1",
  isArchived: false,
};

export default function SavingsPage() {
  const { savingsGoals, accounts, settings } = useFinanceStore();
  const { t } = useI18n();
  const [editorOpen, setEditorOpen] = useState(false);
  const [contributionOpen, setContributionOpen] = useState(false);
  const [draft, setDraft] = useState<GoalDraft>(EMPTY_DRAFT);
  const [contributionAmount, setContributionAmount] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const currencies = useMemo(
    () =>
      Array.from(
        new Set([
          settings.baseCurrency,
          ...SUPPORTED_CURRENCIES,
          ...accounts.map((account) => account.currency),
        ])
      ).sort(),
    [accounts, settings.baseCurrency]
  );

  const activeGoals = savingsGoals.filter((goal) => !goal.isArchived);
  const archivedGoals = savingsGoals.filter((goal) => goal.isArchived);
  const totalTarget = activeGoals.reduce(
    (sum, goal) =>
      sum + convertCurrency(goal.targetAmount, goal.currency, settings.baseCurrency),
    0
  );
  const totalSaved = activeGoals.reduce(
    (sum, goal) =>
      sum + convertCurrency(goal.currentAmount, goal.currency, settings.baseCurrency),
    0
  );

  const closeEditor = () => {
    setEditorOpen(false);
    setDraft(EMPTY_DRAFT);
  };

  const closeContribution = () => {
    setContributionOpen(false);
    setContributionAmount("");
    setSelectedGoalId(null);
  };

  const openCreate = () => {
    setDraft({
      ...EMPTY_DRAFT,
      currency: settings.baseCurrency,
    });
    setEditorOpen(true);
  };

  const openEdit = (goalId: string) => {
    const goal = savingsGoals.find((item) => item.id === goalId);
    if (!goal) return;

    setDraft({
      id: goal.id,
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount),
      currency: goal.currency,
      targetDate: goal.targetDate ?? "",
      note: goal.note ?? "",
      emoji: goal.emoji ?? "🎯",
      color: goal.color ?? "#6366f1",
      isArchived: goal.isArchived,
    });
    setEditorOpen(true);
  };

  const openContribution = (goalId: string) => {
    setSelectedGoalId(goalId);
    setContributionOpen(true);
  };

  const saveGoal = async () => {
    const targetAmount = Number(draft.targetAmount);
    const currentAmount = Number(draft.currentAmount || 0);
    if (!draft.name.trim() || !Number.isFinite(targetAmount) || targetAmount <= 0) {
      return;
    }

    if (draft.id) {
      await financeService.updateSavingsGoal(draft.id, {
        name: draft.name.trim(),
        targetAmount,
        currentAmount: Math.max(0, currentAmount),
        currency: draft.currency,
        targetDate: draft.targetDate || undefined,
        note: draft.note.trim() || undefined,
        emoji: draft.emoji || "🎯",
        color: draft.color || "#6366f1",
        isArchived: draft.isArchived,
      });
    } else {
      await financeService.addSavingsGoal({
        name: draft.name.trim(),
        targetAmount,
        currentAmount: Math.max(0, currentAmount),
        currency: draft.currency,
        targetDate: draft.targetDate || undefined,
        note: draft.note.trim() || undefined,
        emoji: draft.emoji || "🎯",
        color: draft.color || "#6366f1",
        isArchived: false,
      });
    }

    closeEditor();
  };

  const applyContribution = async () => {
    const amount = Number(contributionAmount);
    if (!selectedGoalId || !Number.isFinite(amount) || amount === 0) {
      return;
    }

    await financeService.contributeToSavingsGoal(selectedGoalId, amount);
    closeContribution();
  };

  const removeGoal = async (goalId: string) => {
    if (settings.confirmBeforeDelete) {
      const shouldDelete = window.confirm(t("savings.deleteConfirm"));
      if (!shouldDelete) return;
    }

    await financeService.deleteSavingsGoal(goalId);
  };

  const toggleArchive = async (goalId: string, isArchived: boolean) => {
    await financeService.updateSavingsGoal(goalId, { isArchived: !isArchived });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t("savings.title")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("savings.subtitle")}
          </p>
        </div>

        <Button className="w-full sm:w-auto" onClick={openCreate}>
          {t("savings.add")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="text-sm text-slate-500 dark:text-slate-400">{t("savings.activeGoals")}</div>
          <div className="mt-2 text-3xl font-semibold">{activeGoals.length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-500 dark:text-slate-400">{t("savings.totalSaved")}</div>
          <div className="mt-2 text-3xl font-semibold">
            {formatCurrency(totalSaved, settings.baseCurrency, {
              showDecimals: settings.showDecimals,
              language: settings.language,
            })}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-500 dark:text-slate-400">{t("savings.totalTarget")}</div>
          <div className="mt-2 text-3xl font-semibold">
            {formatCurrency(totalTarget, settings.baseCurrency, {
              showDecimals: settings.showDecimals,
              language: settings.language,
            })}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {activeGoals.map((goal) => {
          const progress = goal.getProgressPercentage();
          return (
            <Card key={goal.id} className="overflow-hidden">
              <div
                className="p-5"
                style={{
                  background: `linear-gradient(135deg, ${goal.color ?? "#6366f1"}16, transparent 60%)`,
                }}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                        style={{ backgroundColor: `${goal.color ?? "#6366f1"}22` }}
                      >
                        {goal.emoji ?? "🎯"}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {goal.name}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {goal.targetDate
                            ? `${t("savings.targetDate")}: ${formatDate(
                                goal.targetDate,
                                settings.dateFormat,
                                settings.language
                              )}`
                            : t("savings.noTargetDate")}
                        </div>
                      </div>
                    </div>

                    {goal.note && (
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{goal.note}</p>
                    )}

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">{t("savings.progress")}</span>
                        <span className="font-medium">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: goal.color ?? "#6366f1",
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{t("savings.saved")}</div>
                        <div className="font-semibold">
                          {formatCurrency(goal.currentAmount, goal.currency, {
                            showDecimals: settings.showDecimals,
                            language: settings.language,
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{t("savings.goal")}</div>
                        <div className="font-semibold">
                          {formatCurrency(goal.targetAmount, goal.currency, {
                            showDecimals: settings.showDecimals,
                            language: settings.language,
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{t("savings.remaining")}</div>
                        <div className="font-semibold">
                          {formatCurrency(goal.getRemainingAmount(), goal.currency, {
                            showDecimals: settings.showDecimals,
                            language: settings.language,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                    <Button className="w-full sm:w-auto" onClick={() => openContribution(goal.id)}>
                      {t("savings.addFunds")}
                    </Button>
                    <Button variant="secondary" className="w-full sm:w-auto" onClick={() => openEdit(goal.id)}>
                      {t("categories.edit")}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full sm:w-auto"
                      onClick={() => toggleArchive(goal.id, goal.isArchived)}
                    >
                      {t("savings.archive")}
                    </Button>
                    <Button variant="danger" className="w-full sm:w-auto" onClick={() => removeGoal(goal.id)}>
                      {t("common.delete")}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {activeGoals.length === 0 && (
          <Card className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {t("savings.empty")}
          </Card>
        )}
      </div>

      {archivedGoals.length > 0 && (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t("savings.archived")}
          </h2>
          <div className="mt-3 space-y-2">
            {archivedGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="font-medium">
                    {(goal.emoji ?? "🎯") + " " + goal.name}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {formatCurrency(goal.currentAmount, goal.currency, {
                      showDecimals: settings.showDecimals,
                      language: settings.language,
                    })}
                  </div>
                </div>
                <Button variant="secondary" className="w-full sm:w-auto" onClick={() => toggleArchive(goal.id, true)}>
                  {t("savings.restore")}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={editorOpen} title={draft.id ? t("savings.editGoal") : t("savings.newGoal")} onClose={closeEditor}>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400">{t("savings.goalName")}</div>
            <div className="mt-2">
              <Input
                value={draft.name}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setDraft((current) => ({ ...current, name: event.target.value }))
                }
                placeholder={t("savings.goalPlaceholder")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{t("savings.goal")}</div>
              <div className="mt-2">
                <Input
                  inputMode="decimal"
                  value={draft.targetAmount}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setDraft((current) => ({ ...current, targetAmount: event.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{t("savings.saved")}</div>
              <div className="mt-2">
                <Input
                  inputMode="decimal"
                  value={draft.currentAmount}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setDraft((current) => ({ ...current, currentAmount: event.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{t("accounts.currency")}</div>
              <div className="mt-2">
                <Select
                  value={draft.currency}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    setDraft((current) => ({ ...current, currency: event.target.value }))
                  }
                >
                  {currencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {getCurrencyOptionLabel(currency as AppCurrency)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{t("savings.targetDate")}</div>
              <div className="mt-2">
                <Input
                  type="date"
                  min={toISODate()}
                  value={draft.targetDate}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setDraft((current) => ({ ...current, targetDate: event.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400">{t("transactions.note")}</div>
            <div className="mt-2">
              <Input
                value={draft.note}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setDraft((current) => ({ ...current, note: event.target.value }))
                }
                placeholder={t("savings.notePlaceholder")}
              />
            </div>
          </div>

          <CategoryAppearancePicker
            emoji={draft.emoji}
            color={draft.color}
            onEmojiChange={(value) => setDraft((current) => ({ ...current, emoji: value }))}
            onColorChange={(value) => setDraft((current) => ({ ...current, color: value }))}
          />

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" className="w-full sm:w-auto" onClick={closeEditor}>
              {t("common.cancel")}
            </Button>
            <Button className="w-full sm:w-auto" onClick={saveGoal}>
              {draft.id ? t("common.save") : t("common.create")}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={contributionOpen} title={t("savings.addFunds")} onClose={closeContribution}>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400">{t("savings.contributionAmount")}</div>
            <div className="mt-2">
              <Input
                inputMode="decimal"
                value={contributionAmount}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setContributionAmount(event.target.value)
                }
                placeholder="1000"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {t("savings.contributionHint")}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" className="w-full sm:w-auto" onClick={closeContribution}>
              {t("common.cancel")}
            </Button>
            <Button className="w-full sm:w-auto" onClick={applyContribution}>
              {t("common.save")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
