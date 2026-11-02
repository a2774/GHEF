"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Mail,
  MessageCircle,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AbandonedCartItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  items: {
    title: string;
    size: string;
    material: string;
    qty: number;
    price: number;
  }[];
  totalPrice: number;
  abandonedAt: string;
  status: "uncontacted" | "reminded" | "recovered" | "expired";
  reminderCount: number;
  discountOffered?: string;
}

const INITIAL_CARTS: AbandonedCartItem[] = [
  {
    id: "AC-1089",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+91 98201 44521",
    city: "Mumbai, MH",
    items: [
      {
        title: "Mirzapur Heritage Hand-Tufted Wool Rug",
        size: "8x10 ft",
        material: "100% Pure New Zealand Wool",
        qty: 1,
        price: 38500,
      },
    ],
    totalPrice: 38500,
    abandonedAt: "42 mins ago",
    status: "uncontacted",
    reminderCount: 0,
  },
  {
    id: "AC-1088",
    name: "Sunita Nambiar",
    email: "sunita.n@gmail.com",
    phone: "+91 98450 11299",
    city: "Bengaluru, KA",
    items: [
      {
        title: "Kashmiri Silk-on-Silk Medallion Carpet",
        size: "6x9 ft",
        material: "Natural Mulberry Silk",
        qty: 1,
        price: 84000,
      },
      {
        title: "Handmade Organic Jute Door Runner",
        size: "2x4 ft",
        material: "Raw Golden Jute",
        qty: 2,
        price: 4800,
      },
    ],
    totalPrice: 88800,
    abandonedAt: "2 hours ago",
    status: "reminded",
    reminderCount: 1,
    discountOffered: "RUG10 (10% OFF)",
  },
  {
    id: "AC-1087",
    name: "Rohit Mehra",
    email: "rohit.mehra@interiorstudio.in",
    phone: "+91 97110 88231",
    city: "New Delhi, DL",
    items: [
      {
        title: "Bhadohi Traditional Persian Motif Rug",
        size: "9x12 ft",
        material: "High-Twist Wool & Jute Warp",
        qty: 1,
        price: 52000,
      },
    ],
    totalPrice: 52000,
    abandonedAt: "5 hours ago",
    status: "uncontacted",
    reminderCount: 0,
  },
  {
    id: "AC-1086",
    name: "Pooja Hegde",
    email: "pooja.hegde@outlook.com",
    phone: "+91 99204 33110",
    city: "Pune, MH",
    items: [
      {
        title: "Scandinavian Minimalist Ivory Wool Carpet",
        size: "5x8 ft",
        material: "Unbleached Wool",
        qty: 1,
        price: 26000,
      },
    ],
    totalPrice: 26000,
    abandonedAt: "Yesterday",
    status: "recovered",
    reminderCount: 1,
    discountOffered: "WELCOME5 (5% OFF)",
  },
  {
    id: "AC-1085",
    name: "Karan Johar",
    email: "karan.design@arc-partners.com",
    phone: "+91 98100 22340",
    city: "Gurugram, HR",
    items: [
      {
        title: "Bespoke Geometric Flatweave Moroccan Rug",
        size: "10x14 ft",
        material: "Hand-Spun Wool",
        qty: 1,
        price: 76000,
      },
    ],
    totalPrice: 76000,
    abandonedAt: "2 days ago",
    status: "reminded",
    reminderCount: 2,
    discountOffered: "HERITAGE10 (10% OFF)",
  },
  {
    id: "AC-1084",
    name: "Meera Singhania",
    email: "meera.singhania@gmail.com",
    phone: "+91 94140 55902",
    city: "Jaipur, RJ",
    items: [
      {
        title: "Hand-Knotted Floral Kashan Silk Runner",
        size: "2.5x10 ft",
        material: "Pure Silk & Wool Blend",
        qty: 1,
        price: 32500,
      },
    ],
    totalPrice: 32500,
    abandonedAt: "4 days ago",
    status: "expired",
    reminderCount: 2,
  },
];

