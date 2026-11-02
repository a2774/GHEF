"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  LifeBuoy,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface SupportTicket {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  subject: string;
  category: "Custom Sizing" | "Shipping & Delivery" | "Care & Cleaning" | "Damage / Return" | "Architect Trade";
  priority: "urgent" | "high" | "normal" | "low";
  status: "open" | "in_progress" | "resolved";
  orderNumber?: string;
  createdAt: string;
  lastReply: string;
  messages: {
    sender: "customer" | "agent";
    text: string;
    timestamp: string;
  }[];
}

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "TICK-401",
    customerName: "Devika Roy",
    email: "devika.roy@designers.in",
    phone: "+91 98300 12845",
    subject: "Custom Loom timeline for 12x15 ft living room carpet",
    category: "Custom Sizing",
    priority: "urgent",
    status: "open",
    orderNumber: "GH-8821",
    createdAt: "Today, 10:15 AM",
    lastReply: "30m ago by Customer",
    messages: [
      {
        sender: "customer",
        text: "Namaste! We placed order GH-8821 for the custom 12x15 ft Bhadohi hand-knotted wool rug. Could you share photographs from the loom master and the estimated weaving completion date?",
        timestamp: "Today, 10:15 AM",
      },
    ],
  },
  {
    id: "TICK-402",
    customerName: "Siddharth Malviya",
    email: "siddharth.m@gmail.com",
    phone: "+91 99201 55670",
    subject: "Wool care query: Red wine spill on ivory Berber runner",
    category: "Care & Cleaning",
    priority: "high",
    status: "in_progress",
    createdAt: "Yesterday, 4:40 PM",
    lastReply: "2 hours ago by Agent",
    messages: [
      {
        sender: "customer",
        text: "Hi team, accidentally spilled wine on the edge of the Scandinavian ivory rug. What immediate blotting steps should I follow to avoid stripping the lanolin oil?",
        timestamp: "Yesterday, 4:40 PM",
      },
      {
        sender: "agent",
        text: "Hello Siddharth! Please do NOT scrub. Immediately blot gently with clean, dry cotton towels, then apply a diluted mixture of lukewarm water with white vinegar (1:1). We are preparing detailed woolen spot-cleaning instructions for you.",
        timestamp: "Today, 11:00 AM",
      },
    ],
  },
  {
    id: "TICK-403",
    customerName: "Meenakshi Sundaram",
    email: "meenakshi.s@chennai-arch.com",
    phone: "+91 98401 99200",
    subject: "White-glove delivery appointment for penthouse delivery in Chennai",
    category: "Shipping & Delivery",
    priority: "normal",
    status: "open",
    orderNumber: "GH-8790",
    createdAt: "Yesterday, 1:20 PM",
    lastReply: "1 day ago by Customer",
    messages: [
      {
        sender: "customer",
        text: "Please coordinate with BlueDart / SafeExpress white-glove team to schedule uncrating on Saturday after 11 AM as service elevator booking is required.",
        timestamp: "Yesterday, 1:20 PM",
      },
    ],
  },
  {
    id: "TICK-404",
    customerName: "Kabir Varma",
    email: "kabir.varma@varma-hospitality.com",
    phone: "+91 98111 44502",
    subject: "Sample swatch request for 8 resort suite carpets",
    category: "Architect Trade",
    priority: "normal",
    status: "in_progress",
    createdAt: "3 days ago",
    lastReply: "Yesterday by Agent",
    messages: [
      {
        sender: "customer",
        text: "We are finalizing 8 suites for an eco-resort in Kasauli. Can we get 6x6 inch yarn color poms and wool quality swatches dispatched to our Delhi studio?",
        timestamp: "3 days ago",
      },
      {
        sender: "agent",
        text: "Hi Kabir! Swatch box #SW-409 with pure New Zealand wool and hand-spun jute poms has been prepared and dispatched via DHL Express.",
        timestamp: "Yesterday, 3:30 PM",
      },
    ],
  },
  {
    id: "TICK-405",
    customerName: "Rashmi Kulkarni",
    email: "rashmi.kulkarni@gmail.com",
    phone: "+91 97654 32100",
    subject: "Minor edge binding fray during transit",
    category: "Damage / Return",
    priority: "urgent",
    status: "resolved",
    orderNumber: "GH-8640",
    createdAt: "5 days ago",
    lastReply: "2 days ago by Agent",
    messages: [
      {
        sender: "customer",
        text: "Received package yesterday. The exterior corner of the protective bag had a small tear that frayed about 1 inch of border binding.",
        timestamp: "5 days ago",
      },
      {
        sender: "agent",
        text: "We are deeply sorry for the transit mishandling. Our master artisan in Pune has been dispatched to perform an on-site master repair re-binding at zero charge.",
        timestamp: "2 days ago",
      },
    ],
  },
];

