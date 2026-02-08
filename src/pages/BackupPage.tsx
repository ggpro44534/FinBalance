import { useState } from "react";
import type { ChangeEvent } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { exportBackup, isBackupPayload, restoreBackup } from "../services/backupService";

type Status = { type: "success" | "error"; message: string } | null;

function downloadJson(filename: string, payload: unknown) {
  const text = JSON.stringify(payload, null, 2);
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

export default function BackupPage() {
  const [fileLabel, setFileLabel] = useState("Файл не вибрано");
  const [status, setStatus] = useState<Status>(null);

  const handleDownload = async () => {
    setStatus(null);
    try {
      const payload = await exportBackup();
      downloadJson(`FinBalance-backup-${Date.now()}.json`, payload);
      setStatus({ type: "success", message: "Резервну копію успішно завантажено." });
    } catch {
      setStatus({ type: "error", message: "Не вдалося створити резервну копію." });
    }
  };

  const handleRestore = async (file: File | null) => {
    setStatus(null);
    if (!file) return;

    setFileLabel(file.name);

    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);

      if (!isBackupPayload(parsed)) {
        setStatus({ type: "error", message: "Некоректний файл: це не резервна копія FinBalance." });
        return;
      }

      await restoreBackup(parsed);
      setStatus({ type: "success", message: "Дані успішно відновлено." });
    } catch {
      setStatus({ type: "error", message: "Не вдалося відновити дані з файлу." });
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
        <h1 className="text-2xl font-bold text-slate-900">Резервна копія</h1>
        <p className="text-sm text-slate-500">
          Експорт/імпорт даних FinBalance у форматі JSON (офлайн).
        </p>
      </div>

      <Card className="p-5">
        <h2 className="text-lg font-semibold">Відновити дані з файлу</h2>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button variant="secondary">
            <label className="cursor-pointer">
              Обрати файл
              <input
                hidden
                type="file"
                accept="application/json"
                onChange={onFileChange}
              />
            </label>
          </Button>

          <span className="text-sm text-slate-500">{fileLabel}</span>
        </div>

        <p className="mt-3 text-sm text-slate-500">
          Увага: відновлення перезапише поточні рахунки, категорії, транзакції та налаштування.
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-semibold">Створити резервну копію</h2>
        <p className="mt-2 text-sm text-slate-500">
          Завантаж один JSON-файл з усіма даними додатку.
        </p>

        <div className="mt-4">
          <Button onClick={handleDownload}>Завантажити дані (JSON)</Button>
        </div>
      </Card>

      {status && (
        <div
          className={[
            "rounded-2xl border p-4 text-sm",
            status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800",
          ].join(" ")}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
