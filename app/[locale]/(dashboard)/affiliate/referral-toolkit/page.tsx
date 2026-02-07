"use client";

import { useState, useEffect } from "react";
import { Copy, Link2, QrCode, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { affiliateService } from "@/src/lib/services/affiliateService";

const THEME = "#111827";

export default function ReferralToolkitPage() {
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await affiliateService.getProfile();
      setLink(profile.referralLink);
    } catch (error: any) {
      console.error("Failed to load profile:", error);
      toast.error(error?.message || "Failed to load referral link");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (typeof navigator !== "undefined" && link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const createNewLink = async () => {
    setCreatingNew(true);
    try {
      const result = await affiliateService.regenerateCode();
      setLink(result.newReferralLink);
      toast.success("New referral link created. Your previous link is no longer valid.");
    } catch (error: any) {
      console.error("Failed to regenerate code:", error);
      toast.error(error?.message || "Failed to create new link");
    } finally {
      setCreatingNew(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Referral Toolkit
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Your unique referral link and QR code. Creating a new link invalidates the previous one.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Your Unique Referral Link
          </p>
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5">
            <p className="break-all text-sm font-medium leading-relaxed" style={{ color: THEME }}>
              {link || "Loading..."}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: THEME }}
            >
              <Copy size={16} />
              <span className="whitespace-nowrap">{copied ? "Copied!" : "Copy Link"}</span>
            </button>
            <button
              type="button"
              onClick={createNewLink}
              disabled={creatingNew}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100 disabled:opacity-50"
            >
              {creatingNew ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Link2 size={16} />
              )}
              <span className="whitespace-nowrap">Create new link</span>
            </button>
          </div>
          <p className="mt-3 text-xs text-amber-600/90">
            Creating a new link invalidates your previous referral link.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Download QR Code
          </p>
          <p className="mt-0.5 text-xs text-slate-500">For physical posters and flyers</p>
          <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80">
              <QrCode size={48} className="text-slate-400" />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Download size={16} />
              Download QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
