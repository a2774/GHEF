"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Download,
  Plus,
  Search,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  collectionInterest: string;
  tier: "VIP Architect" | "Private Collector" | "Early Bird Retail";
  notes: string;
  joinedAt: string;
  status: "waiting" | "invited" | "converted";
}

const INITIAL_WAITLIST: WaitlistEntry[] = [
  {
    id: "WL-201",
    name: "Dr. Ananya Sen",
    email: "ananya.sen@manipal.edu",
    phone: "+91 98450 77123",
    collectionInterest: "Kashmiri Silk-on-Silk Vintage Loom Batch",
    tier: "Private Collector",
    notes: "Interested in 9x12 ft medallion motif for heritage residence",
    joinedAt: "Today, 11:20 AM",
    status: "waiting",
  },
  {
    id: "WL-202",
    name: "Vikramaditya Oberoi",
    email: "vikram@oberoidesign.in",
    phone: "+91 98200 44901",
    collectionInterest: "Limited Antique Persian Wool Re-edition",
    tier: "VIP Architect",
    notes: "Lead designer for luxury hospitality villa project in Goa",
    joinedAt: "Yesterday",
    status: "invited",
  },
  {
    id: "WL-203",
    name: "Roshni Singhal",
    email: "roshni.singhal@gmail.com",
    phone: "+91 97170 33812",
    collectionInterest: "Hand-Knotted Moroccan Tribal Wool Series",
    tier: "Early Bird Retail",
    notes: "Subscribed via Instagram teaser post",
    joinedAt: "2 days ago",
    status: "converted",
  },
  {
    id: "WL-204",
    name: "Arjun Nambiar",
    email: "arjun@nambiar-interiors.com",
    phone: "+91 98840 12399",
    collectionInterest: "Bespoke Jute & Indigo Hand-Spun Runner Drop",
    tier: "VIP Architect",
    notes: "Needs 4 runners with custom border fringes",
    joinedAt: "3 days ago",
    status: "waiting",
  },
  {
    id: "WL-205",
    name: "Priyanka Kothari",
    email: "priyanka.kothari@kotharilaw.com",
    phone: "+91 98110 99402",
    collectionInterest: "Kashmiri Silk-on-Silk Vintage Loom Batch",
    tier: "Private Collector",
    notes: "Wants certificate of authenticity and master weaver signature",
    joinedAt: "5 days ago",
    status: "invited",
  },
  {
    id: "WL-206",
    name: "Sameer Tandon",
    email: "sameer.tandon@yahoo.co.in",
    phone: "+91 99201 88401",
    collectionInterest: "Limited Antique Persian Wool Re-edition",
    tier: "Early Bird Retail",
    notes: "Looking for 8x10 living room carpet",
    joinedAt: "1 week ago",
    status: "converted",
  },
];

