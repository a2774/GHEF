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

function isValidBagItem(item: unknown): item is BagItem {
  if (typeof item !== "object" || item === null) return false;
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.variantId === "number" &&
    Number.isInteger(candidate.variantId) &&
    typeof candidate.slug === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.size === "string" &&
    typeof candidate.color === "string" &&
    typeof candidate.pricePaise === "number" &&
    Number.isFinite(candidate.pricePaise) &&
    typeof candidate.quantity === "number" &&
    candidate.quantity > 0 &&
    Number.isInteger(candidate.quantity)
  );
}

function readBag(): BagItem[] {
  if (items) return items;
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    items = Array.isArray(raw) ? raw.filter(isValidBagItem) : emptyBag;
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