function formatRupees(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AbandonedClient() {
  const [carts, setCarts] = useState<AbandonedCartItem[]>(INITIAL_CARTS);
  const [filter, setFilter] = useState<"all" | "uncontacted" | "reminded" | "recovered" | "expired">("all");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredCarts = carts.filter((c) => (filter === "all" ? true : c.status === filter));

  const totalAbandoned = carts.length;
  const potentialRecoverable = carts
    .filter((c) => c.status !== "recovered" && c.status !== "expired")
    .reduce((sum, c) => sum + c.totalPrice, 0);
  const totalRecovered = carts
    .filter((c) => c.status === "recovered")
    .reduce((sum, c) => sum + c.totalPrice, 0);
  const recoveredCount = carts.filter((c) => c.status === "recovered").length;

  const handleSendEmailReminder = (id: string, name: string) => {
    setCarts((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "reminded",
              reminderCount: c.reminderCount + 1,
              discountOffered: "RECOVER10 (10% OFF)",
            }
          : c,
      ),
    );
    setActionNotice(`✓ Sent personalized 10% recovery coupon email to ${name} (${id})`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleSendWhatsApp = (id: string, name: string, phone: string) => {
    setCarts((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "reminded",
              reminderCount: c.reminderCount + 1,
              discountOffered: "RUGSPECIAL10",
            }
          : c,
      ),
    );
    setActionNotice(`✓ Triggered WhatsApp VIP concierge checkout reminder to ${phone}`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleMarkRecovered = (id: string, name: string) => {
    setCarts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "recovered" } : c)),
    );
    setActionNotice(`✓ Marked cart ${id} (${name}) as Recovered Order!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      {actionNotice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs font-semibold text-emerald-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Abandoned Checkouts &amp; Carts
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Recover lost handcrafted rug purchases with automated 1-click email and WhatsApp concierge reminders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActionNotice("✓ Refreshed live cart checkouts from database");
              setTimeout(() => setActionNotice(null), 2500);
            }}
            className="gap-2 text-xs"
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Abandoned Carts</span>
            <ShoppingBag className="size-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-950">{totalAbandoned}</span>
            <span className="text-xs text-slate-400">past 7 days</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Visitors who paused at payment</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Recoverable Value</span>
            <AlertCircle className="size-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">
              {formatRupees(potentialRecoverable)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">High-intent carts waiting</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Recovered Revenue</span>
            <TrendingUp className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">
              {formatRupees(totalRecovered)}
            </span>
            <span className="text-xs text-slate-400">({recoveredCount} carts)</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Orders saved via reminders</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Recovery Rate</span>
            <Sparkles className="size-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-950">28.4%</span>
            <span className="text-xs font-semibold text-emerald-600">+4.2%</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Industry benchmark: 18%</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {(
          [
            { id: "all", label: "All Carts", count: carts.length },
            { id: "uncontacted", label: "Uncontacted", count: carts.filter((c) => c.status === "uncontacted").length },
            { id: "reminded", label: "Reminder Sent", count: carts.filter((c) => c.status === "reminded").length },
            { id: "recovered", label: "Recovered", count: carts.filter((c) => c.status === "recovered").length },
            { id: "expired", label: "Expired", count: carts.filter((c) => c.status === "expired").length },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              filter === tab.id
                ? "bg-slate-900 text-white font-semibold shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                filter === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Carts List Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="p-4">Customer</th>
                <th className="p-4">Handcrafted Rug Items</th>
                <th className="p-4 text-right">Cart Total</th>
                <th className="p-4">Abandoned At</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Recovery Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCarts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No abandoned carts found in this filter view.
                  </td>
                </tr>
              ) : (
                filteredCarts.map((cart) => (
                  <tr key={cart.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 align-top">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{cart.name}</p>
                        <p className="font-mono text-slate-500">{cart.email}</p>
                        <p className="text-[11px] text-slate-400">{cart.phone}</p>
                        <span className="mt-1 inline-block text-[10px] text-slate-400">
                          {cart.city}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 align-top max-w-sm">
                      <div className="space-y-2">
                        {cart.items.map((it, idx) => (
                          <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50/50 p-2">
                            <p className="font-semibold text-slate-900">{it.title}</p>
                            <div className="mt-0.5 flex flex-wrap gap-2 text-[11px] text-slate-500">
                              <span>Size: <strong className="text-slate-700">{it.size}</strong></span>
                              <span>•</span>
                              <span>{it.material}</span>
                              <span>•</span>
                              <span>Qty: {it.qty}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="p-4 align-top text-right">
                      <p className="text-sm font-bold font-mono text-slate-900">
                        {formatRupees(cart.totalPrice)}
                      </p>
                      {cart.discountOffered && (
                        <span className="mt-1 inline-block rounded-sm bg-lime-100 px-1.5 py-0.5 font-mono text-[10px] text-lime-800">
                          {cart.discountOffered}
                        </span>
                      )}
                    </td>

                    <td className="p-4 align-top">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="size-3.5 text-slate-400" />
                        <span>{cart.abandonedAt}</span>
                      </div>
                    </td>

                    <td className="p-4 align-top">
                      {cart.status === "uncontacted" && (
                        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
                          Uncontacted
                        </Badge>
                      )}
                      {cart.status === "reminded" && (
                        <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-800">
                          Reminder Sent ({cart.reminderCount})
                        </Badge>
                      )}
                      {cart.status === "recovered" && (
                        <Badge variant="brand" className="bg-[#bef264] text-slate-950 font-bold">
                          ✓ Recovered
                        </Badge>
                      )}
                      {cart.status === "expired" && (
                        <Badge variant="secondary" className="text-slate-500">
                          Expired
                        </Badge>
                      )}
                    </td>

                    <td className="p-4 align-top text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        {cart.status !== "recovered" && cart.status !== "expired" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendEmailReminder(cart.id, cart.name)}
                              className="h-7 gap-1.5 text-[11px] hover:border-slate-400"
                            >
                              <Mail className="size-3 text-slate-600" />
                              Send 10% Discount
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendWhatsApp(cart.id, cart.name, cart.phone)}
                              className="h-7 gap-1.5 text-[11px] text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                            >
                              <MessageCircle className="size-3" />
                              WhatsApp Ping
                            </Button>
                            <button
                              type="button"
                              onClick={() => handleMarkRecovered(cart.id, cart.name)}
                              className="text-[10px] font-semibold text-slate-500 hover:text-slate-900 underline mt-0.5"
                            >
                              Mark as paid
                            </button>
                          </>
                        )}
                        {cart.status === "recovered" && (
                          <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                            <Check className="size-3.5" /> Order Confirmed
                          </span>
                        )}
                        {cart.status === "expired" && (
                          <span className="text-[11px] text-slate-400">Cart Expired (7d+)</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
