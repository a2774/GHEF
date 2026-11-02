"use client";

import { useRef, useState, useTransition } from "react";
import { Eye, EyeOff, Plus, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { createTeamMember } from "@/server/actions/admin-modules";

const inputClass =
  "mt-1.5 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#bef264] focus:outline-none focus:ring-1 focus:ring-[#bef264]";

export function TeamForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [role, setRole] = useState("staff");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please provide the colleague's full name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      toast.error("Please provide a valid work email address.");
      return;
    }

    if (password.length < 12) {
      toast.error(
        `Password must contain at least 12 characters. You currently have ${password.length} characters.`
      );
      return;
    }

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("email", email.trim().toLowerCase());
    formData.set("password", password);
    formData.set("role", role);

    setServerError(null);
    startTransition(async () => {
      const err = await createTeamMember(null, formData);
      if (err) {
        setServerError(err);
        toast.error(err);
      } else {
        toast.success(`Team member ${name.trim()} added successfully!`);
        setName("");
        setEmail("");
        setPassword("");
        setRole("staff");
        formRef.current?.reset();
      }
    });
  };

  const isPasswordValid = password.length >= 12;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <UserPlus className="size-4 text-slate-700" />
        <h2 className="text-sm font-bold text-slate-900">
          Invite Administrator or Staff Member
        </h2>
      </div>

      <form
        ref={formRef}
        onSubmit={handleFormSubmit}
        noValidate
        className="grid gap-4 sm:grid-cols-2"
      >
        <label className="block text-xs font-semibold text-slate-700">
          Full Name
          <Input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Ramesh Kumar"
            className={inputClass}
          />
        </label>

        <label className="block text-xs font-semibold text-slate-700">
          Work Email Address
          <Input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="colleague@gangahandmade.com"
            className={inputClass}
          />
        </label>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">
              Password (12+ characters)
            </label>
            {password.length > 0 && (
              <span
                className={`text-[10px] font-mono font-semibold transition-colors ${
                  isPasswordValid ? "text-emerald-600" : "text-rose-500"
                }`}
              >
                {isPasswordValid
                  ? "✓ 12+ Characters met"
                  : `${password.length} / 12 characters`}
              </span>
            )}
          </div>

          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              autoComplete="new-password"
              className={`${inputClass} pr-10 font-mono`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="size-4 text-slate-700" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Administrative Role
          </label>
          <input type="hidden" name="role" value={role} />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="mt-1.5 h-9 rounded-xl border-slate-200 text-xs font-semibold text-slate-800">
              <SelectValue placeholder="Select administrative role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="staff">Staff (Orders, Catalog, Inquiries)</SelectItem>
              <SelectItem value="admin">Admin (Staff + Financials, Customers, Coupons)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {serverError && (
          <p
            role="alert"
            className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium sm:col-span-2 animate-in fade-in"
          >
            {serverError}
          </p>
        )}

        <div className="sm:col-span-2 pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="h-9 rounded-full bg-[#bef264] px-6 text-xs font-bold text-slate-950 shadow-xs hover:bg-[#a3e635] transition-all cursor-pointer"
          >
            <Plus className="size-3.5 mr-1 text-slate-950" />
            <span>{isPending ? "Adding Member..." : "Add Team Member"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
