import { useEffect, useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import { getSocket, connectSocket } from "../socket";
import { useAuthStore } from "../../state/auth-store";
import type { TeamChatMessage } from "../services/teamService";

export type TeamChatMessageSocket = {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  message: string;
  attachments?: string[];
  createdAt: string;
};

export function useTeamChat(teamId: string) {
  const { accessToken } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<TeamChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken || !teamId) return;

    // Connect socket with token
    const s = connectSocket(accessToken);
    socketRef.current = s;
    setSocket(s);

    // Handle connection
    const onConnect = () => {
      setIsConnected(true);
      // Join team room
      s.emit("team:join", { teamId });
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onConnectError = (error: Error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    };

    // Listen for new messages
    const onTeamMessage = (data: TeamChatMessageSocket) => {
      // Convert socket message format to TeamChatMessage format
      const userNameParts = data.userName.split(" ");
      const newMessage: TeamChatMessage = {
        id: data.id,
        message: data.message,
        attachments: data.attachments || [],
        createdAt: data.createdAt,
        sender: {
          id: data.userId,
          firstName: userNameParts[0] || "",
          lastName: userNameParts.slice(1).join(" ") || "",
          profilePhoto: undefined, // Socket message doesn't include profile photo, will be enriched by parent
        },
      };

      setMessages((prev) => {
        // Check if message already exists (avoid duplicates)
        // This can happen if we sent via API and also received via socket
        const exists = prev.some((msg) => msg.id === data.id);
        if (exists) return prev;
        
        // Add new message, sorted by createdAt
        const updated = [...prev, newMessage];
        return updated.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    };

    // Listen for errors
    const onError = (data: { message: string }) => {
      console.error("Socket error:", data.message);
    };

    // Set up event listeners
    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("connect_error", onConnectError);
    s.on("team:message", onTeamMessage);
    s.on("error", onError);

    // Connect if not already connected
    if (!s.connected) {
      s.connect();
    } else {
      // Already connected, join room immediately
      s.emit("team:join", { teamId });
      setIsConnected(true);
    }

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.emit("team:leave", { teamId });
        socketRef.current.off("connect", onConnect);
        socketRef.current.off("disconnect", onDisconnect);
        socketRef.current.off("connect_error", onConnectError);
        socketRef.current.off("team:message", onTeamMessage);
        socketRef.current.off("error", onError);
      }
    };
  }, [accessToken, teamId]);

  const sendMessage = (message: string, attachments?: string[]) => {
    if (!socket || !isConnected || !message.trim()) return;

    socket.emit("team:message:send", {
      teamId,
      message: message.trim(),
      attachments: attachments || [],
    });
  };

  const addMessage = (message: TeamChatMessage) => {
    setMessages((prev) => {
      // Check if message already exists (avoid duplicates)
      const exists = prev.some((msg) => msg.id === message.id);
      if (exists) return prev;
      return [...prev, message];
    });
  };

  const setInitialMessages = useCallback((initialMessages: TeamChatMessage[]) => {
    setMessages(initialMessages);
  }, []);

  return {
    socket,
    messages,
    isConnected,
    sendMessage,
    addMessage,
    setInitialMessages,
  };
}

