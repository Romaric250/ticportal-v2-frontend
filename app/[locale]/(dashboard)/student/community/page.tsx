"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Smile,
  Plus,
  Circle,
  UserPlus,
} from "lucide-react";

export default function CommunityPage() {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="grid h-[calc(100vh-60px)] lg:grid-cols-[minmax(0,1fr)_320px] -mx-4 sm:-mx-6 lg:-mx-8 -my-4 sm:-my-6 px-4 sm:px-6 lg:px-8 gap-4 sm:gap-6">
      {/* Main Chat Area */}
      <div className="flex flex-col h-full bg-white border-r border-slate-200 overflow-hidden">
        {/* Messages Container - Scrollable */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 min-h-0 pb-4">
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
            time="9:15 AM"
            message="Good morning everyone! Welcome to today's session. Let's make it productive! 🌟"
            isOwn={false}
          />
          <ChatMessage
            author="Alex"
            role="STUDENT"
            time="9:20 AM"
            message="Morning! Excited for today's activities. Can't wait to learn more about the BMC framework."
            isOwn={false}
          />
          <ChatMessage
            author="Sarah K."
            role="STUDENT"
            time="9:25 AM"
            message="Same here! I've been working on my value proposition all week. Ready to get feedback."
            isOwn={false}
          />
          <ChatMessage
            author="Dr. Sarah"
            role="MENTOR"
            time="9:30 AM"
            message="That's great to hear! Remember, a strong value proposition clearly articulates why customers should choose your solution over alternatives."
            isOwn={false}
          />
          <ChatMessage
            author="Michael S."
            role="STUDENT"
            time="9:35 AM"
            message="Quick question: Should we focus on B2B or B2C for our hackathon project? 🤔"
            isOwn={false}
          />
          <ChatMessage
            author="Mr. David"
            role="MENTOR"
            time="9:40 AM"
            message="Great question! It depends on your problem statement. B2B often has longer sales cycles but higher value per customer. B2C can scale faster but requires more marketing effort."
            isOwn={false}
          />
          <ChatMessage
            author="Emma W."
            role="STUDENT"
            time="9:45 AM"
            message="Our team is going with B2C because we're solving a problem we personally experience. Makes it easier to validate!"
            isOwn={false}
          />
          <ChatMessage
            author="You"
            role="STUDENT"
            time="9:50 AM"
            message="That's a smart approach! We're doing the same. Building something we'd actually use ourselves."
            isOwn={true}
          />
          <ChatMessage
            author="James T."
            role="STUDENT"
            time="9:55 AM"
            message="Has anyone started working on their pitch deck yet? I'm struggling with the problem statement slide."
            isOwn={false}
          />
          <ChatMessage
            author="Ms. Chen"
            role="MENTOR"
            time="10:00 AM"
            message="Pro tip: Start with the customer's pain point, not your solution. Make the problem relatable and urgent. Then introduce your solution as the answer."
            isOwn={false}
          />
          <ChatMessage
            author="Maria G."
            role="STUDENT"
            time="10:05 AM"
            message="Thanks for the tip! That makes so much sense. I was doing it backwards."
            isOwn={false}
          />
          <ChatMessage
            author="Alex"
            role="STUDENT"
            time="10:10 AM"
            message="Can we share our pitch decks here for feedback? Or should we use a different channel?"
            isOwn={false}
          />
          <ChatMessage
            author="Dr. Sarah"
            role="MENTOR"
            time="10:15 AM"
            message="You can share here, but I'd recommend using the team chat for detailed feedback. This channel is better for general discussions and announcements."
            isOwn={false}
          />
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
          <ChatMessage
            author="Michael S."
            role="STUDENT"
            time="11:00 AM"
            message="Just finished the workshop! The guest speaker was amazing. Learned so much about user research."
            isOwn={false}
          />
          <ChatMessage
            author="Emma W."
            role="STUDENT"
            time="11:05 AM"
            message="Agreed! The case studies were really helpful. Going to apply those techniques to our project."
            isOwn={false}
          />
          <ChatMessage
            author="Mr. David"
            role="MENTOR"
            time="11:10 AM"
            message="Glad you found it useful! Remember to document your user research findings. They'll be crucial for your pitch."
            isOwn={false}
          />
          <ChatMessage
            author="James T."
            role="STUDENT"
            time="11:15 AM"
            message="Quick question about revenue streams: Can we have multiple revenue models, or should we focus on one?"
            isOwn={false}
          />
          <ChatMessage
            author="Dr. Sarah"
            role="MENTOR"
            time="11:20 AM"
            message="You can definitely have multiple! Many successful startups start with one primary revenue stream and add others as they scale. Just make sure each one makes sense for your business model."
            isOwn={false}
          />
          <ChatMessage
            author="Maria G."
            role="STUDENT"
            time="11:25 AM"
            message="Our team is thinking subscription + one-time purchases. Does that sound reasonable?"
            isOwn={false}
          />
          <ChatMessage
            author="You"
            role="STUDENT"
            time="11:30 AM"
            message="That's a hybrid model! We're doing something similar. Freemium with premium features."
            isOwn={true}
          />
          <ChatMessage
            author="Alex"
            role="STUDENT"
            time="11:35 AM"
            message="Hybrid models are great for flexibility. You can test what works best with your users."
            isOwn={false}
          />
          <ChatMessage
            author="Ms. Chen"
            role="MENTOR"
            time="11:40 AM"
            message="Exactly! The key is to validate your assumptions with real users. Don't be afraid to pivot if the data suggests a different approach."
            isOwn={false}
          />
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input - Fixed at bottom */}
        <div className="border-t border-slate-200 px-3 sm:px-4 py-2 sm:py-3 flex-shrink-0 bg-white z-20">
          <div className="mb-1.5 flex items-center gap-1.5 sm:gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1.5 sm:p-2">
            <button className="cursor-pointer rounded-lg p-1 sm:p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition flex-shrink-0">
              <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 outline-none placeholder:text-slate-400 min-w-0"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && message.trim()) {
                  e.preventDefault();
                  // Handle send
                  setMessage("");
                  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }
              }}
            />
            <button className="cursor-pointer rounded-lg p-1 sm:p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition flex-shrink-0">
              <Smile size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <button
              onClick={() => {
                if (message.trim()) {
                  // Handle send
                  setMessage("");
                  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="cursor-pointer rounded-lg bg-[#111827] p-1 sm:p-1.5 text-white hover:bg-[#1f2937] transition flex-shrink-0"
            >
              <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-1">
            Return to send, Shift + Return for new line, Markdown supported
          </p>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="h-full order-first lg:order-last">
        {/* Online Members - Sticky */}
        <div className="sticky top-0 h-auto lg:h-[calc(100vh-60px)] max-h-[400px] lg:max-h-none overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
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
