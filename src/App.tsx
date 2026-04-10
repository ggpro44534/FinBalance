import { useEffect } from "react";
import AppRouter from "./routes/AppRouter";
import { useFinanceStore } from "./store/financeStore";

export default function App() {
  const init = useFinanceStore((s) => s.init);
  const settings = useFinanceStore((s) => s.settings);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const htmlElement = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      if (settings.theme === "dark") {
        htmlElement.classList.add("dark");
      } else if (settings.theme === "light") {
        htmlElement.classList.remove("dark");
      } else {
        htmlElement.classList.toggle("dark", mediaQuery.matches);
      }
    };

    applyTheme();

    if (settings.theme === "system") {
      mediaQuery.addEventListener("change", applyTheme);
    }

    document.documentElement.lang =
      settings.language === "uk" ? "uk" : settings.language;

    return () => {
      mediaQuery.removeEventListener("change", applyTheme);
    };
  }, [settings.theme, settings.language]);

  return <AppRouter />;
}
