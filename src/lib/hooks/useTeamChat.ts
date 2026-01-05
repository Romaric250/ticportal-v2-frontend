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
  const { accessToken, user } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<TeamChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const recentMessageIdsRef = useRef<Set<string>>(new Set()); // Track recent messages to prevent duplicates

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
      console.log("Socket: Connected, joining team room", { teamId, socketId: s.id });
      setIsConnected(true);
      // Join team room
      s.emit("team:join", { teamId }, (response: any) => {
        console.log("Socket: Team join response", response);
      });
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
      console.log("Socket: Received team message event", data);
      
      // Get message ID and sender ID for duplicate/self-message check
      const messageId = data.id;
      const senderId = data.sender?.id || data.userId || data.senderId;
      
      // Skip if this is our own message (we already added it via API)
      if (user && senderId === user.id) {
        console.log("Socket: Ignoring own message (already added via API)", messageId);
        return;
      }
      
      // Check if we recently processed this message
      if (recentMessageIdsRef.current.has(messageId)) {
        console.log("Socket: Message already processed recently, skipping", messageId);
        return;
      }
      
      console.log("Socket: Message data type", typeof data, Array.isArray(data) ? "array" : "object");
      
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
        const exists = prev.some((msg) => msg.id === newMessage.id);
        if (exists) {
          console.log("Socket: Message already exists in state, skipping", newMessage.id);
          return prev;
        }
        
        // Mark as processed
        recentMessageIdsRef.current.add(newMessage.id);
        
        // Clean up old message IDs (keep last 100)
        if (recentMessageIdsRef.current.size > 100) {
          const idsArray = Array.from(recentMessageIdsRef.current);
          recentMessageIdsRef.current = new Set(idsArray.slice(-100));
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
      // Only log non-standard events to reduce noise
      if (eventName !== "connect" && eventName !== "disconnect" && eventName !== "connect_error") {
        console.log("Socket: Received event", eventName, "with args:", args);
      }
      if (eventName === "team:message" || eventName.includes("message") || eventName.includes("chat")) {
        console.log("Socket: Message-related event detected!", eventName, args);
        // Try to handle it as a message
        if (args.length > 0 && args[0]) {
          console.log("Socket: Attempting to process as message", args[0]);
          onTeamMessage(args[0]);
        }
      }
    };
    s.onAny(onAnyEvent);
    
    // Test: Listen for all events to see what the backend is actually sending
    console.log("Socket: All event listeners registered. Waiting for messages...");

    // Connect if not already connected
    if (!s.connected) {
      console.log("Socket: Not connected, calling connect()");
      s.connect();
    } else {
      console.log("Socket: Already connected, joining room immediately", { socketId: s.id });
      // Already connected, join room immediately
      s.emit("team:join", { teamId }, (response: any) => {
        console.log("Socket: Team join response (already connected)", response);
      });
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
    if (!socket || !message.trim()) {
      console.warn("Cannot send socket message: socket not ready", { 
        hasSocket: !!socket, 
        isConnected, 
        hasMessage: !!message.trim() 
      });
      return;
    }

    // Send even if not connected - socket.io will queue it
    try {
      console.log("Socket: Sending message via socket", { teamId, message: message.trim() });
      socket.emit("team:message:send", {
        teamId,
        message: message.trim(),
        attachments: attachments || [],
      }, (response: any) => {
        if (response) {
          console.log("Socket: Message send response", response);
        }
      });
    } catch (error) {
      console.error("Error emitting socket message:", error);
    }
  };

  const addMessage = (message: TeamChatMessage) => {
    console.log("Adding message via addMessage", message.id);
    
    // Mark as processed to prevent socket from adding it again
    recentMessageIdsRef.current.add(message.id);
    
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

