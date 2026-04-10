import type { Category, CategoryProps, CategoryType } from "../models/Category";

type AppLanguage = "uk" | "en" | "cs";

type CategoryPreset = Omit<CategoryProps, "name"> & { name: string };

export const DEFAULT_CATEGORY_EMOJIS = [
  "🍔",
  "🛒",
  "🚗",
  "🏠",
  "💊",
  "🎓",
  "🎉",
  "💼",
  "💰",
  "🎁",
  "💸",
  "📦",
  "🧾",
  "🐾",
  "✈️",
  "⚡",
];

export const DEFAULT_CATEGORY_COLORS = [
  "#f97316",
  "#ef4444",
  "#eab308",
  "#22c55e",
  "#0ea5e9",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
  "#64748b",
];

export const DEFAULT_CATEGORY_GROUP_IDS = {
  expenseFood: "sys_expense_food",
  expenseTransport: "sys_expense_transport",
  expenseHome: "sys_expense_home",
  expenseHealth: "sys_expense_health",
  expenseLifestyle: "sys_expense_lifestyle",
  expenseOther: "sys_expense_other",
  incomeSalary: "sys_income_salary",
  incomeBusiness: "sys_income_business",
  incomeInvestments: "sys_income_investments",
  incomeOther: "sys_income_other",
} as const;

