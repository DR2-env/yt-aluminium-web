"use client";

// Quote list kept in the browser (localStorage) so it survives page loads.
// No accounts: the list is sent to YT from the quote page (or by WhatsApp, email or WeChat).
import { useSyncExternalStore } from "react";
import { unitLabel } from "./units";

export interface QuoteLine {
  pid: string;
  code: string;
  name: string;
  label?: string;
  finish: string;
  finishName: string;
  qty: number;
  unit: string;
}

const STORAGE_KEY = "yt-quote-v3";
const EMPTY: QuoteLine[] = [];
let lines: QuoteLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (Array.isArray(parsed)) lines = parsed as QuoteLine[];
  } catch {
    lines = EMPTY;
  }
}

function commit(next: QuoteLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode or storage full: the list still works for this visit.
  }
  listeners.forEach((l) => l());
}

const sameLine = (a: Pick<QuoteLine, "code" | "finish">, b: Pick<QuoteLine, "code" | "finish">) =>
  a.code === b.code && a.finish === b.finish;

export const quote = {
  add(line: QuoteLine) {
    load();
    const existing = lines.find((l) => sameLine(l, line));
    commit(existing ? lines.map((l) => (l === existing ? { ...l, qty: l.qty + line.qty } : l)) : [...lines, line]);
  },
  setQty(line: QuoteLine, qty: number) {
    commit(lines.map((l) => (sameLine(l, line) ? { ...l, qty: Math.max(1, Math.round(qty) || 1) } : l)));
  },
  remove(line: QuoteLine) {
    commit(lines.filter((l) => !sameLine(l, line)));
  },
  clear() {
    commit(EMPTY);
  },
};

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  // Keep tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    loaded = false;
    load();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useQuote(): QuoteLine[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return lines;
    },
    () => EMPTY,
  );
}

export const lineText = (l: QuoteLine, i: number) =>
  `${i + 1}. ${l.code} ${l.name}${l.label ? ` ${l.label}` : ""}, ${l.finishName}${l.finish !== "NA" ? ` (${l.finish})` : ""}, ${l.qty} ${unitLabel(l.unit, l.qty)}`;
