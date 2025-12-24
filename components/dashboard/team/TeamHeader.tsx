import { GraduationCap, MessageCircle } from "lucide-react";

type Props = {
  onRequestMentorship: () => void;
  onOpenChat: () => void;
};

export function TeamHeader({ onRequestMentorship, onOpenChat }: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Team Alpha</h1>
        <p className="text-sm text-slate-600">
          Building the future of education, one line of code at a time.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenChat}
          className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#111827] hover:bg-slate-50"
        >
          <MessageCircle size={16} />
          <span>Team Chat</span>
        </button>
        <button
          onClick={onRequestMentorship}
          className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f2937]"
        >
          <GraduationCap size={16} />
          <span>Request Mentorship</span>
        </button>
      </div>
    </div>
  );
}