export const DEFAULT_CATEGORY_PRESETS: CategoryPreset[] = [
  {
    id: DEFAULT_CATEGORY_GROUP_IDS.expenseFood,
    name: "Їжа",
    type: "expense",
    kind: "group",
    emoji: "🍽️",
    color: "#f97316",
    isSystem: true,
    sortOrder: 100,
  },
  {
    id: "sys_sub_expense_groceries",
    parentId: DEFAULT_CATEGORY_GROUP_IDS.expenseFood,
    name: "Продукти",
    type: "expense",
    kind: "subcategory",
    emoji: "🛒",
    color: "#fb923c",
    isSystem: true,
    sortOrder: 110,
  },
  {
    id: "sys_sub_expense_cafe",
    parentId: DEFAULT_CATEGORY_GROUP_IDS.expenseFood,
    name: "Кафе та ресторани",
    type: "expense",
    kind: "subcategory",
    emoji: "☕",
    color: "#fdba74",
    isSystem: true,
    sortOrder: 120,
  },
  {
    id: DEFAULT_CATEGORY_GROUP_IDS.expenseTransport,
    name: "Транспорт",
    type: "expense",
    kind: "group",
    emoji: "🚗",
    color: "#0ea5e9",
    isSystem: true,
    sortOrder: 200,
  },
  {
    id: "sys_sub_expense_public_transport",
    parentId: DEFAULT_CATEGORY_GROUP_IDS.expenseTransport,
    name: "Громадський транспорт",
    type: "expense",
    kind: "subcategory",
    emoji: "🚌",
    color: "#38bdf8",
    isSystem: true,
    sortOrder: 210,
  },
  {
    id: "sys_sub_expense_fuel",
    parentId: DEFAULT_CATEGORY_GROUP_IDS.expenseTransport,
    name: "Пальне",
    type: "expense",
    kind: "subcategory",
    emoji: "⛽",
    color: "#7dd3fc",
    isSystem: true,
    sortOrder: 220,
  },
  {
    id: DEFAULT_CATEGORY_GROUP_IDS.expenseHome,
    name: "Дім",
    type: "expense",
    kind: "group",
    emoji: "🏠",
    color: "#a855f7",
    isSystem: true,
    sortOrder: 300,
  },
  {
    id: "sys_sub_expense_utilities",
    parentId: DEFAULT_CATEGORY_GROUP_IDS.expenseHome,
    name: "Комунальні",
    type: "expense",
    kind: "subcategory",
    emoji: "💡",
    color: "#c084fc",
    isSystem: true,
    sortOrder: 310,
  },
  {
    id: "sys_sub_expense_repairs",
    parentId: DEFAULT_CATEGORY_GROUP_IDS.expenseHome,
    name: "Ремонт",
    type: "expense",
    kind: "subcategory",
    emoji: "🛠️",
    color: "#d8b4fe",
    isSystem: true,
    sortOrder: 320,
  },
  {
    id: DEFAULT_CATEGORY_GROUP_IDS.expenseHealth,
    name: "Здоровʼя",
    type: "expense",
    kind: "group",
    emoji: "💊",
    color: "#10b981",
    isSystem: true,
    sortOrder: 400,
  },
  {
    id: "sys_sub_expense_medicine",
    parentId: DEFAULT_CATEGORY_GROUP_IDS.expenseHealth,
    name: "Ліки",
    type: "expense",
    kind: "subcategory",
    emoji: "🩺",
    color: "#34d399",
    isSystem: true,
    sortOrder: 410,
  },
  {
    id: "sys_sub_expense_sport",
    parentId: DEFAULT_CATEGORY_GROUP_IDS.expenseHealth,
    name: "Спорт",
    type: "expense",
    kind: "subcategory",
    emoji: "🏋️",
    color: "#6ee7b7",
    isSystem: true,
    sortOrder: 420,
  },
  {
    id: DEFAULT_CATEGORY_GROUP_IDS.expenseLifestyle,
    name: "Стиль життя",
    type: "expense",
    kind: "group",
    emoji: "✨",
    color: "#ec4899",
    isSystem: true,
    sortOrder: 500,
  },
  {
    id: "sys_sub_expense_entertainment",
    parentId: DEFAULT_CATEGORY_GROUP_IDS.expenseLifestyle,
    name: "Розваги",
    type: "expense",
    kind: "subcategory",
    emoji: "🎉",
    color: "#f472b6",
    isSystem: true,
    sortOrder: 510,
  },
  {
    id: "sys_sub_expense_shopping",
    parentId: DEFAULT_CATEGORY_GROUP_IDS.expenseLifestyle,
    name: "Покупки",
    type: "expense",
    kind: "subcategory",
    emoji: "🛍️",
    color: "#f9a8d4",
    isSystem: true,
    sortOrder: 520,
  },
  {
    id: DEFAULT_CATEGORY_GROUP_IDS.expenseOther,
    name: "Інше",
    type: "expense",
    kind: "group",
    emoji: "📦",
    color: "#64748b",
    isSystem: true,
    sortOrder: 900,
  },
  {
    id: DEFAULT_CATEGORY_GROUP_IDS.incomeSalary,
    name: "Основний дохід",
    type: "income",
    kind: "group",
    emoji: "💼",
    color: "#16a34a",
    isSystem: true,
    sortOrder: 1000,
  },
  {
    id: "sys_sub_income_salary",
    parentId: DEFAULT_CATEGORY_GROUP_IDS.incomeSalary,
    name: "Зарплата",
    type: "income",
    kind: "subcategory",
    emoji: "💳",
    color: "#22c55e",
    isSystem: true,
    sortOrder: 1010,
  },
  {
    id: "sys_sub_income_bonus",
    parentId: DEFAULT_CATEGORY_GROUP_IDS.incomeSalary,
    name: "Бонуси",
    type: "income",
    kind: "subcategory",
    emoji: "🎁",
    color: "#4ade80",
    isSystem: true,
    sortOrder: 1020,
  },
  {
    id: DEFAULT_CATEGORY_GROUP_IDS.incomeBusiness,
    name: "Підробіток і бізнес",
    type: "income",
    kind: "group",
    emoji: "🚀",
    color: "#14b8a6",
    isSystem: true,
    sortOrder: 1100,
  },
  {
    id: "sys_sub_income_freelance",
    parentId: DEFAULT_CATEGORY_GROUP_IDS.incomeBusiness,
    name: "Фриланс",
    type: "income",
    kind: "subcategory",
    emoji: "💻",
    color: "#2dd4bf",
    isSystem: true,
    sortOrder: 1110,
  },
  {
    id: "sys_sub_income_sales",
    parentId: DEFAULT_CATEGORY_GROUP_IDS.incomeBusiness,
    name: "Продажі",
    type: "income",
    kind: "subcategory",
    emoji: "🛍️",
    color: "#5eead4",
    isSystem: true,
    sortOrder: 1120,
  },
  {
    id: DEFAULT_CATEGORY_GROUP_IDS.incomeInvestments,
    name: "Інвестиції",
    type: "income",
    kind: "group",
    emoji: "📈",
    color: "#84cc16",
    isSystem: true,
    sortOrder: 1200,
  },
  {
    id: "sys_sub_income_interest",
    parentId: DEFAULT_CATEGORY_GROUP_IDS.incomeInvestments,
    name: "Відсотки",
    type: "income",
    kind: "subcategory",
    emoji: "🏦",
    color: "#a3e635",
    isSystem: true,
    sortOrder: 1210,
  },
  {
    id: "sys_sub_income_dividends",
    parentId: DEFAULT_CATEGORY_GROUP_IDS.incomeInvestments,
    name: "Дивіденди",
    type: "income",
    kind: "subcategory",
    emoji: "💹",
    color: "#bef264",
    isSystem: true,
    sortOrder: 1220,
  },
  {
    id: DEFAULT_CATEGORY_GROUP_IDS.incomeOther,
    name: "Інші надходження",
    type: "income",
    kind: "group",
    emoji: "💰",
    color: "#eab308",
    isSystem: true,
    sortOrder: 1300,
  },
];

