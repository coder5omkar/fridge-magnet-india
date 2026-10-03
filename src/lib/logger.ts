export type LogLevel = "debug" | "info" | "success" | "warn" | "error";

export interface LogEntry {
  id: number;
  at: string;
  level: LogLevel;
  event: string;
  data?: Record<string, unknown>;
}

const STORAGE_KEY = "fish-magnets:logs";
const MAX_ENTRIES = 200;
const PERSIST_COUNT = 50;

let counter = 0;
let entries: LogEntry[] = [];
let snapshot: LogEntry[] = entries;
let initialized = false;
let errorLoggingInstalled = false;
const listeners = new Set<() => void>();

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function ensureInitialized() {
  if (initialized || !isBrowser()) return;
  initialized = true;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as LogEntry[];
    if (!Array.isArray(parsed)) return;
    entries = parsed;
    snapshot = entries;
    counter = parsed.reduce((max, entry) => Math.max(max, entry.id), 0);
  } catch {
    entries = [];
  }
}

function persist() {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(entries.slice(-PERSIST_COUNT))
    );
  } catch {
    return;
  }
}

function notify() {
  for (const listener of listeners) listener();
}

export function log(
  event: string,
  data?: Record<string, unknown>,
  level: LogLevel = "info"
) {
  if (!isBrowser()) return;
  ensureInitialized();
  const entry: LogEntry = {
    id: ++counter,
    at: new Date().toISOString(),
    level,
    event,
    data,
  };
  entries = [...entries, entry].slice(-MAX_ENTRIES);
  snapshot = entries;
  persist();
  if (level === "error") {
    console.error(`[FishMagnets] ${event}`, data ?? "");
  } else if (level === "warn") {
    console.warn(`[FishMagnets] ${event}`, data ?? "");
  } else if (level === "debug") {
    console.debug(`[FishMagnets] ${event}`, data ?? "");
  } else {
    console.info(`[FishMagnets] ${event}`, data ?? "");
  }
  notify();
}

export function getLogSnapshot(): LogEntry[] {
  ensureInitialized();
  return snapshot;
}

export function subscribeLogs(listener: () => void): () => void {
  ensureInitialized();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function installErrorLogging() {
  if (!isBrowser() || errorLoggingInstalled) return;
  errorLoggingInstalled = true;
  window.addEventListener("error", (event) => {
    log(
      "window_error",
      { message: event.message, source: event.filename, line: event.lineno },
      "error"
    );
  });
  window.addEventListener("unhandledrejection", (event) => {
    log("unhandled_rejection", { reason: String(event.reason) }, "error");
  });
}