const QUICK_MACROS = [
  {
    title: "Custom Loom Timeline",
    text: "Namaste! Your custom hand-knotted carpet is currently progressing on our master loom in Bhadohi. Our weavers have completed approximately 60% of the knot density. We expect off-loom washing and stretching in 12-14 days.",
  },
  {
    title: "Wool Cleaning Guidelines",
    text: "For pure woolen rugs: Blot immediately with dry undyed cotton towels. Never use harsh detergent or bleach. Dilute 1 teaspoon of gentle wool wash in lukewarm water and dab softly along the direction of the pile.",
  },
  {
    title: "Dispatch & Tracking Update",
    text: "Your handcrafted rug has been packed in triple-ply moisture-proof protective covers and handed over to our insured express logistics partner. Live GPS tracking has been activated.",
  },
];

export function SupportClient() {
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "in_progress" | "resolved">("all");
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const filtered = tickets.filter((t) => {
    const matchStatus = filterStatus === "all" ? true : t.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      t.customerName.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      (t.orderNumber && t.orderNumber.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

  const handleSendReply = () => {
    if (!selectedTicket || !replyText.trim()) return;

    const newMsg = {
      sender: "agent" as const,
      text: replyText.trim(),
      timestamp: "Just now",
    };

    const updated = {
      ...selectedTicket,
      status: "in_progress" as const,
      lastReply: "Just now by Agent",
      messages: [...selectedTicket.messages, newMsg],
    };

    setTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? updated : t)));
    setSelectedTicket(updated);
    setReplyText("");
    setNotice(`✓ Reply sent to ${selectedTicket.customerName} (${selectedTicket.email})`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleUpdateStatus = (id: string, newStatus: SupportTicket["status"]) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    );
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    setNotice(`✓ Updated ticket status to ${newStatus.replace("_", " ").toUpperCase()}`);
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

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Helpdesk &amp; Support Tickets
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Resolve bespoke sizing requests, wool care queries, shipping coordination, and after-sales trade consultations.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Open Tickets</span>
            <LifeBuoy className="size-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{openCount}</span>
            <span className="text-xs text-slate-400">requiring action</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Customer awaiting response</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>In Progress</span>
            <Clock className="size-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-950">{inProgressCount}</span>
            <span className="text-xs text-slate-400">under investigation</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">With loom or logistics team</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Avg First Response</span>
            <Sparkles className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">1.4 hrs</span>
            <span className="text-xs font-semibold text-emerald-700">Fast</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">SLA target: &lt; 4 hours</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Resolved</span>
            <CheckCircle2 className="size-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-950">{resolvedCount}</span>
            <span className="text-xs font-bold text-emerald-600">98% satisfaction</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Closed with positive rating</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(
            [
              { id: "all", label: "All Tickets", count: tickets.length },
              { id: "open", label: "Open", count: openCount },
              { id: "in_progress", label: "In Progress", count: inProgressCount },
              { id: "resolved", label: "Resolved", count: resolvedCount },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilterStatus(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                filterStatus === t.id
                  ? "bg-slate-900 text-white font-semibold shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  filterStatus === t.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
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
            placeholder="Search customer, order, subject..."
            className="h-9 pl-9 text-xs"
          />
        </div>
      </div>

      {/* Tickets Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="p-4">Ticket</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Subject &amp; Category</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Activity</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No support tickets match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-4 align-top font-mono font-bold text-slate-900">
                      {ticket.id}
                      {ticket.orderNumber && (
                        <span className="block text-[10px] font-normal text-slate-400">
                          Order: {ticket.orderNumber}
                        </span>
                      )}
                    </td>

                    <td className="p-4 align-top">
                      <p className="font-bold text-slate-900">{ticket.customerName}</p>
                      <p className="font-mono text-slate-500 text-[11px]">{ticket.email}</p>
                    </td>

                    <td className="p-4 align-top max-w-sm">
                      <p className="font-semibold text-slate-900 line-clamp-1">{ticket.subject}</p>
                      <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        {ticket.category}
                      </span>
                    </td>

                    <td className="p-4 align-top">
                      {ticket.priority === "urgent" && (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                          Urgent
                        </span>
                      )}
                      {ticket.priority === "high" && (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                          High
                        </span>
                      )}
                      {ticket.priority === "normal" && (
                        <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          Normal
                        </span>
                      )}
                      {ticket.priority === "low" && (
                        <span className="text-slate-400 text-[11px]">Low</span>
                      )}
                    </td>

                    <td className="p-4 align-top">
                      {ticket.status === "open" && (
                        <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-900">
                          Open
                        </Badge>
                      )}
                      {ticket.status === "in_progress" && (
                        <Badge variant="outline" className="border-blue-400 bg-blue-50 text-blue-900">
                          In Progress
                        </Badge>
                      )}
                      {ticket.status === "resolved" && (
                        <Badge variant="outline" className="border-emerald-400 bg-emerald-50 text-emerald-900">
                          ✓ Resolved
                        </Badge>
                      )}
                    </td>

                    <td className="p-4 align-top text-slate-500 text-[11px]">
                      {ticket.lastReply}
                    </td>

                    <td className="p-4 align-top text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicket(ticket);
                        }}
                        className="h-7 text-[11px]"
                      >
                        View &amp; Reply
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Ticket Details Drawer */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-5 bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 text-base">
                    {selectedTicket.id}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {selectedTicket.category}
                  </Badge>
                  {selectedTicket.orderNumber && (
                    <span className="text-xs font-mono text-slate-500">
                      (Order #{selectedTicket.orderNumber})
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-950 text-base mt-1">
                  {selectedTicket.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-900"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Customer Details Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 text-xs bg-white">
              <div>
                <p className="font-semibold text-slate-900">{selectedTicket.customerName}</p>
                <p className="font-mono text-slate-500 text-[11px]">{selectedTicket.email} • {selectedTicket.phone}</p>
              </div>

              {/* Status Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Status:</span>
                <select
                  value={selectedTicket.status}
                  onChange={(e) =>
                    handleUpdateStatus(selectedTicket.id, e.target.value as SupportTicket["status"])
                  }
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
              {selectedTicket.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.sender === "agent" ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                    <span>{msg.sender === "agent" ? "Ganga Rugs Concierge" : selectedTicket.customerName}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.sender === "agent"
                        ? "bg-slate-950 text-white rounded-tr-xs"
                        : "bg-white text-slate-900 border border-slate-200/80 shadow-2xs rounded-tl-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Macro Templates */}
            <div className="border-t border-slate-200 bg-white p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Quick Handcrafted Rug Presets:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_MACROS.map((macro, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReplyText(macro.text)}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  >
                    {macro.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Reply Input Box */}
            <div className="border-t border-slate-200 bg-white p-4">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response to the patron or paste a macro above..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                rows={3}
              />
              <div className="mt-2.5 flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  Replies are delivered instantly to {selectedTicket.email}
                </p>
                <Button
                  size="sm"
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="gap-1.5 rounded-xl bg-slate-950 text-xs text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  <Send className="size-3.5" />
                  Send Reply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
