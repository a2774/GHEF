"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { deleteAddress } from "@/server/actions/checkout";

export function DeleteAddressButton({
  id,
  addressLine,
}: {
  id: number;
  addressLine: string;
}) {
  return (
    <ConfirmDeleteDialog
      title="Delete Address?"
      itemName={addressLine}
      description={`Are you sure you want to delete this saved delivery address?`}
      confirmText="Delete Address"
      successMessage="Delivery address removed"
      onConfirm={async () => {
        await deleteAddress(id);
      }}
      trigger={
        <Button
          type="button"
          variant="destructive"
          className="h-10 rounded-full px-4 text-base cursor-pointer inline-flex items-center gap-1.5"
        >
          <Trash2 className="size-4" />
          <span>Delete</span>
        </Button>
      }
    />
  );
}
