import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";
import CategoryAppearancePicker from "../components/categories/CategoryAppearancePicker";

import { useFinanceStore } from "../store/financeStore";
import { financeService } from "../services/FinanceService";
import { useI18n } from "../i18n";

import type { Category, CategoryKind, CategoryType } from "../models/Category";
import {
  getCategoryChildren,
  getCategoryDisplayName,
  getCategoryGroupsByType,
} from "../lib/categoryUtils";

type EditorMode = "create-group" | "create-subcategory" | "edit";

type EditorState = {
  mode: EditorMode;
  categoryId?: string;
  parentId?: string;
  name: string;
  type: CategoryType;
  kind: CategoryKind;
  emoji: string;
  color: string;
};

const DEFAULT_EDITOR_STATE: EditorState = {
  mode: "create-group",
  name: "",
  type: "expense",
  kind: "group",
  emoji: "🏷️",
  color: "#94a3b8",
};

export default function CategoriesPage() {
  const { categories, settings } = useFinanceStore();
  const { t, language } = useI18n();
  const [open, setOpen] = useState(false);
  const [editor, setEditor] = useState<EditorState>(DEFAULT_EDITOR_STATE);

  const expenseGroups = useMemo(
    () => getCategoryGroupsByType(categories, "expense"),
    [categories]
  );
  const incomeGroups = useMemo(
    () => getCategoryGroupsByType(categories, "income"),
    [categories]
  );

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
  );

  const closeModal = () => {
    setOpen(false);
    setEditor(DEFAULT_EDITOR_STATE);
  };

  const openCreateGroup = (type: CategoryType) => {
    setEditor({
      ...DEFAULT_EDITOR_STATE,
      mode: "create-group",
      type,
      kind: "group",
      emoji: type === "expense" ? "🧾" : "💰",
      color: type === "expense" ? "#f97316" : "#16a34a",
    });
    setOpen(true);
  };

  const openCreateSubcategory = (group: Category) => {
    setEditor({
      mode: "create-subcategory",
      parentId: group.id,
      name: "",
      type: group.type,
      kind: "subcategory",
      emoji: group.emoji ?? "🏷️",
      color: group.color ?? "#94a3b8",
    });
    setOpen(true);
  };

  const openEditCategory = (category: Category) => {
    setEditor({
      mode: "edit",
      categoryId: category.id,
      parentId: category.parentId,
      name: getCategoryDisplayName(category, language),
      type: category.type,
      kind: category.kind,
      emoji: category.emoji ?? "🏷️",
      color: category.color ?? "#94a3b8",
    });
    setOpen(true);
  };

  const onDeleteCategory = async (category: Category) => {
    if (!category.isDeletable()) {
      return;
    }

    if (settings.confirmBeforeDelete) {
      const shouldDelete = window.confirm(
        `${t("categories.confirmDelete")} ${t("categories.deleteNestedWarning")}`
      );
      if (!shouldDelete) return;
    }

    await financeService.deleteCategory(category.id);
  };

  const onSaveCategory = async () => {
    if (!editor.name.trim() && !(editor.mode === "edit" && categoryMap.get(editor.categoryId ?? "")?.isSystem)) {
      return;
    }

    if (editor.mode === "edit" && editor.categoryId) {
      const category = categoryMap.get(editor.categoryId);
      await financeService.updateCategory(editor.categoryId, {
        name: category?.isSystem && category.isGroup() ? category.name : editor.name.trim(),
        emoji: editor.emoji || "🏷️",
        color: editor.color || "#94a3b8",
      });
      closeModal();
      return;
    }

    await financeService.addCategory({
      name: editor.name.trim(),
      type: editor.type,
      kind: editor.kind,
      parentId: editor.parentId,
      emoji: editor.emoji || "🏷️",
      color: editor.color || "#94a3b8",
      isSystem: false,
      sortOrder: Date.now(),
    });
    closeModal();
  };

  const renderGroup = (group: Category) => {
    const subcategories = getCategoryChildren(group.id, categories);

    return (
      <Card key={group.id} className="overflow-hidden">
        <div
          className="p-5"
          style={{
            background: `linear-gradient(135deg, ${group.color ?? "#94a3b8"}18, transparent 60%)`,
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-sm"
                  style={{ backgroundColor: `${group.color ?? "#94a3b8"}22` }}
                >
                  {group.emoji ?? "📁"}
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {getCategoryDisplayName(group, language)}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {group.type === "expense" ? t("categories.expense") : t("categories.income")} ·{" "}
                    {subcategories.length} {t("categories.subcategoriesCount")}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" className="w-full sm:w-auto" onClick={() => openCreateSubcategory(group)}>
                {t("categories.addSubcategory")}
              </Button>
              <Button variant="ghost" className="w-full sm:w-auto" onClick={() => openEditCategory(group)}>
                {t("categories.edit")}
              </Button>
              {group.isDeletable() && (
                <Button
                  variant="danger"
                  className="w-full sm:w-auto"
                  onClick={() => onDeleteCategory(group)}
                >
                  {t("common.delete")}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {subcategories.map((subcategory) => (
              <button
                key={subcategory.id}
                type="button"
                onClick={() => openEditCategory(subcategory)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-left text-sm text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                <span className="text-lg">{subcategory.emoji ?? "🏷️"}</span>
                <span className="font-medium">
                  {getCategoryDisplayName(subcategory, language)}
                </span>
              </button>
            ))}

            {subcategories.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                {t("categories.noSubcategoriesHint")}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const editingCategory = editor.categoryId ? categoryMap.get(editor.categoryId) : null;
  const isSystemGroupEdit = Boolean(editingCategory?.isSystem && editingCategory.isGroup());

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t("categories.title")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("categories.hierarchyHint")}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button variant="secondary" className="w-full sm:w-auto" onClick={() => openCreateGroup("expense")}>
            {t("categories.newExpenseGroup")}
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => openCreateGroup("income")}>
            {t("categories.newIncomeGroup")}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💸</span>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t("categories.expense")}
          </h2>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {expenseGroups.map(renderGroup)}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💰</span>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t("categories.income")}
          </h2>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {incomeGroups.map(renderGroup)}
        </div>
      </div>

      <Modal
        open={open}
        title={
          editor.mode === "create-subcategory"
            ? t("categories.newSubcategory")
            : editor.mode === "create-group"
            ? t("categories.new")
            : t("categories.editCategory")
        }
        onClose={closeModal}
      >
        <div className="space-y-4">
          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400">{t("categories.type")}</div>
            <div className="mt-2">
              <Select
                value={editor.type}
                disabled={editor.mode !== "create-group"}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  setEditor((current) => ({
                    ...current,
                    type: event.target.value as CategoryType,
                  }))
                }
              >
                <option value="expense">{t("categories.expense")}</option>
                <option value="income">{t("categories.income")}</option>
              </Select>
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {editor.kind === "group" ? t("categories.groupName") : t("categories.subcategoryName")}
            </div>
            <div className="mt-2">
              <Input
                value={
                  isSystemGroupEdit
                    ? getCategoryDisplayName(editingCategory!, language)
                    : editor.name
                }
                disabled={isSystemGroupEdit}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setEditor((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder={t("categories.placeholder")}
              />
            </div>
            {isSystemGroupEdit && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {t("categories.systemGroupNameLocked")}
              </p>
            )}
          </div>

          <CategoryAppearancePicker
            emoji={editor.emoji}
            color={editor.color}
            onEmojiChange={(value) => setEditor((current) => ({ ...current, emoji: value }))}
            onColorChange={(value) => setEditor((current) => ({ ...current, color: value }))}
          />

          {editingCategory?.isSubcategory() && editingCategory.isDeletable() && (
            <Button
              variant="danger"
              className="w-full"
              onClick={async () => {
                await onDeleteCategory(editingCategory);
                closeModal();
              }}
            >
              {t("common.delete")}
            </Button>
          )}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" className="w-full sm:w-auto" onClick={closeModal}>
              {t("common.cancel")}
            </Button>
            <Button className="w-full sm:w-auto" onClick={onSaveCategory}>
              {editor.mode === "edit" ? t("common.save") : t("common.create")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
