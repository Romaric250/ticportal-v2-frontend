"use client";

import { X, MessageCircle, Send, FileText, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { teamService, type Team, type TeamChatMessage } from "../../../src/lib/services/teamService";
import { useAuthStore } from "../../../src/state/auth-store";
import { useTeamChat } from "../../../src/lib/hooks/useTeamChat";
import { toast } from "sonner";

type Props = {
  team: Team;
  onClose: () => void;
};

export function TeamChatModal({ team, onClose }: Props) {
  const { user } = useAuthStore();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Use real-time chat hook
  const { messages, isConnected, setInitialMessages, addMessage, socket, sendMessage: sendSocketMessage } = useTeamChat(team.id);

  // Debug: Log socket connection status
  useEffect(() => {
    console.log("Chat Modal: Socket connection status", { isConnected, hasSocket: !!socket });
    if (socket) {
      console.log("Chat Modal: Socket ID", socket.id);
      console.log("Chat Modal: Socket connected?", socket.connected);
    }
  }, [isConnected, socket]);

  // Helper to enrich socket messages with sender info from team members
  const enrichMessageWithSender = (message: TeamChatMessage): TeamChatMessage => {
    if (message.sender?.profilePhoto || (message.sender?.firstName && message.sender?.lastName)) {
      return message; // Already has full sender info
    }

    // Try to find sender in team members
    const member = team.members?.find((m) => m.userId === message.sender?.id);
    if (member?.user) {
      return {
        ...message,
        sender: {
          id: member.userId,
          firstName: member.user.firstName,
          lastName: member.user.lastName,
          profilePhoto: member.user.profilePhoto,
        },
      };
    }

    return message;
  };

  // Load initial messages from API - only once per team
  const hasLoadedRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Reset if team changed
    if (hasLoadedRef.current !== team.id) {
      hasLoadedRef.current = null;
    }
    
    // Only load messages once per team
    if (hasLoadedRef.current === team.id) return;
    
    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await teamService.getTeamChats(team.id, 1, 50);
        console.log("Loaded messages response:", response); // Debug log
        
        // Handle different response structures
        // Could be: { data: [...], pagination: {...} } or just [...]
        let messagesArray: any[] = [];
        if (Array.isArray(response)) {
          messagesArray = response;
        } else if (response?.data && Array.isArray(response.data)) {
          messagesArray = response.data;
        } else if (Array.isArray(response?.data)) {
          messagesArray = response.data;
        }
        
        console.log("Messages array:", messagesArray); // Debug log
        console.log("Messages count:", messagesArray.length); // Debug log
        
        if (messagesArray.length === 0) {
          console.log("No messages found in response");
        }
        
        // Map to TeamChatMessage format and enrich with sender info
        const loadedMessages = messagesArray.map((msg: any) => {
          // Ensure message has the correct structure
          const message: TeamChatMessage = {
            id: msg.id,
            message: msg.message || "",
            attachments: msg.attachments || [],
            createdAt: msg.createdAt,
            sender: {
              id: msg.sender?.id || msg.senderId || "",
              firstName: msg.sender?.firstName || "",
              lastName: msg.sender?.lastName || "",
              profilePhoto: msg.sender?.profilePhoto,
            },
          };
          return enrichMessageWithSender(message);
        });
        
        console.log("Loaded messages after enrichment:", loadedMessages); // Debug log
        console.log("Setting initial messages, count:", loadedMessages.length); // Debug log
        setInitialMessages(loadedMessages);
        hasLoadedRef.current = team.id;

        // Mark all messages as read when chat is opened (non-blocking)
        // Do this asynchronously so it doesn't interfere with socket connection
        teamService.markMessagesAsRead(team.id).catch((error) => {
          console.error("Error marking messages as read:", error);
          // Don't show error toast for this, it's not critical
        });
      } catch (error: any) {
        console.error("Error loading messages:", error);
        toast.error(error?.message || "Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team.id]); // Only depend on team.id, load once per team

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Debug: Log messages state
  useEffect(() => {
    console.log("Messages state updated:", messages.length, "messages");
    const grouped = messages.reduce((acc, msg) => {
      const date = formatDate(msg.createdAt);
      if (!acc[date]) acc[date] = [];
      acc[date].push(msg);
      return acc;
    }, {} as Record<string, TeamChatMessage[]>);
    console.log("Grouped messages:", Object.keys(grouped).length, "dates");
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;

    const messageText = message.trim();
    setMessage("");

    try {
      setSending(true);

      // Use socket to send message - this will save to DB and broadcast to all team members
      // The backend socket handler handles both persistence and real-time broadcasting
      if (socket && socket.connected) {
        console.log("Chat: Sending message via socket", { 
          teamId: team.id, 
          message: messageText,
          socketId: socket.id,
          isConnected: socket.connected 
        });
        
        try {
          // Send via socket - backend will save and broadcast
          await sendSocketMessage(messageText);
          console.log("Chat: Message sent successfully via socket");
          // The message will be added to state when we receive it back via socket broadcast
        } catch (socketError: any) {
          // If socket send fails, fall back to API
          console.error("Chat: Socket send failed, error details:", socketError);
          console.error("Chat: Socket state:", { 
            connected: socket?.connected, 
            disconnected: socket?.disconnected,
            id: socket?.id 
          });
          
          // Try API fallback
          try {
            const newMessage = await teamService.sendChatMessage(team.id, {
              message: messageText,
            });
            const enrichedMessage = enrichMessageWithSender(newMessage);
            addMessage(enrichedMessage);
            toast.warning(`Message sent via API. Socket error: ${socketError?.message || "Unknown error"}`);
          } catch (apiError: any) {
            console.error("Chat: API fallback also failed", apiError);
            throw apiError; // Re-throw to be caught by outer catch
          }
        }
      } else {
        // Fallback: if socket not connected, use API (but this won't broadcast)
        console.warn("Chat: Socket not connected, falling back to API", {
          hasSocket: !!socket,
          isConnected,
          socketConnected: socket?.connected,
          socketDisconnected: socket?.disconnected
        });
        const newMessage = await teamService.sendChatMessage(team.id, {
          message: messageText,
        });
        const enrichedMessage = enrichMessageWithSender(newMessage);
        addMessage(enrichedMessage);
        toast.warning("Message sent, but real-time updates may not work. Socket not connected.");
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error?.message || "Failed to send message");
      // Restore message on error
      setMessage(messageText);
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
                {team.members.length} Members
              </span>
            )}
            {/* Connection Status */}
            <div className="flex items-center gap-1.5">
              <div
                className={`h-2 w-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
                title={isConnected ? "Connected" : "Disconnected"}
              />
              <span className="text-[10px] text-slate-500">
                {isConnected ? "Live" : "Offline"}
              </span>
            </div>
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
                  // Enrich message with sender info from team members if needed
                  const enrichedMsg = enrichMessageWithSender(msg);
                  const senderName = enrichedMsg.sender
                    ? `${enrichedMsg.sender.firstName} ${enrichedMsg.sender.lastName}`
                    : "Unknown";
                  const isOwn = enrichedMsg.sender.id === user?.id;

                  return (
                    <ChatMessage
                      key={enrichedMsg.id}
                      name={isOwn ? "You" : senderName}
                      time={formatTime(enrichedMsg.createdAt)}
                      message={enrichedMsg.message}
                      isOwn={isOwn}
                      profilePhoto={enrichedMsg.sender.profilePhoto}
                      hasAttachment={enrichedMsg.attachments && enrichedMsg.attachments.length > 0}
                      attachments={enrichedMsg.attachments}
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
