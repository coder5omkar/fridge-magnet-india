"use client";

import { useSyncExternalStore } from "react";
import { getLogSnapshot, subscribeLogs } from "@/lib/logger";

const noopSubscribe = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

const levelColors: Record<string, string> = {
  debug: "text-slate-400",
  info: "text-sky-300",
  success: "text-emerald-300",
  warn: "text-amber-300",
  error: "text-red-400",
};

export default function DebugPanel() {
  const hydrated = useSyncExternalStore(noopSubscribe, getTrue, getFalse);
  const logs = useSyncExternalStore(subscribeLogs, getLogSnapshot, getLogSnapshot);

  if (!hydrated) return null;
  const enabled = new URLSearchParams(window.location.search).has("debug");
  if (!enabled) return null;

  return (
    <aside className="fixed bottom-3 right-3 z-50 w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-700 bg-slate-900/95 p-3 text-[10px] leading-4 text-slate-200 shadow-2xl backdrop-blur">
      <p className="mb-2 flex items-center justify-between font-bold text-white">
        <span>Activity log</span>
        <span className="text-slate-400">{logs.length} events</span>
      </p>
      <ol className="max-h-64 space-y-1 overflow-auto pr-1">
        {logs.length === 0 ? (
          <li className="text-slate-400">No activity yet.</li>
        ) : (
          logs
            .slice()
            .reverse()
            .map((entry) => (
              <li key={entry.id}>
                <span className="text-slate-500">{entry.at.slice(11, 19)}</span>{" "}
                <span className={levelColors[entry.level] ?? "text-slate-300"}>
                  {entry.level}
                </span>{" "}
                <span className="text-slate-100">{entry.event}</span>
                {entry.data ? (
                  <span className="text-slate-400">
                    {" "}
                    {JSON.stringify(entry.data)}
                  </span>
                ) : null}
              </li>
            ))
        )}
      </ol>
    </aside>
  );
}
