"use client";

import { useEffect, useSyncExternalStore } from "react";

let count = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return count > 0;
}

function getServerSnapshot() {
  return false;
}

export function useAnySheetOpen() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useRegisterSheetOpen(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;
    count += 1;
    emit();
    return () => {
      count -= 1;
      emit();
    };
  }, [isOpen]);
}
