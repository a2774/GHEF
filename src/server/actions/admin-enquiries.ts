"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/server/auth/admin-session";
import { updateEnquiryStatus } from "@/server/services/enquiries";

export async function changeEnquiryStatus(id: number, form: FormData) {
  await requireAdmin("staff");
  const status = String(form.get("status") ?? "new");
  await updateEnquiryStatus(id, status);
  revalidatePath("/admin/enquiries");
}
