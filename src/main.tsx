import { StrictMode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { useRegisterSW } from "virtual:pwa-register/react";

import "./index.css";
import App from "./App";
import { useFinanceStore } from "./store/financeStore";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type Language = "uk" | "en" | "cs";

type PwaTranslations = {
  updateAvailable: string;
  offlineReady: string;
  offlineMode: string;
  installAvailable: string;
  install: string;
  update: string;
  close: string;
};

const pwaTranslations: Record<Language, PwaTranslations> = {
  uk: {
    updateAvailable: "Доступна нова версія",
    offlineReady: "Додаток готовий працювати без інтернету",
    offlineMode: "Ви працюєте без інтернету",
    installAvailable: "Доступна інсталяція додатку",
    install: "Встановити",
    update: "Оновити",
    close: "Закрити",
  },
  en: {
    updateAvailable: "A new version is available",
    offlineReady: "The app is ready to work offline",
    offlineMode: "You are offline",
    installAvailable: "App installation is available",
    install: "Install",
    update: "Update",
    close: "Close",
  },
  cs: {
    updateAvailable: "Je dostupná nová verze",
    offlineReady: "Aplikace je připravena pracovat offline",
    offlineMode: "Pracujete bez internetu",
    installAvailable: "Je dostupná instalace aplikace",
    install: "Instalovat",
    update: "Aktualizovat",
    close: "Zavřít",
  },
};

function PwaStatus() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const language = useFinanceStore((state) => state.settings.language) as Language;

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const messages = useMemo(() => {
    return pwaTranslations[language] ?? pwaTranslations.uk;
  }, [language]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const showStatus =
    offlineReady || needRefresh || deferredPrompt !== null || !isOnline;

  if (!showStatus) {
    return null;
  }

  const statusMessage = needRefresh
    ? messages.updateAvailable
    : offlineReady
    ? messages.offlineReady
    : !isOnline
    ? messages.offlineMode
    : messages.installAvailable;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="text-sm text-slate-700 dark:text-slate-200">
        {statusMessage}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {deferredPrompt && !needRefresh && (
          <button
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white dark:bg-slate-100 dark:text-slate-900"
            onClick={handleInstall}
          >
            {messages.install}
          </button>
        )}

        {needRefresh && (
          <button
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white dark:bg-slate-100 dark:text-slate-900"
            onClick={() => updateServiceWorker(true)}
          >
            {messages.update}
          </button>
        )}

        <button
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
          onClick={() => {
            setOfflineReady(false);
            setNeedRefresh(false);
          }}
        >
          {messages.close}
        </button>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <PwaStatus />
  </StrictMode>
);