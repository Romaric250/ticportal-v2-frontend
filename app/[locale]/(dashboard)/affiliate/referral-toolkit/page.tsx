"use client";

import { useState } from "react";
import { Copy, Link2, QrCode, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

const THEME = "#111827";

// Mock – replace with API
const mockReferralLink = "https://portal.ticsummit.org/ref/campus-rep-alex";

export default function ReferralToolkitPage() {
  const [link, setLink] = useState(mockReferralLink);
  const [copied, setCopied] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false);

  const copyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const createNewLink = async () => {
    setCreatingNew(true);
    try {
      // TODO: POST /api/affiliate/referral-link (invalidates previous)
      await new Promise((r) => setTimeout(r, 800));
      const newLink = `https://portal.ticsummit.org/ref/campus-rep-${Date.now().toString(36)}`;
      setLink(newLink);
      toast.success("New referral link created. Your previous link is no longer valid.");
    } catch {
      toast.error("Failed to create new link");
    } finally {
      setCreatingNew(false);
    }
  };

  return (
    <div className="min-w-0 space-y-3 sm:space-y-4">
      <header>
        <h1 className="text-base font-bold text-slate-900 sm:text-lg">
          Referral Toolkit
        </h1>
        <p className="mt-0.5 text-xs text-slate-600">
          Your unique referral link and QR code. Creating a new link invalidates the previous one.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
            Your Unique Referral Link
          </p>
          <p className="mt-1.5 break-all text-xs font-medium" style={{ color: THEME }}>
            {link}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white"
              style={{ backgroundColor: THEME }}
            >
              <Copy size={12} />
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <button
              type="button"
              onClick={createNewLink}
              disabled={creatingNew}
              className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
            >
              {creatingNew ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Link2 size={12} />
              )}
              Create new link
            </button>
          </div>
          <p className="mt-2 text-[10px] text-amber-600">
            Creating a new link invalidates your previous referral link.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
            Download QR Code
          </p>
          <p className="mt-0.5 text-[10px] text-slate-600">For physical posters and flyers</p>
          <div className="mt-2 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
              <QrCode size={40} className="text-slate-400" />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download size={12} />
              Download QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
