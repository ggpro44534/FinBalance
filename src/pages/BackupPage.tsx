import { useState } from "react";
import type { ChangeEvent } from "react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { backupService } from "../services/BackupService";
import { useI18n } from "../i18n";

type Status = { type: "success" | "error"; message: string } | null;

function downloadJson(filename: string, payload: unknown) {
  const text = JSON.stringify(payload, null, 2);
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export default function BackupPage() {
  const { t } = useI18n();
  const [fileLabel, setFileLabel] = useState(t("backup.fileNotSelected"));
  const [status, setStatus] = useState<Status>(null);

  const handleDownload = async () => {
    setStatus(null);

    try {
      const payload = await backupService.exportData();
      downloadJson(`FinBalance-backup-${Date.now()}.json`, payload);
      setStatus({ type: "success", message: t("backup.successExport") });
    } catch {
      setStatus({ type: "error", message: t("backup.errorExport") });
    }
  };

  const handleRestore = async (file: File | null) => {
    setStatus(null);
    if (!file) return;

    setFileLabel(file.name);

    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);

      if (!backupService.isValidBackup(parsed)) {
        setStatus({ type: "error", message: t("backup.errorInvalid") });
        return;
      }

      await backupService.restoreData(parsed);
      setStatus({ type: "success", message: t("backup.successRestore") });
    } catch {
      setStatus({ type: "error", message: t("backup.errorRestore") });
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    void handleRestore(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t("backup.title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("backup.subtitle")}
        </p>
      </div>

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {t("backup.restoreTitle")}
        </h2>

        <div className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Button variant="secondary" className="w-full sm:w-auto">
            <label className="cursor-pointer">
              {t("backup.chooseFile")}
              <input hidden type="file" accept="application/json" onChange={onFileChange} />
            </label>
          </Button>

          <span className="text-sm text-slate-500 dark:text-slate-400">{fileLabel}</span>
        </div>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {t("backup.warning")}
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {t("backup.createTitle")}
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t("backup.createHint")}
        </p>

        <div className="mt-4">
          <Button className="w-full sm:w-auto" onClick={handleDownload}>
            {t("backup.download")}
          </Button>
        </div>
      </Card>

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
    </div>
  );
}
