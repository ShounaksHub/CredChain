"use client";

import * as React from "react";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners: Listener[] = [];

function emit() {
  listeners.forEach((l) => l(toasts));
}

export function toast({ title, description }: { title: string; description?: string }) {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, title, description }];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 3200);
}

export function useToast() {
  const [items, setItems] = React.useState<ToastItem[]>(toasts);

  React.useEffect(() => {
    listeners.push(setItems);
    return () => {
      const idx = listeners.indexOf(setItems);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return { toasts: items };
}
