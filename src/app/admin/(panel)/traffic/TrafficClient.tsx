"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Compass,
  Globe,
  Laptop,
  MessageCircle,
  RotateCw,
  Search,
  Share2,
  Smartphone,
  Tablet,
  TrendingUp,
  Users,
} from "lucide-react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type RangeKey = "today" | "7d" | "30d" | "90d" | "all";

interface TrafficSource {
  name: string;
  category: string;
  visits: number;
  revenue: number;
  conversion: number;
  share: number;
  icon: string;
  color: string;
}

const RANGE_DATA: Record<
  RangeKey,
  {
    label: string;
    visitors: number;
    unique: number;
    revenue: number;
    conversion: number;
    liveNow: number;
    growth: number;
    chartDays: { day: string; visits: number; sales: number }[];
    sources: TrafficSource[];
    devices: { name: string; percentage: number; visits: number; icon: string }[];
    topPages: { path: string; title: string; views: number; orders: number; bounceRate: string }[];
  }
> = {
  today: {
    label: "Today",
    visitors: 1840,
    unique: 1420,
    revenue: 64500,
    conversion: 2.9,
    liveNow: 14,
    growth: 12.4,
    chartDays: [
      { day: "00:00", visits: 80, sales: 0 },
      { day: "04:00", visits: 45, sales: 0 },
      { day: "08:00", visits: 210, sales: 12500 },
      { day: "12:00", visits: 480, sales: 24000 },
      { day: "16:00", visits: 620, sales: 18000 },
      { day: "20:00", visits: 405, sales: 10000 },
    ],
    sources: [
      { name: "Google Organic", category: "Search (SEO)", visits: 720, revenue: 28000, conversion: 3.2, share: 39, icon: "search", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
      { name: "Instagram & Meta Ads", category: "Social Campaigns", visits: 510, revenue: 19500, conversion: 2.8, share: 28, icon: "instagram", color: "text-pink-500 bg-pink-500/10 border-pink-500/20" },
      { name: "WhatsApp Business", category: "Direct Inquiries", visits: 290, revenue: 12000, conversion: 3.5, share: 16, icon: "whatsapp", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
      { name: "Direct / Bookmarks", category: "Brand Direct", visits: 180, revenue: 5000, conversion: 2.1, share: 10, icon: "globe", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
      { name: "Architect & Designer Referrals", category: "B2B Trade", visits: 140, revenue: 0, conversion: 0, share: 7, icon: "share", color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
    ],
    devices: [
      { name: "Mobile", percentage: 67, visits: 1232, icon: "mobile" },
      { name: "Desktop", percentage: 28, visits: 515, icon: "desktop" },
      { name: "Tablet", percentage: 5, visits: 93, icon: "tablet" },
    ],
    topPages: [
      { path: "/products/heritage-wool-rug", title: "Mirzapur Heritage Hand-Tufted Wool Rug", views: 420, orders: 4, bounceRate: "28%" },
      { path: "/", title: "Homepage - Ganga Handmade Rugs", views: 610, orders: 2, bounceRate: "22%" },
      { path: "/products/bhadohi-persian-motif", title: "Bhadohi Traditional Persian Motif 8x10", views: 310, orders: 3, bounceRate: "31%" },
      { path: "/products/minimalist-scandi-flatweave", title: "Minimalist Scandinavian Flatweave Runner", views: 240, orders: 2, bounceRate: "34%" },
    ],
  },
  "7d": {
    label: "Last 7 Days",
    visitors: 14280,
    unique: 10940,
    revenue: 486000,
    conversion: 3.1,
    liveNow: 18,
    growth: 16.8,
    chartDays: [
      { day: "Mon", visits: 1820, sales: 58000 },
      { day: "Tue", visits: 1940, sales: 64000 },
      { day: "Wed", visits: 2110, sales: 79000 },
      { day: "Thu", visits: 2050, sales: 68000 },
      { day: "Fri", visits: 2280, sales: 86000 },
      { day: "Sat", visits: 2190, sales: 71000 },
      { day: "Sun", visits: 1890, sales: 60000 },
    ],
    sources: [
      { name: "Google Organic", category: "Search (SEO)", visits: 5430, revenue: 194000, conversion: 3.4, share: 38, icon: "search", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
      { name: "Instagram & Meta Ads", category: "Social Campaigns", visits: 3990, revenue: 136000, conversion: 2.9, share: 28, icon: "instagram", color: "text-pink-500 bg-pink-500/10 border-pink-500/20" },
      { name: "WhatsApp Business", category: "Direct Inquiries", visits: 2280, revenue: 82000, conversion: 3.6, share: 16, icon: "whatsapp", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
      { name: "Architect & Designer Referrals", category: "B2B Trade", visits: 1430, revenue: 54000, conversion: 2.4, share: 10, icon: "share", color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
      { name: "Direct / Bookmarks", category: "Brand Direct", visits: 1150, revenue: 20000, conversion: 1.8, share: 8, icon: "globe", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    ],
    devices: [
      { name: "Mobile", percentage: 65, visits: 9282, icon: "mobile" },
      { name: "Desktop", percentage: 30, visits: 4284, icon: "desktop" },
      { name: "Tablet", percentage: 5, visits: 714, icon: "tablet" },
    ],
    topPages: [
      { path: "/products/heritage-wool-rug", title: "Mirzapur Heritage Hand-Tufted Wool Rug", views: 3200, orders: 28, bounceRate: "26%" },
      { path: "/", title: "Homepage - Ganga Handmade Rugs", views: 4890, orders: 18, bounceRate: "21%" },
      { path: "/products/bhadohi-persian-motif", title: "Bhadohi Traditional Persian Motif 8x10", views: 2450, orders: 22, bounceRate: "29%" },
      { path: "/products/organic-jute-cotton-runner", title: "Organic Jute & Handspun Cotton Runner", views: 1980, orders: 31, bounceRate: "33%" },
    ],
  },
  "30d": {
    label: "Last 30 Days",
    visitors: 58400,
    unique: 43200,
    revenue: 1985000,
    conversion: 3.24,
    liveNow: 21,
    growth: 21.5,
    chartDays: [
      { day: "Week 1", visits: 13800, sales: 460000 },
      { day: "Week 2", visits: 14400, sales: 495000 },
      { day: "Week 3", visits: 15100, sales: 520000 },
      { day: "Week 4", visits: 15100, sales: 510000 },
    ],
    sources: [
      { name: "Google Organic", category: "Search (SEO)", visits: 22770, revenue: 814000, conversion: 3.5, share: 39, icon: "search", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
      { name: "Instagram & Meta Ads", category: "Social Campaigns", visits: 15760, revenue: 536000, conversion: 2.8, share: 27, icon: "instagram", color: "text-pink-500 bg-pink-500/10 border-pink-500/20" },
      { name: "WhatsApp Business", category: "Direct Inquiries", visits: 9340, revenue: 357000, conversion: 3.8, share: 16, icon: "whatsapp", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
      { name: "Architect & Designer Referrals", category: "B2B Trade", visits: 5840, revenue: 218000, conversion: 2.5, share: 10, icon: "share", color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
      { name: "Direct / Bookmarks", category: "Brand Direct", visits: 4690, revenue: 60000, conversion: 1.6, share: 8, icon: "globe", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    ],
    devices: [
      { name: "Mobile", percentage: 64, visits: 37376, icon: "mobile" },
      { name: "Desktop", percentage: 31, visits: 18104, icon: "desktop" },
      { name: "Tablet", percentage: 5, visits: 2920, icon: "tablet" },
    ],
    topPages: [
      { path: "/products/heritage-wool-rug", title: "Mirzapur Heritage Hand-Tufted Wool Rug", views: 12400, orders: 114, bounceRate: "25%" },
      { path: "/", title: "Homepage - Ganga Handmade Rugs", views: 19800, orders: 76, bounceRate: "20%" },
      { path: "/products/bhadohi-persian-motif", title: "Bhadohi Traditional Persian Motif 8x10", views: 9800, orders: 88, bounceRate: "28%" },
      { path: "/products/organic-jute-cotton-runner", title: "Organic Jute & Handspun Cotton Runner", views: 8200, orders: 126, bounceRate: "31%" },
    ],
  },
  "90d": {
    label: "Last 90 Days",
    visitors: 168200,
    unique: 124500,
    revenue: 5720000,
    conversion: 3.18,
    liveNow: 19,
    growth: 29.3,
    chartDays: [
      { day: "Month 1", visits: 52000, sales: 1750000 },
      { day: "Month 2", visits: 57800, sales: 1985000 },
      { day: "Month 3", visits: 58400, sales: 1985000 },
    ],
    sources: [
      { name: "Google Organic", category: "Search (SEO)", visits: 65600, revenue: 2345000, conversion: 3.5, share: 39, icon: "search", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
      { name: "Instagram & Meta Ads", category: "Social Campaigns", visits: 45400, revenue: 1544000, conversion: 2.8, share: 27, icon: "instagram", color: "text-pink-500 bg-pink-500/10 border-pink-500/20" },
      { name: "WhatsApp Business", category: "Direct Inquiries", visits: 26900, revenue: 1029000, conversion: 3.7, share: 16, icon: "whatsapp", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
      { name: "Architect & Designer Referrals", category: "B2B Trade", visits: 16800, revenue: 628000, conversion: 2.4, share: 10, icon: "share", color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
      { name: "Direct / Bookmarks", category: "Brand Direct", visits: 13500, revenue: 174000, conversion: 1.5, share: 8, icon: "globe", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    ],
    devices: [
      { name: "Mobile", percentage: 63, visits: 105966, icon: "mobile" },
      { name: "Desktop", percentage: 32, visits: 53824, icon: "desktop" },
      { name: "Tablet", percentage: 5, visits: 8410, icon: "tablet" },
    ],
    topPages: [
      { path: "/products/heritage-wool-rug", title: "Mirzapur Heritage Hand-Tufted Wool Rug", views: 36200, orders: 328, bounceRate: "25%" },
      { path: "/", title: "Homepage - Ganga Handmade Rugs", views: 56400, orders: 215, bounceRate: "21%" },
      { path: "/products/bhadohi-persian-motif", title: "Bhadohi Traditional Persian Motif 8x10", views: 28900, orders: 254, bounceRate: "27%" },
      { path: "/products/organic-jute-cotton-runner", title: "Organic Jute & Handspun Cotton Runner", views: 23600, orders: 362, bounceRate: "30%" },
    ],
  },
  all: {
    label: "All Time",
    visitors: 342000,
    unique: 258000,
    revenue: 11840000,
    conversion: 3.15,
    liveNow: 22,
    growth: 44.1,
    chartDays: [
      { day: "Q1", visits: 72000, sales: 2450000 },
      { day: "Q2", visits: 81000, sales: 2780000 },
      { day: "Q3", visits: 91000, sales: 3120000 },
      { day: "Q4", visits: 98000, sales: 3490000 },
    ],
    sources: [
      { name: "Google Organic", category: "Search (SEO)", visits: 133380, revenue: 4850000, conversion: 3.5, share: 39, icon: "search", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
      { name: "Instagram & Meta Ads", category: "Social Campaigns", visits: 92340, revenue: 3190000, conversion: 2.8, share: 27, icon: "instagram", color: "text-pink-500 bg-pink-500/10 border-pink-500/20" },
      { name: "WhatsApp Business", category: "Direct Inquiries", visits: 54720, revenue: 2130000, conversion: 3.7, share: 16, icon: "whatsapp", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
      { name: "Architect & Designer Referrals", category: "B2B Trade", visits: 34200, revenue: 1300000, conversion: 2.4, share: 10, icon: "share", color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
      { name: "Direct / Bookmarks", category: "Brand Direct", visits: 27360, revenue: 370000, conversion: 1.5, share: 8, icon: "globe", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    ],
    devices: [
      { name: "Mobile", percentage: 63, visits: 215460, icon: "mobile" },
      { name: "Desktop", percentage: 32, visits: 109440, icon: "desktop" },
      { name: "Tablet", percentage: 5, visits: 17100, icon: "tablet" },
    ],
    topPages: [
      { path: "/products/heritage-wool-rug", title: "Mirzapur Heritage Hand-Tufted Wool Rug", views: 74200, orders: 670, bounceRate: "24%" },
      { path: "/", title: "Homepage - Ganga Handmade Rugs", views: 114000, orders: 440, bounceRate: "20%" },
      { path: "/products/bhadohi-persian-motif", title: "Bhadohi Traditional Persian Motif 8x10", views: 58900, orders: 512, bounceRate: "27%" },
      { path: "/products/organic-jute-cotton-runner", title: "Organic Jute & Handspun Cotton Runner", views: 48600, orders: 740, bounceRate: "29%" },
    ],
  },
};

function formatRupees(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function TrafficClient() {
  const [range, setRange] = useState<RangeKey>("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("Just now");
  const [liveJitter, setLiveJitter] = useState<number>(0);

  const data = RANGE_DATA[range];
  const liveCount = Math.max(1, data.liveNow + liveJitter);
  const maxVisitsInChart = Math.max(...data.chartDays.map((d) => d.visits));

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => {
      setLiveJitter(Math.floor(Math.random() * 5) - 2);
      const now = new Date();
      setLastUpdated(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className={`space-y-6 transition-opacity duration-200 ${isRefreshing ? "opacity-80" : "opacity-100"}`}>
      {/* Header and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Traffic &amp; Sales Attribution
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Track visitors, buyer origin channels, and revenue conversion from Google, Instagram, WhatsApp, and trade referrals.
          </p>
        </div>

        {/* Actions: Refresh & Date Range */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Refresh traffic analytics"
            className="group relative inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-950 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 transition-all cursor-pointer"
          >
            <RotateCw
              className={`size-3.5 text-slate-500 transition-transform duration-500 ${
                isRefreshing ? "animate-spin text-slate-900" : "group-hover:rotate-45"
              }`}
            />
            <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
            <span className="hidden lg:inline text-[10px] font-normal text-slate-400">
              • {lastUpdated}
            </span>
          </button>

          {/* Date Range Selector */}
          <div className="inline-flex rounded-xl bg-slate-200/80 p-1 shadow-inner">
            {(["today", "7d", "30d", "90d", "all"] as RangeKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setRange(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  range === key
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {RANGE_DATA[key].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Total Visitors
            </span>
            <Users className="size-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-950">
              {data.visitors.toLocaleString("en-IN")}
            </span>
            <span className="inline-flex items-center text-xs font-medium text-emerald-600">
              <ArrowUpRight className="size-3.5" />
              +{data.growth}%
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {data.unique.toLocaleString("en-IN")} unique shoppers
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Sales Revenue
            </span>
            <TrendingUp className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-950">
              {formatRupees(data.revenue)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Attributed checkout value</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Conversion Rate
            </span>
            <Compass className="size-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-950">{data.conversion}%</span>
            <span className="inline-flex items-center text-xs font-medium text-emerald-600">
              <ArrowUpRight className="size-3.5" />
              +0.4%
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Visitor-to-paid order</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Live On Store
            </span>
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{liveCount}</span>
            <span className="text-xs text-slate-500 font-medium">browsing now</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Active sessions</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Top Acquisition
            </span>
            <Search className="size-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-base font-bold text-slate-950">Google Organic</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">39% of all rug buyers</p>
        </Card>
      </div>

      {/* Visual Activity & Trend Graph */}
      <Card className="p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Traffic Activity &amp; Checkout Pace</h2>
            <p className="text-xs text-slate-500">
              Visits and corresponding revenue generated over {data.label.toLowerCase()}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="size-3 rounded-sm bg-slate-800" />
              Visitors
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="size-3 rounded-sm bg-[#bef264]" />
              Revenue
            </span>
          </div>
        </div>

        <div className="mt-6 flex h-48 items-end gap-3 pt-4 sm:gap-6">
          {data.chartDays.map((item) => {
            const heightPercent = Math.round((item.visits / maxVisitsInChart) * 100);
            return (
              <div key={item.day} className="flex flex-1 flex-col items-center gap-2 h-full justify-end group">
                <div className="relative w-full flex items-end justify-center h-full">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[42px] rounded-t-lg bg-slate-900 transition-all duration-300 group-hover:bg-[#bef264] relative"
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono py-1 px-2 rounded-md pointer-events-none whitespace-nowrap z-10 shadow-lg">
                      {item.visits} visits • {formatRupees(item.sales)}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-900">
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Grid: Traffic Sources & Device Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Attribution Sources Table */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Traffic Source Attribution</h2>
              <p className="text-xs text-slate-500">
                Where high-intent carpet buyers arrive from
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              5 Primary Channels
            </Badge>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="pb-3">Source Channel</th>
                  <th className="pb-3 text-right">Visitors</th>
                  <th className="pb-3 text-right">Traffic Share</th>
                  <th className="pb-3 text-right">Revenue</th>
                  <th className="pb-3 text-right">Conv. Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.sources.map((s) => (
                  <tr key={s.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex rounded-lg border p-1.5 ${s.color}`}>
                          {s.icon === "search" && <Search className="size-3.5" />}
                          {s.icon === "instagram" && <InstagramIcon className="size-3.5" />}
                          {s.icon === "whatsapp" && <MessageCircle className="size-3.5" />}
                          {s.icon === "globe" && <Globe className="size-3.5" />}
                          {s.icon === "share" && <Share2 className="size-3.5" />}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">{s.name}</p>
                          <p className="text-[11px] text-slate-400">{s.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono font-medium text-slate-700">
                      {s.visits.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-2 justify-end w-24">
                        <div className="h-1.5 w-14 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            style={{ width: `${s.share}%` }}
                            className="h-full rounded-full bg-slate-900"
                          />
                        </div>
                        <span className="font-mono text-slate-500">{s.share}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono font-semibold text-slate-900">
                      {formatRupees(s.revenue)}
                    </td>
                    <td className="py-3 text-right">
                      <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-700">
                        {s.conversion}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Device Breakdown */}
        <Card className="p-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Devices &amp; Platforms</h2>
            <p className="text-xs text-slate-500">Browsing hardware distribution</p>
          </div>

          <div className="mt-5 space-y-4">
            {data.devices.map((d) => (
              <div key={d.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-slate-800">
                    {d.icon === "mobile" && <Smartphone className="size-4 text-slate-500" />}
                    {d.icon === "desktop" && <Laptop className="size-4 text-slate-500" />}
                    {d.icon === "tablet" && <Tablet className="size-4 text-slate-500" />}
                    {d.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500">{d.visits.toLocaleString()}</span>
                    <span className="font-bold font-mono text-slate-900">{d.percentage}%</span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${d.percentage}%` }}
                    className={`h-full rounded-full ${
                      d.name === "Mobile"
                        ? "bg-[#bef264]"
                        : d.name === "Desktop"
                        ? "bg-slate-900"
                        : "bg-slate-400"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Mobile First Insight</p>
            <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
              64% of handmade rug browsers explore on smartphones via Instagram campaigns, while high-ticket 9x12 room rugs close primarily on Desktop.
            </p>
          </div>
        </Card>
      </div>

      {/* Top Viewed Rugs */}
      <Card className="p-6">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Top Viewed Catalog Pages</h2>
            <p className="text-xs text-slate-500">Most engaged product and landing pages</p>
          </div>
          <Badge variant="outline" className="text-xs">
            Live Traffic
          </Badge>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {data.topPages.map((page) => (
            <div
              key={page.path}
              className="flex flex-wrap items-center justify-between py-3 gap-3 text-xs"
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">{page.title}</p>
                <p className="font-mono text-[11px] text-slate-400">{page.path}</p>
              </div>
              <div className="flex items-center gap-6 font-mono text-xs">
                <div>
                  <span className="text-slate-400">Views: </span>
                  <span className="font-bold text-slate-800">{page.views.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400">Orders: </span>
                  <span className="font-bold text-emerald-600">{page.orders}</span>
                </div>
                <div>
                  <span className="text-slate-400">Bounce: </span>
                  <span className="text-slate-700">{page.bounceRate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
