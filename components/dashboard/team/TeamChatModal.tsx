"use client";

import { X, MessageCircle, Send, FileText, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { teamService, type Team, type TeamChatMessage } from "../../../src/lib/services/teamService";
import { useAuthStore } from "../../../src/state/auth-store";
import { toast } from "sonner";

type Props = {
  team: Team;
  onClose: () => void;
};

export function TeamChatModal({ team, onClose }: Props) {
  const { user } = useAuthStore();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<TeamChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await teamService.getTeamChats(team.id, 1, 50);
        setMessages(response.data || []);
      } catch (error: any) {
        console.error("Error loading messages:", error);
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [team.id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;

    try {
      setSending(true);
      const newMessage = await teamService.sendChatMessage(team.id, {
        message: message.trim(),
      });
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();
    
    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    const date = formatDate(msg.createdAt);
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {} as Record<string, TeamChatMessage[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-[#111827]" />
            <h2 className="text-lg font-semibold text-slate-900">Team Chat</h2>
            {team.members && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {team.members.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center gap-2 my-4">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs text-slate-500">{date}</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* Messages for this date */}
                {dateMessages.map((msg) => {
                  const senderName = msg.sender
                    ? `${msg.sender.firstName} ${msg.sender.lastName}`
                    : "Unknown";
                  const isOwn = msg.sender.id === user?.id;

                  return (
                    <ChatMessage
                      key={msg.id}
                      name={isOwn ? "You" : senderName}
                      time={formatTime(msg.createdAt)}
                      message={msg.message}
                      isOwn={isOwn}
                      profilePhoto={msg.sender.profilePhoto}
                      hasAttachment={msg.attachments && msg.attachments.length > 0}
                      attachments={msg.attachments}
                    />
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              onKeyDown={(e) => {
                if (e.key === "Enter" && message.trim() && !sending) {
                  handleSendMessage();
                }
              }}
              disabled={sending}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || sending}
              className="cursor-pointer rounded-full bg-[#111827] p-1.5 text-white hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type ChatMessageProps = {
  name: string;
  time: string;
  message: string;
  isOwn: boolean;
  profilePhoto?: string;
  hasAttachment?: boolean;
  attachments?: string[];
};

function ChatMessage({
  name,
  time,
  message,
  isOwn,
  profilePhoto,
  hasAttachment,
  attachments,
}: ChatMessageProps) {
  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
      {profilePhoto ? (
        <img
          src={profilePhoto}
          alt={name}
          className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-semibold">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className={`flex-1 ${isOwn ? "text-right" : ""}`}>
        <div className={`mb-1 flex items-center gap-2 ${isOwn ? "justify-end" : ""}`}>
          <span className="text-xs font-semibold text-slate-900">{name}</span>
          <span className="text-[10px] text-slate-500">{time}</span>
        </div>
        <div
          className={`inline-block rounded-lg px-3 py-2 text-sm ${
            isOwn
              ? "bg-[#111827] text-white"
              : "bg-slate-100 text-slate-900"
          }`}
        >
          <p>{message}</p>
          {hasAttachment && attachments && attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {attachments.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded border border-slate-200 bg-white px-2 py-1.5 hover:bg-slate-50"
                >
                  <FileText size={14} className="text-red-500" />
                  <span className="text-xs text-slate-700 truncate max-w-[200px]">
                    {url.split("/").pop() || `Attachment ${idx + 1}`}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
