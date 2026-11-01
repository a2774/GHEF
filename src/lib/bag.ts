"use client";

import { useSyncExternalStore } from "react";

export type BagItem = {
  variantId: number;
  slug: string;
  title: string;
  size: string;
  color: string;
  pricePaise: number;
  quantity: number;
};

const storageKey = "ghe-bag";
const emptyBag: BagItem[] = [];
const listeners = new Set<() => void>();

let items: BagItem[] | null = null;

function readBag() {
  if (items) return items;
  try {
    items = JSON.parse(localStorage.getItem(storageKey) ?? "[]") as BagItem[];
  } catch {
    items = emptyBag;
  }
  return items;
}

function writeBag(next: BagItem[]) {
  items = next;
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    // The bag still works for this visit when storage is unavailable.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useBag() {
  return useSyncExternalStore(subscribe, readBag, () => emptyBag);
}

export function addToBag(item: Omit<BagItem, "quantity">) {
  const bag = readBag();
  const existing = bag.find(({ variantId }) => variantId === item.variantId);
  writeBag(
    existing
      ? bag.map((entry) =>
          entry === existing ? { ...entry, quantity: entry.quantity + 1 } : entry,
        )
      : [...bag, { ...item, quantity: 1 }],
  );
}

export function removeFromBag(variantId: number) {
  writeBag(readBag().filter((item) => item.variantId !== variantId));
}
