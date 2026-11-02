import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/admin-session";

export async function GET() {
  await requireAdmin("admin");

  const rows = [
    ["ID", "Name", "Email", "Phone", "Collection Interest", "Tier", "Status", "Joined"],
    ["WL-201", "Dr. Ananya Sen", "ananya.sen@manipal.edu", "+919845077123", "Kashmiri Silk-on-Silk Vintage Loom Batch", "Private Collector", "waiting", "2026-11-02"],
    ["WL-202", "Vikramaditya Oberoi", "vikram@oberoidesign.in", "+919820044901", "Limited Antique Persian Wool Re-edition", "VIP Architect", "invited", "2026-11-01"],
    ["WL-203", "Roshni Singhal", "roshni.singhal@gmail.com", "+919717033812", "Hand-Knotted Moroccan Tribal Wool Series", "Early Bird Retail", "converted", "2026-10-31"],
    ["WL-204", "Arjun Nambiar", "arjun@nambiar-interiors.com", "+919884012399", "Bespoke Jute & Indigo Hand-Spun Runner Drop", "VIP Architect", "waiting", "2026-10-30"],
    ["WL-205", "Priyanka Kothari", "priyanka.kothari@kotharilaw.com", "+919811099402", "Kashmiri Silk-on-Silk Vintage Loom Batch", "Private Collector", "invited", "2026-10-28"],
    ["WL-206", "Sameer Tandon", "sameer.tandon@yahoo.co.in", "+919920188401", "Limited Antique Persian Wool Re-edition", "Early Bird Retail", "converted", "2026-10-26"],
  ];

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ganga-waitlist-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
