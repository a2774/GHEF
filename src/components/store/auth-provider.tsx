"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { isSafePath } from "@/lib/safe-path";
import { addToCart, addToWishlist, getCustomerState } from "@/server/actions/cart";

// The login window (and the dialog library it needs) is not part of the first load of every page.
// It is fetched while the browser is idle just after the page opens, so it is ready when wanted.
const LoginDialog = dynamic(() => import("./login-dialog").then((module) => module.LoginDialog), { ssr: false });
const loadLoginDialog = () => import("./login-dialog");

export type PendingAction =
  | { type: "add-to-cart"; variantId: number; quantity: number; then?: string }
  | { type: "add-to-wishlist"; productId: number }
  | { type: "navigate"; href: string };

type Customer = { name?: string | null; email?: string | null };

type AuthContextValue = {
  customer: Customer | null;
  cartCount: number;
  wishlistIds: number[];
  /** Runs the action now when logged in, or after login otherwise. */
  requireLogin: (action: PendingAction) => Promise<void>;
  openLogin: () => void;
  refreshCustomerState: () => Promise<void>;
};

const storageKey = "ghe-pending-action";
const AuthContext = createContext<AuthContextValue | null>(null);

function savePending(action: PendingAction) {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(action));
  } catch {
    // Without storage the visitor stays logged in and repeats the action.
  }
}

// Reading clears the value first, so a reload can never run the action twice.
function takePending(): PendingAction | null {
  try {
    const stored = sessionStorage.getItem(storageKey);
    sessionStorage.removeItem(storageKey);
    return stored ? (JSON.parse(stored) as PendingAction) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loginMounted, setLoginMounted] = useState(false);
  const loaded = useRef(false);

  const showLogin = useCallback(() => {
    setLoginMounted(true);
    setOpen(true);
  }, []);

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 3000));
    idle(() => void loadLoginDialog());
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const refreshCustomerState = useCallback(async () => {
    const state = await getCustomerState();
    setCartCount(state.cartCount);
    setWishlistIds(state.wishlistIds);
  }, []);

  const run = useCallback(
    async (action: PendingAction) => {
      if (action.type === "navigate") {
        if (isSafePath(action.href)) router.push(action.href);
        return;
      }

      if (action.type === "add-to-wishlist") {
        const result = await addToWishlist(action.productId);
        if (result.ok) {
          setWishlistIds((current) => [...new Set([...current, action.productId])]);
          setNotice("Added to your wishlist.");
        } else {
          setNotice(result.error ?? "That did not work. Try again.");
        }
        return;
      }

      const result = await addToCart(action.variantId, action.quantity);
      if (!result.ok) {
        setNotice(result.error);
        return;
      }
      setCartCount(result.count);
      if (action.then && isSafePath(action.then)) router.push(action.then);
      else setNotice("Added to your cart.");
    },
    [router],
  );

  const refresh = useCallback(async () => {
    const response = await fetch("/api/auth/session", { cache: "no-store" }).catch(() => null);
    const session = response?.ok ? ((await response.json()) as { user?: Customer } | null) : null;
    const user = session?.user ?? null;
    setCustomer(user);
    if (!user) return;

    await refreshCustomerState();
    const pending = takePending();
    if (pending) await run(pending);
  }, [refreshCustomerState, run]);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    void refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      customer,
      cartCount,
      wishlistIds,
      refreshCustomerState,
      openLogin: showLogin,
      requireLogin: async (action) => {
        if (customer) {
          await run(action);
          return;
        }
        savePending(action);
        showLogin();
      },
    }),
    [cartCount, customer, refreshCustomerState, run, showLogin, wishlistIds],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {loginMounted && (
        <LoginDialog
          open={open}
          onOpenChange={setOpen}
          onSuccess={async () => {
            setOpen(false);
            await refresh();
            router.refresh();
          }}
        />
      )}
      {notice && (
        <p
          role="status"
          className="liquid-glass fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-base whitespace-nowrap text-primary-foreground"
        >
          {notice}
        </p>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
