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
    if (!accessToken || !teamId) {
      console.log("Socket: Missing accessToken or teamId", { accessToken: !!accessToken, teamId });
      return;
    }

    console.log("Socket: Connecting to team chat", { teamId });

    // Connect socket with token
    const s = connectSocket(accessToken);
    socketRef.current = s;
    setSocket(s);

    // Handle connection
    const onConnect = () => {
      console.log("Socket: Connected, joining team room", { teamId });
      setIsConnected(true);
      // Join team room
      s.emit("team:join", { teamId });
    };

    const onDisconnect = (reason: string) => {
      console.log("Socket: Disconnected", { reason });
      setIsConnected(false);
    };

    const onConnectError = (error: Error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    };

    // Listen for new messages
    const onTeamMessage = (data: TeamChatMessageSocket | any) => {
      console.log("Socket: Received team message", data);
      
      // Handle both socket format and API format
      let newMessage: TeamChatMessage;
      
      if (data.sender && data.sender.id) {
        // Already in TeamChatMessage format (from API)
        newMessage = {
          id: data.id,
          message: data.message,
          attachments: data.attachments || [],
          createdAt: data.createdAt,
          sender: {
            id: data.sender.id,
            firstName: data.sender.firstName || "",
            lastName: data.sender.lastName || "",
            profilePhoto: data.sender.profilePhoto,
          },
        };
      } else {
        // Socket format: convert to TeamChatMessage format
        const userNameParts = (data.userName || "").split(" ");
        newMessage = {
          id: data.id,
          message: data.message,
          attachments: data.attachments || [],
          createdAt: data.createdAt,
          sender: {
            id: data.userId || data.senderId,
            firstName: userNameParts[0] || "",
            lastName: userNameParts.slice(1).join(" ") || "",
            profilePhoto: undefined, // Socket message doesn't include profile photo, will be enriched by parent
          },
        };
      }

      setMessages((prev) => {
        // Check if message already exists (avoid duplicates)
        // This can happen if we sent via API and also received via socket
        const exists = prev.some((msg) => msg.id === newMessage.id);
        if (exists) {
          console.log("Socket: Message already exists, skipping", newMessage.id);
          return prev;
        }
        
        console.log("Socket: Adding new message", newMessage.id);
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

    // Set up event listeners BEFORE connecting
    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("connect_error", onConnectError);
    s.on("team:message", onTeamMessage);
    s.on("error", onError);

    // Also listen for any message events (in case backend uses different event name)
    const onAnyEvent = (eventName: string, ...args: any[]) => {
      console.log("Socket: Received event", eventName, args);
      if (eventName === "team:message" || eventName.includes("message")) {
        console.log("Socket: Message-related event detected", eventName);
      }
    };
    s.onAny(onAnyEvent);

    // Connect if not already connected
    if (!s.connected) {
      console.log("Socket: Not connected, calling connect()");
      s.connect();
    } else {
      console.log("Socket: Already connected, joining room immediately");
      // Already connected, join room immediately
      s.emit("team:join", { teamId });
      setIsConnected(true);
    }

    // Also try to join room after a short delay in case connection is still establishing
    let joinTimeout: NodeJS.Timeout | null = null;
    if (!s.connected) {
      joinTimeout = setTimeout(() => {
        if (s.connected) {
          console.log("Socket: Delayed join after connection");
          s.emit("team:join", { teamId });
          setIsConnected(true);
        } else {
          console.log("Socket: Still not connected after delay");
        }
      }, 2000);
    }

    // Cleanup
    return () => {
      if (joinTimeout) {
        clearTimeout(joinTimeout);
      }
      if (socketRef.current) {
        console.log("Socket: Cleaning up, leaving team room", { teamId });
        socketRef.current.emit("team:leave", { teamId });
        socketRef.current.off("connect", onConnect);
        socketRef.current.off("disconnect", onDisconnect);
        socketRef.current.off("connect_error", onConnectError);
        socketRef.current.off("team:message", onTeamMessage);
        socketRef.current.off("error", onError);
        socketRef.current.offAny(onAnyEvent);
      }
    };
  }, [accessToken, teamId]);

  const sendMessage = (message: string, attachments?: string[]) => {
    if (!socket || !isConnected || !message.trim()) {
      console.warn("Cannot send socket message: socket not ready", { 
        hasSocket: !!socket, 
        isConnected, 
        hasMessage: !!message.trim() 
      });
      return;
    }

    try {
      socket.emit("team:message:send", {
        teamId,
        message: message.trim(),
        attachments: attachments || [],
      });
    } catch (error) {
      console.error("Error emitting socket message:", error);
    }
  };

  const addMessage = (message: TeamChatMessage) => {
    console.log("Adding message via addMessage", message.id);
    setMessages((prev) => {
      // Check if message already exists (avoid duplicates)
      const exists = prev.some((msg) => msg.id === message.id);
      if (exists) {
        console.log("Message already exists, skipping", message.id);
        return prev;
      }
      const updated = [...prev, message];
      // Sort by createdAt
      return updated.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
  };

  const setInitialMessages = useCallback((initialMessages: TeamChatMessage[]) => {
    console.log("Setting initial messages", initialMessages.length);
    // Sort messages by createdAt
    const sorted = [...initialMessages].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    setMessages(sorted);
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

