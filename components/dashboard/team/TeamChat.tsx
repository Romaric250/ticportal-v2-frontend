import { MessageCircle, Plus, Send, FileText } from "lucide-react";

export function TeamChat() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-[#111827]" />
          <h2 className="text-sm font-semibold text-slate-900">Team Chat</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
          +2
        </span>
      </div>

      <div className="mb-4 space-y-4">
        {/* Date separator */}
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-500">Today, 10:25 AM</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Messages */}
        <ChatMessage
          name="Sarah"
          time="10:25 AM"
          message="Hey team! Just uploaded the draft for the pitch deck. Can you guys review it?"
          isOwn={false}
        />
        <ChatMessage
          name="You"
          time="10:25 AM"
          message="On it! I'll add the technical architecture diagram to slide 5."
          isOwn={true}
        />
        <ChatMessage
          name="David"
          time="10:28 AM"
          message="The MVP login flow is acting up again 😬 fixing it now."
          isOwn={false}
          hasAttachment
          attachmentName="error_log.txt"
        />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
        <button className="cursor-pointer rounded-full p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900">
          <Plus size={16} />
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
        <button className="cursor-pointer rounded-full bg-[#111827] p-1.5 text-white hover:bg-[#1f2937]">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

type ChatMessageProps = {
  name: string;
  time: string;
  message: string;
  isOwn: boolean;
  hasAttachment?: boolean;
  attachmentName?: string;
};

function ChatMessage({
  name,
  time,
  message,
  isOwn,
  hasAttachment,
  attachmentName,
}: ChatMessageProps) {
  return (
    <div className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-slate-200" />
      <div className={`flex-1 ${isOwn ? "text-right" : ""}`}>
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-900">{name}</span>
          <span className="text-[10px] text-slate-500">{time}</span>
        </div>
        <div
          className={`inline-block rounded-lg px-3 py-2 text-xs ${
            isOwn
              ? "bg-[#111827] text-white"
              : "bg-slate-100 text-slate-900"
          }`}
        >
          <p>{message}</p>
          {hasAttachment && (
            <div className="mt-2 flex items-center gap-2 rounded border border-slate-200 bg-white px-2 py-1.5">
              <FileText size={14} className="text-red-500" />
              <span className="text-[10px] text-slate-700">{attachmentName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

