"use client";

import { useRouter } from "next/navigation";
import { createContext, Fragment, type ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";

type FilterFormValue = {
  /** Goes up each time the filters are cleared, so the boxes start again from empty. */
  generation: number;
  clear: () => void;
};

const FilterFormContext = createContext<FilterFormValue | null>(null);

export function useFilterForm() {
  return useContext(FilterFormContext);
}

/**
 * Wraps the filter boxes. They start from the address once, so the page gives it a new `key`
 * each time the address changes, and this remounts them when "Clear all" is pressed.
 */
export function FilterFields({ children }: { children: ReactNode }) {
  const generation = useFilterForm()?.generation ?? 0;
  return <Fragment key={generation}>{children}</Fragment>;
}

/**
 * The shop's filter form. Changing any filter updates the page a moment later, with no Apply
 * button to press. The slider sends many changes while it is dragged, so they are bunched up.
 * A box left at its starting value (a field's `data-default`) or empty is left out of the address.
 */
export function FilterForm({ children, className }: { children: ReactNode; className?: string }) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [generation, setGeneration] = useState(0);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const value = useMemo<FilterFormValue>(
    () => ({
      generation,
      clear() {
        if (timer.current) clearTimeout(timer.current);
        setGeneration((current) => current + 1);
        router.push("/products", { scroll: false });
      },
    }),
    [generation, router],
  );

  function apply(form: HTMLFormElement) {
    const params = new URLSearchParams();
    for (const element of Array.from(form.elements)) {
      if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement) || !element.name) continue;
      const isCheckbox = element instanceof HTMLInputElement && element.type === "checkbox";
      if (isCheckbox && !element.checked) continue;
      const fieldValue = isCheckbox ? "on" : element.value;
      if (fieldValue === "" || fieldValue === element.dataset.default) continue;
      params.set(element.name, fieldValue);
    }
    const query = params.toString();
    router.push(query ? `/products?${query}` : "/products", { scroll: false });
  }

  return (
    <FilterFormContext.Provider value={value}>
      <form
        className={className}
        onChange={(event) => {
          const form = event.currentTarget;
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => apply(form), 350);
        }}
        onSubmit={(event) => {
          event.preventDefault();
          if (timer.current) clearTimeout(timer.current);
          apply(event.currentTarget);
        }}
      >
        {children}
      </form>
    </FilterFormContext.Provider>
  );
}
