"use client";

import { X, GraduationCap } from "lucide-react";
import { useState } from "react";

type Props = {
  onClose: () => void;
};

export function RequestMentorshipModal({ onClose }: Props) {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle mentorship request submission
    console.log({ selectedTopic, message });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div className="flex items-center gap-2">
            <GraduationCap size={20} className="text-[#111827]" />
            <h2 className="text-lg font-semibold text-slate-900">
              Request Mentorship
            </h2>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              What do you need help with?
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
              required
            >
              <option value="">Select a topic</option>
              <option value="business-model">Business Model Canvas</option>
              <option value="technical">Technical Implementation</option>
              <option value="pitching">Pitching & Presentation</option>
              <option value="design">Design & UX</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Additional Details
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Describe what you'd like to discuss with your mentor..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer flex-1 rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f2937]"
            >
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

