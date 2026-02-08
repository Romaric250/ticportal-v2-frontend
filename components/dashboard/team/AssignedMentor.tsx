"use client";

import { GraduationCap, Mail, Calendar, MessageCircle, ChevronRight } from "lucide-react";
import type { Team } from "../../../src/lib/services/teamService";

type Props = {
  team: Team;
};

export function AssignedMentor({ team }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
          <GraduationCap className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Assigned Mentor</h2>
          <p className="text-xs text-slate-500 mt-0.5">Your team's guide</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Mentor Profile */}
        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3.5">
          <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center text-white text-sm font-bold border border-slate-200 flex-shrink-0">
            SJ
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900">Dr. Sarah Johnson</p>
            <p className="text-xs text-slate-500 mt-0.5">Senior Product Manager, TechCorp</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="rounded-lg bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                Business Strategy
              </span>
              <span className="rounded-lg bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                Product Design
              </span>
            </div>
          </div>
        </div>

        {/* Contact Actions */}
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <button className="cursor-pointer flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all">
            <div className="flex items-center gap-2">
              <Mail size={14} />
              <span>Send Email</span>
            </div>
            <ChevronRight size={12} />
          </button>
          <button className="cursor-pointer flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all">
            <div className="flex items-center gap-2">
              <MessageCircle size={14} />
              <span>Start Chat</span>
            </div>
            <ChevronRight size={12} />
          </button>
          <button className="cursor-pointer flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>Schedule Session</span>
            </div>
            <ChevronRight size={12} />
          </button>
        </div>

        {/* Next Session Info */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-700 mb-1">Next Session</p>
          <p className="text-xs font-semibold text-slate-900">Friday, Oct 28 at 2:00 PM</p>
          <p className="mt-0.5 text-[11px] text-slate-500">Topic: Business Model Canvas Review</p>
        </div>
      </div>
    </div>
  );
}

