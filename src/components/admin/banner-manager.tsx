"use client";

import * as React from "react";
import { Eye, EyeOff, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "@/components/ui/sonner";
import { createBanner, deleteBanner, toggleBanner } from "@/server/actions/admin-modules";

export interface BannerItem {
  id: number;
  title: string;
  subtitle: string | null;
  linkUrl: string;
  position: number;
  isActive: boolean;
  createdAt: Date;
}

interface BannerManagerProps {
  initialBanners: BannerItem[];
}

const fieldClass =
  "mt-1.5 h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs shadow-2xs focus:border-[#bef264]";

export function BannerManager({ initialBanners }: BannerManagerProps) {
  const [banners, setBanners] = React.useState<BannerItem[]>(initialBanners);
  const [title, setTitle] = React.useState("");
  const [subtitle, setSubtitle] = React.useState("");
  const [linkUrl, setLinkUrl] = React.useState("");
  const [position, setPosition] = React.useState("0");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<number | null>(null);

  React.useEffect(() => {
    setBanners(initialBanners);
  }, [initialBanners]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a banner title");
      return;
    }
    if (!linkUrl.trim()) {
      toast.error("Please provide a site target link (e.g. /products)");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("subtitle", subtitle.trim());
      formData.set("linkUrl", linkUrl.trim());
      formData.set("position", position || "0");

      await createBanner(formData);
      toast.success(`Banner "${title.trim()}" published!`);
      setTitle("");
      setSubtitle("");
      setLinkUrl("");
      setPosition("0");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish banner";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: number, currentTitle: string, isLive: boolean) => {
    setTogglingId(id);
    try {
      await toggleBanner(id);
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isActive: !isLive } : b))
      );
      if (!isLive) {
        toast.success(`Banner "${currentTitle}" is now LIVE on homepage`);
      } else {
        toast.info(`Banner "${currentTitle}" hidden from storefront`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle banner";
      toast.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: number, currentTitle: string) => {
    await deleteBanner(id);
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-6">
      <form
        noValidate
        onSubmit={handleCreate}
        className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:grid-cols-2"
      >
        <div className="sm:col-span-2 border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            <span>Add New Promotional Banner</span>
          </h2>
        </div>
        <label className="block text-xs font-semibold text-slate-700">
          Title <span className="text-rose-500">*</span>
          <Input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            maxLength={80}
            placeholder="e.g. Festival Heritage Collection"
            className={fieldClass}
          />
        </label>
        <label className="block text-xs font-semibold text-slate-700">
          Subtitle
          <Input
            name="subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            disabled={isSubmitting}
            maxLength={160}
            placeholder="e.g. Up to 20% off authentic hand-knotted wool"
            className={fieldClass}
          />
        </label>
        <label className="block text-xs font-semibold text-slate-700">
          Target Link (Site Path) <span className="text-rose-500">*</span>
          <Input
            name="linkUrl"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            disabled={isSubmitting}
            placeholder="/products?category=hand-knotted"
            className={fieldClass}
          />
        </label>
        <label className="block text-xs font-semibold text-slate-700">
          Display Position
          <Input
            name="position"
            type="number"
            min="0"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            disabled={isSubmitting}
            className={fieldClass}
          />
        </label>
        <div className="sm:col-span-2 flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-9 rounded-full bg-[#bef264] px-6 text-xs font-bold text-slate-950 shadow-xs hover:bg-[#a3e635] cursor-pointer inline-flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Plus className="size-3.5" />
                <span>Publish Banner</span>
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Active Banners ({banners.length})</span>
          <span className="text-[10px] text-slate-400">Homepage Carousel</span>
        </div>

        <ul className="divide-y divide-slate-100">
          {banners.length === 0 ? (
            <li className="p-8 text-center text-xs text-slate-500">
              No promotional banners configured yet.
            </li>
          ) : (
            banners.map((banner) => {
              const isToggling = togglingId === banner.id;
              return (
                <li
                  key={banner.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 text-xs transition-colors hover:bg-slate-50/60"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{banner.title}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          banner.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {banner.isActive ? "Live" : "Draft"}
                      </span>
                    </div>
                    {banner.subtitle && (
                      <p className="mt-0.5 text-slate-600 text-xs">{banner.subtitle}</p>
                    )}
                    <p className="mt-1 font-mono text-[11px] text-slate-400">
                      Link: {banner.linkUrl} • Position: {banner.position}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      disabled={isToggling}
                      onClick={() => handleToggle(banner.id, banner.title, banner.isActive)}
                      className="rounded-full border-slate-200 hover:bg-slate-100 text-xs px-3 inline-flex items-center gap-1 cursor-pointer"
                    >
                      {banner.isActive ? (
                        <>
                          <EyeOff className="size-3" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="size-3" />
                          <span>Show</span>
                        </>
                      )}
                    </Button>

                    <ConfirmDeleteDialog
                      title="Delete Store Banner?"
                      itemName={banner.title}
                      description={`Are you sure you want to remove the banner "${banner.title}" from your storefront carousel?`}
                      confirmText="Delete Banner"
                      successMessage={`Banner "${banner.title}" deleted`}
                      onConfirm={() => handleDelete(banner.id, banner.title)}
                      trigger={
                        <Button
                          type="button"
                          variant="destructive"
                          size="xs"
                          className="rounded-full text-xs px-3 cursor-pointer"
                        >
                          <Trash2 className="size-3" />
                          <span>Delete</span>
                        </Button>
                      }
                    />
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
