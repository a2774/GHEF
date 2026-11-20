"use client";

import { Copy, Loader2, Pencil, Power, RefreshCw, Settings, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";
import {
  duplicateProduct,
  type ProductActionResult,
  removeProduct,
  renewProduct,
  setProductStatus,
} from "@/server/actions/admin-products";

/**
 * The gear menu at the end of each row in the product list. Every change here clears the
 * store's cache on the server, so the storefront shows it straight away.
 */
export function ProductActions({
  id,
  title,
  slug,
  status,
  canDelete,
}: {
  id: number;
  title: string;
  slug: string;
  status: "draft" | "active" | "archived";
  canDelete: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isActive = status === "active";

  function run(task: () => Promise<ProductActionResult>, successMessage: string) {
    startTransition(async () => {
      const result = await task();
      if (result.ok) toast.success(successMessage);
      else toast.error(result.error);
    });
  }

  function copyProduct() {
    startTransition(async () => {
      const result = await duplicateProduct(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      // Open the copy in the edit form straight away, with everything copied except the photos.
      toast.success("Copy created with all details. Add the photos, then publish it.");
      router.push(`/admin/products/${result.id}`);
    });
  }

  async function shareProduct() {
    const url = `${window.location.origin}/products/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Product link copied", { description: url });
    } catch {
      toast.error("Could not copy the link. Copy it from the live listing instead.");
    }
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Actions for ${title}`}
            disabled={pending}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs transition-colors hover:border-[#0B0F19] hover:bg-[#0B0F19] hover:text-white focus-visible:ring-2 focus-visible:ring-[#bef264] focus-visible:outline-none disabled:cursor-wait disabled:opacity-60 data-[state=open]:border-[#0B0F19] data-[state=open]:bg-[#0B0F19] data-[state=open]:text-white"
          >
            {pending ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <Settings aria-hidden="true" className="size-4" />}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/products/${id}`}>
              <Pencil aria-hidden="true" />
              <span>Edit</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={copyProduct}>
            <Copy aria-hidden="true" />
            <span>Copy</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() =>
              run(
                () => setProductStatus(id, isActive ? "draft" : "active"),
                isActive ? "Deactivated. It is hidden from the store." : "Activated. It is live on the store.",
              )
            }
          >
            <Power aria-hidden="true" />
            <span>{isActive ? "Deactivate" : "Activate"}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => run(() => renewProduct(id), "Renewed. It now shows first under New arrivals.")}
          >
            <RefreshCw aria-hidden="true" />
            <span>Renew</span>
          </DropdownMenuItem>

          <DropdownMenuItem disabled={!isActive} onSelect={shareProduct}>
            <Share2 aria-hidden="true" />
            <span>{isActive ? "Share" : "Share (activate first)"}</span>
          </DropdownMenuItem>

          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setDeleteOpen(true)}
                className="text-rose-600 hover:bg-rose-50 focus:bg-rose-50 [&_svg]:text-rose-500"
              >
                <Trash2 aria-hidden="true" />
                <span>Delete</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canDelete && (
        <ConfirmDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete Product?"
          itemName={title}
          description={`Are you sure you want to permanently delete "${title}"? Its sizes and photos will be removed and it will disappear from the store.`}
          confirmText="Delete Product"
          successMessage={`Product "${title}" deleted`}
          onConfirm={async () => {
            const result = await removeProduct(id);
            if (!result.ok) throw new Error(result.error);
          }}
        />
      )}
    </>
  );
}
