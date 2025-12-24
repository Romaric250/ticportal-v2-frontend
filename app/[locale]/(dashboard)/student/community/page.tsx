"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Smile,
  Plus,
  Circle,
  UserPlus,
  MessageSquare,
} from "lucide-react";

export default function CommunityPage() {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="grid h-[calc(100vh-120px)] gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* Main Chat Area */}
      <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <MessageSquare size={20} className="text-[#111827]" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">TIC Community</h2>
              <p className="text-xs text-slate-500">Live discussions and updates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Circle size={8} className="fill-emerald-500 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-600">42 online</span>
          </div>
        </div>

        {/* Messages Container - Scrollable */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {/* Date Separator */}
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              TODAY
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Messages */}
          <ChatMessage
            author="Ms. Chen"
            role="MENTOR"
            time="10:42 AM"
            message="Reminder: The Ideation Workshop starts in 10 mins in the Main Hall! 💡 Don't be late, we have a special guest speaker from Google."
            isOwn={false}
          />
          <ChatMessage
            author="Alex"
            role="STUDENT"
            time="10:45 AM"
            message="Has anyone found a teammate for the AI track yet? I'm looking for a designer who knows Figma. 🎨"
            isOwn={false}
          />
          <ChatMessage
            author="Sarah K."
            role="STUDENT"
            time="10:46 AM"
            message="I'm interested! Just sent you a DM."
            isOwn={false}
          />
          <ChatMessage
            author="You"
            role="STUDENT"
            time="10:50 AM"
            message="@Ms. Chen is there a recording available if we miss it? I'm still in class right now. 🎓"
            isOwn={true}
          />
          <ChatMessage
            author="Ms. Chen"
            role="MENTOR"
            time="10:52 AM"
            message="Yes, the recording will be available in the Learning Path section within 2 hours after the session ends."
            isOwn={false}
          />
          <ChatMessage
            author="David M."
            role="STUDENT"
            time="10:55 AM"
            message="Great! Thanks for the heads up. Looking forward to the workshop."
            isOwn={false}
          />
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-slate-200 p-4">
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
            <button className="cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition">
              <Plus size={18} />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message to the community..."
              className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && message.trim()) {
                  e.preventDefault();
                  // Handle send
                  setMessage("");
                  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }
              }}
            />
            <button className="cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition">
              <Smile size={18} />
            </button>
            <button
              onClick={() => {
                if (message.trim()) {
                  // Handle send
                  setMessage("");
                  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="cursor-pointer rounded-lg bg-[#111827] p-1.5 text-white hover:bg-[#1f2937] transition"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center">
            Return to send, Shift + Return for new line, Markdown supported
          </p>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6 overflow-y-auto">
        {/* Online Members */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Online Members</h3>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5">
              <Circle size={8} className="fill-emerald-500 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700">42</span>
            </div>
          </div>

          {/* Mentors */}
          <div className="mb-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              MENTORS (3)
            </p>
            <div className="space-y-2">
              <MemberItem
                name="Ms. Chen"
                status="online"
                description="Designing for AI"
              />
              <MemberItem
                name="Mr. David"
                status="online"
                description="Tech Lead"
              />
              <MemberItem
                name="Dr. Sarah"
                status="online"
                description="Product Strategy"
              />
            </div>
          </div>

          {/* Students */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              STUDENTS (39)
            </p>
            <div className="space-y-2">
              <MemberItem
                name="Alex"
                status="typing"
                description="Typing ..."
              />
              <MemberItem
                name="Sarah K."
                status="online"
                description="Online"
              />
              <MemberItem
                name="Maria G."
                status="away"
                description="Away"
              />
              <MemberItem
                name="James T."
                status="away"
                description="Away"
              />
              <MemberItem
                name="Michael S."
                status="online"
                description="Online"
              />
              <MemberItem
                name="Emma W."
                status="online"
                description="Online"
              />
            </div>
          </div>

          {/* Invite Button */}
          <button className="cursor-pointer mt-4 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-[#111827] hover:bg-slate-50 transition">
            <span className="inline-flex items-center justify-center gap-2">
              <UserPlus size={14} />
              <span>Invite Peers</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

type ChatMessageProps = {
  author: string;
  role: "MENTOR" | "STUDENT";
  time: string;
  message: string;
  isOwn: boolean;
};

function ChatMessage({
  author,
  role,
  time,
  message,
  isOwn,
}: ChatMessageProps) {
  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-slate-200 to-slate-300" />
      <div className={`flex-1 max-w-[75%] ${isOwn ? "text-right" : ""}`}>
        <div className={`mb-1.5 flex items-center gap-2 ${isOwn ? "justify-end" : ""}`}>
          <p className="text-sm font-semibold text-slate-900">{author}</p>
          <span className="rounded-full bg-[#111827] px-2 py-0.5 text-[10px] font-semibold text-white">
            {role}
          </span>
          <p className="text-xs text-slate-400">{time}</p>
        </div>
        <div
          className={`inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isOwn
              ? "bg-[#111827] text-white rounded-tr-sm"
              : "bg-slate-100 text-slate-900 rounded-tl-sm"
          }`}
        >
          {message}
        </div>
      </div>
    </div>
  );
}

type MemberItemProps = {
  name: string;
  status: "online" | "away" | "typing";
  description: string;
};

function MemberItem({ name, status, description }: MemberItemProps) {
  const statusColor =
    status === "online" || status === "typing"
      ? "fill-emerald-500 text-emerald-500"
      : "fill-slate-400 text-slate-400";

  return (
    <div className="cursor-pointer flex items-center gap-3 rounded-lg p-2.5 hover:bg-slate-50 transition">
      <div className="relative">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300" />
        <Circle
          size={10}
          className={`absolute -bottom-0.5 -right-0.5 border-2 border-white ${statusColor}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
        <p className={`text-xs truncate ${
          status === "typing" ? "text-emerald-600 font-medium" : "text-slate-500"
        }`}>
          {description}
        </p>
      </div>
    </div>
  );
}
