"use client";

import { GraduationCap, Mail, Calendar, MessageCircle } from "lucide-react";
import type { Team } from "../../../src/lib/services/teamService";

type Props = {
  team: Team;
};

export function AssignedMentor({ team }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <GraduationCap size={18} className="text-[#111827]" />
        <h2 className="text-sm font-semibold text-slate-900">Assigned Mentor</h2>
      </div>

      <div className="space-y-4">
        {/* Mentor Profile */}
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-full bg-slate-200" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">Dr. Sarah Johnson</p>
            <p className="text-xs text-slate-500">Senior Product Manager, TechCorp</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-[#111827]">
                Business Strategy
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-[#111827]">
                Product Design
              </span>
            </div>
          </div>
        </div>

        {/* Contact Actions */}
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <button className="cursor-pointer flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <Mail size={14} />
            <span>Send Email</span>
          </button>
          <button className="cursor-pointer flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <MessageCircle size={14} />
            <span>Start Chat</span>
          </button>
          <button className="cursor-pointer flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <Calendar size={14} />
            <span>Schedule Session</span>
          </button>
        </div>

        {/* Next Session Info */}
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-700">Next Session</p>
          <p className="mt-1 text-xs text-slate-600">Friday, Oct 28 at 2:00 PM</p>
          <p className="mt-0.5 text-[10px] text-slate-500">Topic: Business Model Canvas Review</p>
        </div>
      </div>
    </div>
  );
}

