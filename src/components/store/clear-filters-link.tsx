"use client";

import Link from "next/link";

import { useFilterForm } from "./filter-form";

/**
 * "Clear all" for the product filters. It empties every box (even one changed a moment ago and
 * not yet applied) and goes back to the plain shop page. Without JavaScript it is a normal link.
 */
export function ClearFiltersLink({ href = "/products" }: { href?: string }) {
  const filterForm = useFilterForm();

  return (
    <Link
      href={href}
      onClick={(event) => {
        if (!filterForm) return;
        event.preventDefault();
        filterForm.clear();
      }}
      className="block text-center text-base underline-offset-4 hover:underline"
    >
      Clear all
    </Link>
  );
}
