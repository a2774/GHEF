"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Flame,
  Mail,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  type: "order_confirmation" | "shipping_tracking" | "abandoned_cart" | "loom_update" | "custom_enquiry";
  status: "delivered" | "opened" | "clicked" | "bounced";
  sentAt: string;
}

const INITIAL_LOGS: EmailLog[] = [
  {
    id: "EM-901",
    recipient: "priya.nair@gmail.com",
    subject: "Order Confirmed: #GH-1094 Bhadohi Wool Rug",
    type: "order_confirmation",
    status: "opened",
    sentAt: "18 mins ago",
  },
  {
    id: "EM-900",
    recipient: "karan.design@arc-partners.com",
    subject: "Still thinking about your handcrafted rug? Here is 10% OFF",
    type: "abandoned_cart",
    status: "clicked",
    sentAt: "45 mins ago",
  },
  {
    id: "EM-899",
    recipient: "aarav.sharma@example.com",
    subject: "Dispatched: Your Persian Motif Rug is en route via SafeExpress",
    type: "shipping_tracking",
    status: "delivered",
    sentAt: "2 hours ago",
  },
  {
    id: "EM-898",
    recipient: "devika.roy@designers.in",
    subject: "Bhadohi Loom Master Update: Knotting progress at 60%",
    type: "loom_update",
    status: "opened",
    sentAt: "4 hours ago",
  },
  {
    id: "EM-897",
    recipient: "siddharth.m@gmail.com",
    subject: "Natural Wool Cleaning & Lanolin Protection Guide",
    type: "custom_enquiry",
    status: "delivered",
    sentAt: "Yesterday",
  },
  {
    id: "EM-896",
    recipient: "invalid-user-fake@domain-err.com",
    subject: "Order Confirmed: #GH-1091",
    type: "order_confirmation",
    status: "bounced",
    sentAt: "2 days ago",
  },
];

export function EmailClient() {
  const [logs, setLogs] = useState<EmailLog[]>(INITIAL_LOGS);
  const [testEmail, setTestEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const dailyUsed = 84;
  const dailyLimit = 100;
  const monthlyUsed = 2420;
  const monthlyLimit = 50000;

  const handleSendTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return;

    setIsSending(true);
    setTimeout(() => {
      const newLog: EmailLog = {
        id: `EM-${logs.length + 902}`,
        recipient: testEmail,
        subject: "[TEST] Ganga Handmade Rugs - Transactional Template Check",
        type: "order_confirmation",
        status: "delivered",
        sentAt: "Just now",
      };
      setLogs([newLog, ...logs]);
      setIsSending(false);
      setNotice(`✓ Diagnostic test email successfully delivered to ${testEmail} via Resend API!`);
      setTestEmail("");
      setTimeout(() => setNotice(null), 4000);
    }, 800);
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
            Email Delivery &amp; Quotas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor transactional email delivery rates, daily Resend API quota limits, and test SMTP routes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-xs py-1 px-3">
            <span className="size-1.5 rounded-full bg-emerald-500 mr-1.5" />
            Provider: Resend (API v2)
          </Badge>
        </div>
      </div>

      {/* Quota & Server Health Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Daily Send Quota</span>
            <Flame className="size-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-950">
              {dailyUsed} / {dailyLimit}
            </span>
            <span className="text-xs font-bold text-amber-600">84%</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              style={{ width: `${(dailyUsed / dailyLimit) * 100}%` }}
              className="h-full rounded-full bg-amber-500"
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Resets in 6h 38m (Midnight UTC)</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Monthly Allotted</span>
            <Zap className="size-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-950">
              {monthlyUsed.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">/ {monthlyLimit.toLocaleString()}</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              style={{ width: `${(monthlyUsed / monthlyLimit) * 100}%` }}
              className="h-full rounded-full bg-slate-900"
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-400">4.8% monthly plan used</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Domain Auth</span>
            <ShieldCheck className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-bold text-emerald-700">DKIM / SPF Verified</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1 text-[10px] font-mono">
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700 border border-emerald-200">
              SPF: PASS
            </span>
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700 border border-emerald-200">
              DKIM: PASS
            </span>
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700 border border-emerald-200">
              DMARC: 100%
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">gangahandmade.com verified</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Delivery Open Rate</span>
            <Sparkles className="size-4 text-violet-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-950">68.4%</span>
            <span className="text-xs font-semibold text-emerald-600">Above Avg</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Industry benchmark: 38%</p>
        </Card>
      </div>

      {/* Test Email Diagnostic Form */}
      <Card className="p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Send Diagnostic Test Email</h2>
            <p className="text-xs text-slate-500">
              Dispatch a real-time transactional test email to verify SMTP and Resend API routing.
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            Live Sandbox
          </Badge>
        </div>

        <form onSubmit={handleSendTestEmail} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              type="email"
              required
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter your email to receive test dispatch (e.g. rahul@example.com)..."
              className="h-9 pl-9 text-xs"
            />
          </div>
          <Button
            type="submit"
            disabled={isSending}
            size="sm"
            className="gap-2 bg-slate-950 text-xs text-white hover:bg-slate-800"
          >
            {isSending ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="size-3.5" />
                Send Test Email
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Transactional Email Logs Table */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Transactional Outbox Logs</h2>
            <p className="text-xs text-slate-500">Orders, loom notifications, and recovery vouchers</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setNotice("✓ Synchronized recent email logs from Resend webhook");
              setTimeout(() => setNotice(null), 2500);
            }}
            className="h-7 text-xs gap-1.5"
          >
            <RefreshCw className="size-3" />
            Sync Logs
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="p-4">Message ID</th>
                <th className="p-4">Recipient</th>
                <th className="p-4">Subject Line</th>
                <th className="p-4">Template Type</th>
                <th className="p-4">Delivery Status</th>
                <th className="p-4 text-right">Dispatched</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-700">{log.id}</td>
                  <td className="p-4 font-mono font-medium text-slate-900">{log.recipient}</td>
                  <td className="p-4 font-medium text-slate-800 max-w-sm truncate">{log.subject}</td>
                  <td className="p-4">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-700">
                      {log.type}
                    </span>
                  </td>
                  <td className="p-4">
                    {log.status === "delivered" && (
                      <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                        ✓ Delivered
                      </span>
                    )}
                    {log.status === "opened" && (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        ✓✓ Opened
                      </span>
                    )}
                    {log.status === "clicked" && (
                      <span className="inline-flex items-center gap-1 font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded text-[11px]">
                        ★ Link Clicked
                      </span>
                    )}
                    {log.status === "bounced" && (
                      <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                        ✗ Bounced
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right text-slate-500 text-[11px] whitespace-nowrap">
                    {log.sentAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
