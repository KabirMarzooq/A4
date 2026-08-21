import React, { useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

/**
 * In-app replacement for window.confirm().
 *
 * The native dialog can't be styled, looks like a browser security prompt
 * rather than part of the hospital system, and (in this app specifically)
 * blocks the whole page including our own toasts.
 *
 * `onConfirm` may return a promise — the confirm button shows a spinner and
 * stays disabled until it settles, so a slow request can't be double-fired.
 * The dialog only closes itself on success; if onConfirm throws, it stays
 * open so the caller's error toast is visible in context.
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  // When set, the user must type this exact word before the confirm button
  // unlocks — for the genuinely irreversible actions (deleting your own
  // account), where a single mis-click shouldn't be enough.
  requireTypedConfirmation = null,
}) {
  const [working, setWorking] = useState(false);
  const [typed, setTyped] = useState("");

  if (!isOpen) return null;

  const typedOk =
    !requireTypedConfirmation || typed.trim() === requireTypedConfirmation;

  const close = () => {
    setTyped("");
    onClose();
  };

  const handleConfirm = async () => {
    if (!typedOk) return;
    setWorking(true);
    try {
      await onConfirm();
      setTyped("");
      onClose();
    } catch {
      // Left open deliberately — the caller surfaces the failure via toast.
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={working ? undefined : close}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                danger
                  ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                  : "bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400"
              }`}
            >
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {title}
              </h2>
              {message && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 whitespace-pre-line">
                  {message}
                </p>
              )}
            </div>
            <button
              onClick={close}
              disabled={working}
              className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full cursor-pointer disabled:opacity-40"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {requireTypedConfirmation && (
            <div className="mt-5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                Type{" "}
                <span className="text-red-500 font-mono">
                  {requireTypedConfirmation}
                </span>{" "}
                to confirm
              </label>
              <input
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500 text-sm font-mono"
              />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={close}
              disabled={working}
              className="flex-1 py-3 rounded-2xl font-bold text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all cursor-pointer disabled:opacity-60"
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              disabled={working || !typedOk}
              className={`flex-1 py-3 rounded-2xl font-bold text-sm text-white shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 ${
                danger
                  ? "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                  : "bg-teal-500 hover:bg-teal-600 shadow-teal-500/20"
              }`}
            >
              {working && <Loader2 size={15} className="animate-spin" />}
              {working ? "Working..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