const SYSTEM_CATEGORY_TRANSLATIONS: Record<
  string,
  Record<AppLanguage, string>
> = {
  [DEFAULT_CATEGORY_GROUP_IDS.expenseFood]: {
    uk: "Їжа",
    en: "Food",
    cs: "Jídlo",
  },
  sys_sub_expense_groceries: {
    uk: "Продукти",
    en: "Groceries",
    cs: "Potraviny",
  },
  sys_sub_expense_cafe: {
    uk: "Кафе та ресторани",
    en: "Cafés and restaurants",
    cs: "Kavárny a restaurace",
  },
  [DEFAULT_CATEGORY_GROUP_IDS.expenseTransport]: {
    uk: "Транспорт",
    en: "Transport",
    cs: "Doprava",
  },
  sys_sub_expense_public_transport: {
    uk: "Громадський транспорт",
    en: "Public transport",
    cs: "Veřejná doprava",
  },
  sys_sub_expense_fuel: {
    uk: "Пальне",
    en: "Fuel",
    cs: "Palivo",
  },
  [DEFAULT_CATEGORY_GROUP_IDS.expenseHome]: {
    uk: "Дім",
    en: "Home",
    cs: "Domov",
  },
  sys_sub_expense_utilities: {
    uk: "Комунальні",
    en: "Utilities",
    cs: "Služby",
  },
  sys_sub_expense_repairs: {
    uk: "Ремонт",
    en: "Repairs",
    cs: "Opravy",
  },
  [DEFAULT_CATEGORY_GROUP_IDS.expenseHealth]: {
    uk: "Здоровʼя",
    en: "Health",
    cs: "Zdraví",
  },
  sys_sub_expense_medicine: {
    uk: "Ліки",
    en: "Medicine",
    cs: "Léky",
  },
  sys_sub_expense_sport: {
    uk: "Спорт",
    en: "Sport",
    cs: "Sport",
  },
  [DEFAULT_CATEGORY_GROUP_IDS.expenseLifestyle]: {
    uk: "Стиль життя",
    en: "Lifestyle",
    cs: "Životní styl",
  },
  sys_sub_expense_entertainment: {
    uk: "Розваги",
    en: "Entertainment",
    cs: "Zábava",
  },
  sys_sub_expense_shopping: {
    uk: "Покупки",
    en: "Shopping",
    cs: "Nákupy",
  },
  [DEFAULT_CATEGORY_GROUP_IDS.expenseOther]: {
    uk: "Інше",
    en: "Other",
    cs: "Ostatní",
  },
  [DEFAULT_CATEGORY_GROUP_IDS.incomeSalary]: {
    uk: "Основний дохід",
    en: "Main income",
    cs: "Hlavní příjem",
  },
  sys_sub_income_salary: {
    uk: "Зарплата",
    en: "Salary",
    cs: "Mzda",
  },
  sys_sub_income_bonus: {
    uk: "Бонуси",
    en: "Bonuses",
    cs: "Bonusy",
  },
  [DEFAULT_CATEGORY_GROUP_IDS.incomeBusiness]: {
    uk: "Підробіток і бізнес",
    en: "Side jobs and business",
    cs: "Vedlejší práce a podnikání",
  },
  sys_sub_income_freelance: {
    uk: "Фриланс",
    en: "Freelance",
    cs: "Freelance",
  },
  sys_sub_income_sales: {
    uk: "Продажі",
    en: "Sales",
    cs: "Prodeje",
  },
  [DEFAULT_CATEGORY_GROUP_IDS.incomeInvestments]: {
    uk: "Інвестиції",
    en: "Investments",
    cs: "Investice",
  },
  sys_sub_income_interest: {
    uk: "Відсотки",
    en: "Interest",
    cs: "Úroky",
  },
  sys_sub_income_dividends: {
    uk: "Дивіденди",
    en: "Dividends",
    cs: "Dividendy",
  },
  [DEFAULT_CATEGORY_GROUP_IDS.incomeOther]: {
    uk: "Інші надходження",
    en: "Other income",
    cs: "Ostatní příjmy",
  },
};

export function getDefaultCategoryPresets(): CategoryProps[] {
  return DEFAULT_CATEGORY_PRESETS.map((preset) => ({ ...preset }));
}

