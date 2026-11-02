"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Laptop,
  RotateCcw,
  Save,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tablet,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type DeviceMode = "desktop" | "tablet" | "mobile";

export function PreviewClient() {
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [announcement, setAnnouncement] = useState(
    "✨ Festive Season Special: Free Insured White-Glove Delivery Across India on Orders Above ₹15,000",
  );
  const [headline, setHeadline] = useState(
    "Heritage Handcrafted Rugs Woven For Generations",
  );
  const [subheading, setSubheading] = useState(
    "Direct from master looms in Bhadohi & Mirzapur. Crafted from 100% pure New Zealand wool and mulberry silk.",
  );
  const [promoCode, setPromoCode] = useState("HERITAGE15 • 15% OFF");
  const [badge1, setBadge1] = useState("100% Pure New Zealand Wool");
  const [badge2, setBadge2] = useState("Hand-Knotted in Bhadohi");
  const [badge3, setBadge3] = useState("Insured Pan-India Shipping");
  const [notice, setNotice] = useState<string | null>(null);

  const handleSave = () => {
    setNotice("✓ Storefront preview configuration published to live site!");
    setTimeout(() => setNotice(null), 3500);
  };

  const handleReset = () => {
    setAnnouncement(
      "✨ Festive Season Special: Free Insured White-Glove Delivery Across India on Orders Above ₹15,000",
    );
    setHeadline("Heritage Handcrafted Rugs Woven For Generations");
    setSubheading(
      "Direct from master looms in Bhadohi & Mirzapur. Crafted from 100% pure New Zealand wool and mulberry silk.",
    );
    setPromoCode("HERITAGE15 • 15% OFF");
    setNotice("✓ Reverted storefront copy to factory defaults.");
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {notice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Live Visual Storefront Editor
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Preview and edit your storefront headline, announcement bar, promotional badges, and viewports in real-time.
          </p>
        </div>

        {/* Viewport switch & action */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-200/80 p-1 shadow-inner">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                device === "desktop"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Laptop className="size-3.5" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice("tablet")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                device === "tablet"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Tablet className="size-3.5" />
              <span>Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                device === "mobile"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Smartphone className="size-3.5" />
              <span>Mobile</span>
            </button>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
          >
            <ExternalLink className="size-3.5" />
            Live Site ↗
          </a>
        </div>
      </div>

      {/* Editor & Preview Split View */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Visual Customizer Controls */}
        <Card className="p-6 lg:col-span-4 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Storefront Content</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 text-[11px] text-slate-500 hover:text-slate-900"
            >
              <RotateCcw className="size-3 mr-1" />
              Reset
            </Button>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-slate-700">Top Announcement Bar</label>
              <textarea
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                rows={2}
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700">Hero Headline</label>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700">Hero Subtitle</label>
              <textarea
                value={subheading}
                onChange={(e) => setSubheading(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                rows={3}
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700">Promotional Offer Badge</label>
              <Input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="mt-1 h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="font-semibold text-slate-700">Trust Guarantee Badges</label>
              <Input
                value={badge1}
                onChange={(e) => setBadge1(e.target.value)}
                placeholder="Badge 1"
                className="h-8 text-xs"
              />
              <Input
                value={badge2}
                onChange={(e) => setBadge2(e.target.value)}
                placeholder="Badge 2"
                className="h-8 text-xs"
              />
              <Input
                value={badge3}
                onChange={(e) => setBadge3(e.target.value)}
                placeholder="Badge 3"
                className="h-8 text-xs"
              />
            </div>

            <div className="pt-3">
              <Button
                onClick={handleSave}
                className="w-full gap-2 rounded-xl bg-slate-950 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                <Save className="size-3.5 text-[#bef264]" />
                Publish Storefront Changes
              </Button>
            </div>
          </div>
        </Card>

        {/* Right Column: Live Simulated Storefront Canvas */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div
            className={`w-full transition-all duration-300 border border-slate-300/80 rounded-2xl bg-[#0b0f19] shadow-2xl overflow-hidden ${
              device === "mobile"
                ? "max-w-[375px]"
                : device === "tablet"
                ? "max-w-[768px]"
                : "max-w-full"
            }`}
          >
            {/* Browser Frame Top Chrome */}
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-2.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-rose-500/80" />
                <span className="size-2.5 rounded-full bg-amber-500/80" />
                <span className="size-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="rounded-md bg-white/5 px-4 py-0.5 font-mono text-[10px] text-slate-300 border border-white/5">
                gangahandmade.com
              </div>
              <span className="text-[10px] uppercase font-mono text-slate-400">{device}</span>
            </div>

            {/* Simulated Live Storefront Header */}
            <div className="bg-[#121826] text-white">
              {/* Top Announcement Bar */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/10 px-4 py-2 text-center text-[11px] font-medium text-slate-200">
                {announcement}
              </div>

              {/* Navigation Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-[#bef264] text-slate-950 font-bold flex items-center justify-center text-xs">
                    GH
                  </div>
                  <span className="font-bold tracking-tight text-white text-sm">
                    Ganga Handmade Rugs
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-5 text-xs text-slate-300 font-medium">
                  <span className="hover:text-white cursor-pointer">Collections</span>
                  <span className="hover:text-white cursor-pointer">Hand-Knotted</span>
                  <span className="hover:text-white cursor-pointer">Custom Loom</span>
                  <span className="hover:text-white cursor-pointer">About Artisans</span>
                </div>
              </div>

              {/* Hero Banner Section */}
              <div className="p-8 sm:p-12 text-center bg-gradient-to-b from-[#121826] via-[#0b0f19] to-[#070a12]">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#bef264]/40 bg-[#bef264]/10 px-3.5 py-1 text-xs font-semibold text-[#bef264]">
                  <Sparkles className="size-3" />
                  {promoCode}
                </span>

                <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight">
                  {headline}
                </h2>

                <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                  {subheading}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    className="rounded-xl bg-[#bef264] px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-[#a3e635] transition-all"
                  >
                    Explore Curated Catalog
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-all"
                  >
                    Request Custom Loom Size
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/10 pt-6 text-xs text-slate-300">
                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="size-4 text-[#bef264]" />
                    <span>{badge1}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="size-4 text-[#bef264]" />
                    <span>{badge2}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Truck className="size-4 text-[#bef264]" />
                    <span>{badge3}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
