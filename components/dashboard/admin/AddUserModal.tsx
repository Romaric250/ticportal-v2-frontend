"use client";

import { useState } from "react";
import { X, Mail, KeyRound, UserPlus, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminService, type AdminUser } from "@/src/lib/services/adminService";

type Step = "email" | "otp" | "details" | "success";

export function AddUserModal({
  isOpen,
  onClose,
  onUserCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated?: () => void;
}) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"STUDENT" | "MENTOR" | "JUDGE" | "SQUAD_LEAD" | "ADMIN">("STUDENT");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState<AdminUser | null>(null);
  const [plainPassword, setPlainPassword] = useState<string | undefined>(undefined);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const reset = () => {
    setStep("email");
    setEmail("");
    setOtp("");
    setFirstName("");
    setLastName("");
    setRole("STUDENT");
    setPassword("");
    setCreatedUser(null);
    setPlainPassword(undefined);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email");
      return;
    }
    setLoading(true);
    try {
      await adminService.sendVerificationOtp(email.trim());
      toast.success("OTP sent to email");
      setStep("otp");
    } catch (error: any) {
      toast.error(error?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndCreate = async () => {
    if (!otp.trim() || !firstName.trim() || !lastName.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      const result = await adminService.verifyAndCreateUser({
        email: email.trim(),
        code: otp.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        password: password || undefined,
      });
      setCreatedUser(result.user);
      setPlainPassword(result.plainPassword);
      setStep("success");
      onUserCreated?.();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} aria-hidden />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Add New User</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {step === "email" && (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-slate-500">
              Enter the email address. An OTP will be sent for verification.
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <div className="mt-1.5 flex gap-2">
                <div className="relative flex-1">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Send OTP"}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "otp" && (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-slate-500">
              Enter the 6-digit OTP sent to <strong>{email}</strong>
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700">OTP Code</label>
              <div className="mt-1.5 flex gap-2">
                <div className="relative flex-1">
                  <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm font-mono focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Resend
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 py-2.5 px-4 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 py-2.5 px-4 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 py-2.5 px-4 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="STUDENT">Student</option>
                <option value="MENTOR">Mentor</option>
                <option value="JUDGE">Judge</option>
                <option value="SQUAD_LEAD">Squad Lead</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password (optional)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to auto-generate"
                className="mt-1.5 w-full rounded-xl border border-slate-200 py-2.5 px-4 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleVerifyAndCreate}
                disabled={loading}
                className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="mx-auto animate-spin" /> : "Create Account"}
              </button>
            </div>
          </div>
        )}

        {step === "success" && createdUser && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-emerald-700">
              <UserPlus size={20} />
              <span className="text-sm font-medium">Account created successfully</span>
            </div>
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Email</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-medium text-slate-900">{createdUser.email}</code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdUser.email, "email")}
                    className="rounded p-1.5 hover:bg-slate-200"
                  >
                    {copiedField === "email" ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              {(plainPassword ?? password) && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Password</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-medium text-slate-900">
                      {plainPassword ?? password}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(plainPassword ?? password ?? "", "password")}
                      className="rounded p-1.5 hover:bg-slate-200"
                    >
                      {copiedField === "password" ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Name</span>
                <span className="text-sm font-medium text-slate-900">
                  {createdUser.firstName} {createdUser.lastName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Role</span>
                <span className="text-sm font-medium text-slate-900">{createdUser.role}</span>
              </div>
            </div>
            <p className="text-xs text-amber-600">
              {plainPassword
                ? "Save the password now. It will not be shown again."
                : "User can log in with the password they set."}
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