export function inferLegacyParentId(category: Pick<CategoryProps, "name" | "type">) {
  const normalized = category.name.toLowerCase();

  if (category.type === "expense") {
    if (/(їж|прод|каф|рест|обід|coffee|food)/i.test(normalized)) {
      return DEFAULT_CATEGORY_GROUP_IDS.expenseFood;
    }
    if (/(транс|авто|пал|bus|taxi|fuel|car)/i.test(normalized)) {
      return DEFAULT_CATEGORY_GROUP_IDS.expenseTransport;
    }
    if (/(дім|комун|оренд|home|rent|house|ремонт)/i.test(normalized)) {
      return DEFAULT_CATEGORY_GROUP_IDS.expenseHome;
    }
    if (/(здоров|лікар|ліки|sport|health|med)/i.test(normalized)) {
      return DEFAULT_CATEGORY_GROUP_IDS.expenseHealth;
    }
    if (/(одяг|розваг|шоп|gift|shop|party|відпоч)/i.test(normalized)) {
      return DEFAULT_CATEGORY_GROUP_IDS.expenseLifestyle;
    }

    return DEFAULT_CATEGORY_GROUP_IDS.expenseOther;
  }

  if (/(зарп|salary|bonus)/i.test(normalized)) {
    return DEFAULT_CATEGORY_GROUP_IDS.incomeSalary;
  }
  if (/(фрил|business|підроб|sale|продаж)/i.test(normalized)) {
    return DEFAULT_CATEGORY_GROUP_IDS.incomeBusiness;
  }
  if (/(інвест|дивід|interest|deposit)/i.test(normalized)) {
    return DEFAULT_CATEGORY_GROUP_IDS.incomeInvestments;
  }

  return DEFAULT_CATEGORY_GROUP_IDS.incomeOther;
}

export function normalizeCategoryRecord(category: CategoryProps): CategoryProps {
  const kind = category.kind ?? (category.parentId ? "subcategory" : "subcategory");

  return {
    ...category,
    kind,
    parentId:
      kind === "subcategory"
        ? category.parentId ?? inferLegacyParentId(category)
        : category.parentId,
    emoji: category.emoji ?? (kind === "group" ? "📁" : "🏷️"),
    color: category.color ?? "#94a3b8",
    isSystem: category.isSystem ?? false,
    sortOrder: category.sortOrder ?? 5000,
  };
}

export function sortCategories<T extends Category | CategoryProps>(categories: T[]): T[] {
  return [...categories].sort((left, right) => {
    if ((left.sortOrder ?? 0) !== (right.sortOrder ?? 0)) {
      return (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
    }

    if ((left.kind ?? "group") !== (right.kind ?? "group")) {
      return (left.kind ?? "group") === "group" ? -1 : 1;
    }

    return left.name.localeCompare(right.name, "uk");
  });
}

export function getCategoryDisplayName(
  category: Pick<CategoryProps, "id" | "name" | "isSystem">,
  language: AppLanguage
) {
  if (category.isSystem) {
    return SYSTEM_CATEGORY_TRANSLATIONS[category.id]?.[language] ?? category.name;
  }

  return category.name;
}

export function getCategoryDisplayLabel(
  category: Pick<CategoryProps, "id" | "name" | "emoji" | "isSystem">,
  language: AppLanguage
) {
  return `${category.emoji ?? "🏷️"} ${getCategoryDisplayName(category, language)}`;
}

export function getCategoryGroup(
  categoryId: string | undefined,
  categories: Array<Category | CategoryProps>
) {
  if (!categoryId) {
    return null;
  }

  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const category = categoryMap.get(categoryId);

  if (!category) {
    return null;
  }

  if ((category.kind ?? "group") === "group") {
    return category;
  }

  return category.parentId ? categoryMap.get(category.parentId) ?? null : null;
}

export function getCategoryPathLabel(
  categoryId: string | undefined,
  categories: Array<Category | CategoryProps>,
  language: AppLanguage
) {
  if (!categoryId) {
    return "";
  }

  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const category = categoryMap.get(categoryId);
  if (!category) {
    return "";
  }

  const categoryLabel = `${category.emoji ?? "🏷️"} ${getCategoryDisplayName(category, language)}`;
  if ((category.kind ?? "group") === "group" || !category.parentId) {
    return categoryLabel;
  }

  const parent = categoryMap.get(category.parentId);
  if (!parent) {
    return categoryLabel;
  }

  return `${parent.emoji ?? "📁"} ${getCategoryDisplayName(parent, language)} · ${categoryLabel}`;
}

export function getCategoryChildren<T extends Category | CategoryProps>(
  parentId: string,
  categories: T[]
) {
  return sortCategories(
    categories.filter(
      (category) => (category.kind ?? "group") === "subcategory" && category.parentId === parentId
    )
  );
}

export function getCategoryGroupsByType<T extends Category | CategoryProps>(
  categories: T[],
  type: CategoryType
) {
  return sortCategories(
    categories.filter(
      (category) => (category.kind ?? "group") === "group" && category.type === type
    )
  );
}