export function WaitlistClient() {
  const [entries, setEntries] = useState<WaitlistEntry[]>(INITIAL_WAITLIST);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "waiting" | "invited" | "converted">("all");
  const [notice, setNotice] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New entry form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newInterest, setNewInterest] = useState("Kashmiri Silk-on-Silk Vintage Loom Batch");
  const [newTier, setNewTier] = useState<WaitlistEntry["tier"]>("Private Collector");
  const [newNotes, setNewNotes] = useState("");

  const filtered = entries.filter((e) => {
    const matchesStatus = statusFilter === "all" ? true : e.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.collectionInterest.toLowerCase().includes(q) ||
      e.tier.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleSendInvite = (id: string, email: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "invited" } : e)),
    );
    setNotice(`✓ Private VIP Drop access invite token emailed to ${email}`);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;

    const newId = `WL-${entries.length + 201}`;
    const newEntry: WaitlistEntry = {
      id: newId,
      name: newName,
      email: newEmail,
      phone: newPhone || "+91 98000 00000",
      collectionInterest: newInterest,
      tier: newTier,
      notes: newNotes || "Added directly by Admin",
      joinedAt: "Just now",
      status: "waiting",
    };

    setEntries([newEntry, ...entries]);
    setShowAddModal(false);
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewNotes("");
    setNotice(`✓ Successfully added ${newName} to the VIP waitlist!`);
    setTimeout(() => setNotice(null), 3500);
  };

  const waitingCount = entries.filter((e) => e.status === "waiting").length;
  const invitedCount = entries.filter((e) => e.status === "invited").length;
  const convertedCount = entries.filter((e) => e.status === "converted").length;

  return (
    <div className="space-y-6">
      {notice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            VIP Waitlist &amp; Private Drops
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Exclusive early access queue for limited artisan releases, bespoke loom allocations, and architect previews.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/admin/waitlist/export"
            download
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:text-slate-950 shadow-2xs"
          >
            <Download className="size-3.5" />
            Export CSV
          </a>
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="gap-1.5 rounded-xl bg-slate-950 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <Plus className="size-3.5" />
            Add VIP Member
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Total Waitlist</span>
            <Users className="size-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-950">{entries.length}</span>
            <span className="text-xs text-slate-400">patrons &amp; trade</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Waiting for exclusive drops</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Waiting for Access</span>
            <Clock className="size-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{waitingCount}</span>
            <span className="text-xs text-slate-400">ready to invite</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Pending next batch drop</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Invited to Drop</span>
            <Send className="size-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-600">{invitedCount}</span>
            <span className="text-xs text-slate-400">with private password</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Private link delivered</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Converted to Buyer</span>
            <Sparkles className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{convertedCount}</span>
            <span className="text-xs font-bold text-emerald-700">
              ({Math.round((convertedCount / entries.length) * 100)}%)
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Completed order from waitlist</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(
            [
              { id: "all", label: "All Members", count: entries.length },
              { id: "waiting", label: "Waiting", count: waitingCount },
              { id: "invited", label: "Invited", count: invitedCount },
              { id: "converted", label: "Converted", count: convertedCount },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setStatusFilter(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                statusFilter === t.id
                  ? "bg-slate-900 text-white font-semibold shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  statusFilter === t.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, collection..."
            className="h-9 pl-9 text-xs"
          />
        </div>
      </div>

      {/* Table Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="p-4">Member Info</th>
                <th className="p-4">Collection Interest</th>
                <th className="p-4">Patron Tier</th>
                <th className="p-4">Notes / Sizing</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No waitlist members match current criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 align-top">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="font-mono text-slate-500 text-[11px]">{item.email}</p>
                      <p className="text-[11px] text-slate-400">{item.phone}</p>
                    </td>

                    <td className="p-4 align-top font-medium text-slate-800 max-w-[200px]">
                      <span className="line-clamp-2">{item.collectionInterest}</span>
                    </td>

                    <td className="p-4 align-top">
                      <Badge
                        variant="outline"
                        className={
                          item.tier === "VIP Architect"
                            ? "border-violet-300 bg-violet-50 text-violet-800"
                            : item.tier === "Private Collector"
                            ? "border-amber-300 bg-amber-50 text-amber-900"
                            : "border-slate-300 bg-slate-50 text-slate-700"
                        }
                      >
                        {item.tier}
                      </Badge>
                    </td>

                    <td className="p-4 align-top text-slate-500 max-w-xs text-[11px]">
                      {item.notes}
                    </td>

                    <td className="p-4 align-top text-slate-500 whitespace-nowrap text-[11px]">
                      {item.joinedAt}
                    </td>

                    <td className="p-4 align-top">
                      {item.status === "waiting" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                          <span className="size-1.5 rounded-full bg-amber-500" />
                          Waiting
                        </span>
                      )}
                      {item.status === "invited" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
                          <span className="size-1.5 rounded-full bg-blue-500" />
                          Invite Sent
                        </span>
                      )}
                      {item.status === "converted" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#bef264]/40 px-2.5 py-0.5 text-[11px] font-bold text-slate-900 border border-[#bef264]">
                          ✓ Purchased
                        </span>
                      )}
                    </td>

                    <td className="p-4 align-top text-right">
                      {item.status === "waiting" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendInvite(item.id, item.email)}
                          className="h-7 gap-1 text-[11px] text-slate-900 hover:bg-slate-900 hover:text-white"
                        >
                          <Send className="size-3" />
                          Send Invite
                        </Button>
                      )}
                      {item.status === "invited" && (
                        <span className="text-[11px] text-slate-400">Passcode active</span>
                      )}
                      {item.status === "converted" && (
                        <span className="text-[11px] font-medium text-emerald-700">VIP Order Placed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add VIP Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h2 className="text-lg font-bold text-slate-950">Add Member to VIP Waitlist</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter customer or architect details for advance drop notification.
            </p>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Full Name *</label>
                <Input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Radhika Apte"
                  className="mt-1 h-8 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Email Address *</label>
                <Input
                  required
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="radhika@example.com"
                  className="mt-1 h-8 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Phone (WhatsApp)</label>
                <Input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98000 00000"
                  className="mt-1 h-8 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Collection Drop Interest</label>
                <select
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="Kashmiri Silk-on-Silk Vintage Loom Batch">Kashmiri Silk-on-Silk Vintage Loom Batch</option>
                  <option value="Limited Antique Persian Wool Re-edition">Limited Antique Persian Wool Re-edition</option>
                  <option value="Hand-Knotted Moroccan Tribal Wool Series">Hand-Knotted Moroccan Tribal Wool Series</option>
                  <option value="Bespoke Jute & Indigo Hand-Spun Runner Drop">Bespoke Jute & Indigo Hand-Spun Runner Drop</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Member Tier</label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value as WaitlistEntry["tier"])}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="Private Collector">Private Collector</option>
                  <option value="VIP Architect">VIP Architect</option>
                  <option value="Early Bird Retail">Early Bird Retail</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Custom Sizing / Loom Notes</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Requires 10x14 room size with ivory fringe"
                  className="mt-1 w-full rounded-md border border-slate-200 p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  rows={2}
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-slate-950 text-xs text-white hover:bg-slate-800"
                >
                  Save to Waitlist
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
