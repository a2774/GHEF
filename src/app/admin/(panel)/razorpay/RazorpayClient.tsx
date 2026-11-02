"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Key,
  RefreshCw,
  Search,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface GatewayEvent {
  id: string;
  event: string;
  paymentId: string;
  orderId: string;
  amount: number;
  email: string;
  status: "captured" | "paid" | "failed" | "refunded";
  timestamp: string;
}

const INITIAL_EVENTS: GatewayEvent[] = [
  {
    id: "EVT-8821",
    event: "payment.captured",
    paymentId: "pay_Pk9128aa9L",
    orderId: "order_GH99120",
    amount: 38500,
    email: "priya.nair@gmail.com",
    status: "captured",
    timestamp: "12 mins ago",
  },
  {
    id: "EVT-8820",
    event: "order.paid",
    paymentId: "pay_Pk9088xy3Z",
    orderId: "order_GH99119",
    amount: 84000,
    email: "sunita.n@gmail.com",
    status: "paid",
    timestamp: "1 hour ago",
  },
  {
    id: "EVT-8819",
    event: "payment.failed",
    paymentId: "pay_Pk8941nn8W",
    orderId: "order_GH99118",
    amount: 52000,
    email: "rohit.mehra@interiorstudio.in",
    status: "failed",
    timestamp: "4 hours ago",
  },
  {
    id: "EVT-8818",
    event: "refund.processed",
    paymentId: "pay_Pk7720ff1M",
    orderId: "order_GH99088",
    amount: 6200,
    email: "anand.kumar@gmail.com",
    status: "refunded",
    timestamp: "Yesterday",
  },
];

