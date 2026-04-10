export type Theme = "light" | "dark" | "system";
export type Language = "uk" | "en" | "cs";
export type DateFormat = "dd.MM.yyyy" | "yyyy-MM-dd";
export type StartPage = "dashboard" | "transactions" | "accounts" | "savings";
export type AppCurrency = "UAH" | "USD" | "EUR" | "CZK";

export type SettingsProps = {
  id: "settings";
  firstDayOfWeek: 1 | 7;
  theme: Theme;
  language: Language;
  baseCurrency: AppCurrency;
  dateFormat: DateFormat;
  showDecimals: boolean;
  confirmBeforeDelete: boolean;
  startPage: StartPage;
};

export class UserSettings {
  public readonly id: "settings";
  public readonly firstDayOfWeek: 1 | 7;
  public readonly theme: Theme;
  public readonly language: Language;
  public readonly baseCurrency: AppCurrency;
  public readonly dateFormat: DateFormat;
  public readonly showDecimals: boolean;
  public readonly confirmBeforeDelete: boolean;
  public readonly startPage: StartPage;

  public constructor(props: SettingsProps) {
    this.id = props.id;
    this.firstDayOfWeek = props.firstDayOfWeek;
    this.theme = props.theme;
    this.language = props.language;
    this.baseCurrency = props.baseCurrency;
    this.dateFormat = props.dateFormat;
    this.showDecimals = props.showDecimals;
    this.confirmBeforeDelete = props.confirmBeforeDelete;
    this.startPage = props.startPage;
  }

  public isMondayFirst(): boolean {
    return this.firstDayOfWeek === 1;
  }

  public isSundayFirst(): boolean {
    return this.firstDayOfWeek === 7;
  }

  public isLightTheme(): boolean {
    return this.theme === "light";
  }

  public isDarkTheme(): boolean {
    return this.theme === "dark";
  }

  public isSystemTheme(): boolean {
    return this.theme === "system";
  }

  public isUkrainian(): boolean {
    return this.language === "uk";
  }

  public isEnglish(): boolean {
    return this.language === "en";
  }

  public isCzech(): boolean {
    return this.language === "cs";
  }

  public isDDMMFormat(): boolean {
    return this.dateFormat === "dd.MM.yyyy";
  }

  public isYYYYMMDDFormat(): boolean {
    return this.dateFormat === "yyyy-MM-dd";
  }
}
