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
  offlineMode: string;
  installAvailable: string;
  installHintIos: string;
  installHintUnavailable: string;
  install: string;
  update: string;
  close: string;
};

const pwaTranslations: Record<Language, PwaTranslations> = {
  uk: {
    updateAvailable: "Доступна нова версія",
    offlineMode: "Ви працюєте без інтернету",
    installAvailable: "Доступна інсталяція додатку",
    installHintIos: "Safari: відкрийте меню Share і оберіть Add to Home Screen.",
    installHintUnavailable:
      "Інсталяція стане доступною, коли браузер визначить додаток як PWA.",
    install: "Встановити",
    update: "Оновити",
    close: "Закрити",
  },
  en: {
    updateAvailable: "A new version is available",
    offlineMode: "You are offline",
    installAvailable: "App installation is available",
    installHintIos: "Safari: open the Share menu and choose Add to Home Screen.",
    installHintUnavailable:
      "Installation will appear when the browser recognizes the app as installable.",
    install: "Install",
    update: "Update",
    close: "Close",
  },
  cs: {
    updateAvailable: "Je dostupna nova verze",
    offlineMode: "Pracujete bez internetu",
    installAvailable: "Je dostupna instalace aplikace",
    installHintIos: "V Safari otevrete nabidku Sdilet a zvolte Add to Home Screen.",
    installHintUnavailable:
      "Instalace bude dostupna, jakmile prohlizec rozpozna aplikaci jako PWA.",
    install: "Instalovat",
    update: "Aktualizovat",
    close: "Zavrit",
  },
};

function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosDevice() {
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua);
}

function PwaStatus() {
  const {
    offlineReady: [, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const language = useFinanceStore((state) => state.settings.language) as Language;

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isStandalone, setIsStandalone] = useState(isStandaloneMode);
  const [isInstallNoticeDismissed, setIsInstallNoticeDismissed] = useState(false);
  const isIos = useMemo(() => isIosDevice(), []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = () => {
      setIsStandalone(isStandaloneMode());
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsInstallNoticeDismissed(false);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      setIsInstallNoticeDismissed(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setIsInstallNoticeDismissed(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setIsInstallNoticeDismissed(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    mediaQuery.addEventListener("change", handleDisplayModeChange);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      mediaQuery.removeEventListener("change", handleDisplayModeChange);
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
    setIsInstallNoticeDismissed(false);
  };

  const showInstallButton =
    isOffline && !isStandalone && deferredPrompt !== null && !isInstallNoticeDismissed;
  const showInstallHint =
    isOffline &&
    !isStandalone &&
    deferredPrompt === null &&
    !needRefresh &&
    !isInstallNoticeDismissed;
  const showOfflineNotice = isOffline && !isInstallNoticeDismissed;
  const showStatus = needRefresh || showOfflineNotice;

  if (!showStatus) {
    return null;
  }

  const statusMessage = needRefresh
    ? messages.updateAvailable
    : showInstallButton || showInstallHint
      ? messages.installAvailable
      : messages.offlineMode;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-sm text-slate-700 dark:text-slate-200">
        {statusMessage}
      </div>

      {showInstallHint && (
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {isIos ? messages.installHintIos : messages.installHintUnavailable}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {showInstallButton && !needRefresh && (
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
            setIsInstallNoticeDismissed(true);
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