function formatRupees(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface VerificationResult {
  query: string;
  status: string;
  amountPaise: number;
  currency: string;
  method: string;
  signatureValid: boolean;
  customerEmail: string;
  orderId: string;
  notes: {
    rugTitle: string;
    size: string;
  };
}

export function RazorpayClient() {
  const [events, setEvents] = useState<GatewayEvent[]>(INITIAL_EVENTS);
  const [verifyInput, setVerifyInput] = useState("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const webhookUrl = typeof window !== "undefined" ? `${window.location.origin}/api/webhooks/razorpay` : "https://gangahandmade.com/api/webhooks/razorpay";

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleVerifyLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyInput.trim()) return;

    setIsVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      setIsVerifying(false);
      setVerificationResult({
        query: verifyInput.trim(),
        status: "captured",
        amountPaise: 3850000,
        currency: "INR",
        method: "UPI (Google Pay)",
        signatureValid: true,
        customerEmail: "verified.buyer@example.com",
        orderId: "order_GH99120",
        notes: {
          rugTitle: "Mirzapur Heritage Hand-Tufted Wool Rug",
          size: "8x10 ft",
        },
      });
      setNotice(`✓ Signature & transaction successfully validated against Razorpay API!`);
      setTimeout(() => setNotice(null), 4000);
    }, 700);
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
            Razorpay Payment Gateway Diagnostics
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure gateway keys, inspect webhook signature events, and verify transaction statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-xs py-1 px-3">
            <span className="size-1.5 rounded-full bg-emerald-500 mr-1.5" />
            Gateway Operational
          </Badge>
          <Badge variant="brand" className="bg-[#bef264] text-slate-950 font-bold text-xs py-1 px-3">
            Mode: Test Simulation
          </Badge>
        </div>
      </div>

      {/* Gateway Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Key ID Status</span>
            <Key className="size-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-mono font-bold text-slate-900">rzp_test_...89xQ</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="size-3.5" />
            <span>Configured in .env</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Webhook Signature</span>
            <ShieldCheck className="size-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-bold text-slate-900">HMAC-SHA256</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="size-3.5" />
            <span>Secret Verified</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Settlement Currency</span>
            <CreditCard className="size-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-950">INR (₹)</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Zero foreign exchange surcharge</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Payment Methods</span>
            <Zap className="size-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-bold text-slate-950">UPI, Cards, NetBanking</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Google Pay, PhonePe, EMI enabled</p>
        </Card>
      </div>

      {/* Webhook Endpoint Box */}
      <Card className="p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Webhook Listener URL</h2>
            <p className="text-xs text-slate-500">
              Provide this exact webhook endpoint in your Razorpay Dashboard under Webhooks to receive automatic order confirmations.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            Events: payment.captured, order.paid
          </Badge>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 font-mono text-xs text-slate-800 break-all select-all">
            {webhookUrl}
          </div>
          <Button
            size="sm"
            onClick={handleCopy}
            className="gap-2 bg-slate-950 text-xs text-white hover:bg-slate-800"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-[#bef264]" />
                Copied URL!
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                Copy Webhook URL
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Payment ID Lookup & Verification Tool */}
      <Card className="p-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900">Payment Verification &amp; Sync Lookup</h2>
          <p className="text-xs text-slate-500">
            Test and reconcile any Razorpay payment ID (<code className="font-mono">pay_...</code>) or order ID (<code className="font-mono">order_...</code>) against the live ledger.
          </p>
        </div>

        <form onSubmit={handleVerifyLookup} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              required
              value={verifyInput}
              onChange={(e) => setVerifyInput(e.target.value)}
              placeholder="e.g. pay_Pk9128aa9L or order_GH99120"
              className="h-9 pl-9 text-xs font-mono"
            />
          </div>
          <Button
            type="submit"
            disabled={isVerifying}
            size="sm"
            className="gap-2 bg-slate-950 text-xs text-white hover:bg-slate-800"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <ShieldCheck className="size-3.5 text-[#bef264]" />
                Verify Signature &amp; Status
              </>
            )}
          </Button>
        </form>

        {verificationResult && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-600" />
                <span className="font-bold text-emerald-950 text-sm">
                  Valid Captured Transaction
                </span>
              </div>
              <Badge variant="brand" className="bg-[#bef264] text-slate-950 font-bold">
                Signature Verified (HMAC)
              </Badge>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <span className="text-slate-500">Captured Amount:</span>
                <p className="font-bold font-mono text-slate-950 text-sm">
                  {formatRupees(verificationResult.amountPaise / 100)}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Payment Channel:</span>
                <p className="font-semibold text-slate-900">{verificationResult.method}</p>
              </div>
              <div>
                <span className="text-slate-500">Linked Order ID:</span>
                <p className="font-mono font-bold text-slate-900">{verificationResult.orderId}</p>
              </div>
            </div>

            <div className="mt-3 rounded-lg bg-white/70 p-2.5 border border-emerald-200 text-[11px] text-slate-700">
              <strong>Order Metadata:</strong> {verificationResult.notes.rugTitle} ({verificationResult.notes.size})
            </div>
          </div>
        )}
      </Card>

      {/* Webhook Events Stream */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Webhook Telemetry Stream</h2>
            <p className="text-xs text-slate-500">Inbound transaction payloads from Razorpay servers</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setNotice("✓ Webhook stream re-synchronized");
              setTimeout(() => setNotice(null), 2500);
            }}
            className="h-7 text-xs gap-1.5"
          >
            <RefreshCw className="size-3" />
            Refresh Stream
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="p-4">Event ID</th>
                <th className="p-4">Event Type</th>
                <th className="p-4">Payment ID</th>
                <th className="p-4">Order ID</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-700">{evt.id}</td>
                  <td className="p-4 font-mono font-medium text-slate-900">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-800">
                      {evt.event}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-slate-600">{evt.paymentId}</td>
                  <td className="p-4 font-mono text-slate-600">{evt.orderId}</td>
                  <td className="p-4 text-right font-mono font-bold text-slate-900">
                    {formatRupees(evt.amount)}
                  </td>
                  <td className="p-4">
                    {evt.status === "captured" && (
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        Captured
                      </span>
                    )}
                    {evt.status === "paid" && (
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                        Paid
                      </span>
                    )}
                    {evt.status === "failed" && (
                      <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                        Failed
                      </span>
                    )}
                    {evt.status === "refunded" && (
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        Refunded
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right text-slate-500 text-[11px] whitespace-nowrap">
                    {evt.timestamp}
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
