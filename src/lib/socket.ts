import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";

let socket: Socket | null = null;

export type SocketStatus = "disconnected" | "connecting" | "connected";

export function getSocket(token?: string) {
  if (!socket) {
    // Derive WebSocket URL from API URL if WS_URL is not set
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    let wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    
    // if (!wsUrl && apiUrl) {
    //   // Remove /api suffix and convert http to ws, https to wss
    //   wsUrl = apiUrl.replace(/\/api$/, "").replace(/^http:/, "ws:").replace(/^https:/, "wss:");
    // }

    // console.log("apiUrl here", apiUrl);
    // console.log("wsUrl", wsUrl);
    
    wsUrl = wsUrl ?? "http://localhost:5000";
    // console.log("Socket: Creating new socket connection", { wsUrl, hasToken: !!token });
    socket = io(wsUrl, {
      withCredentials: true,
      autoConnect: false, // We'll connect manually after setting auth
      transports: ["websocket"],
      auth: token ? { token } : undefined,
    });
    
    // Log connection events for debugging
    socket.on("connect", () => {
      console.log("connected");
      //console.log("Socket: Connected successfully", { socketId: socket?.id });
    });
    
    socket.on("connect_error", (error) => {
      // console.error("Socket: Connection error", error);
      console.log("connection error");
    });
    
    socket.on("disconnect", (reason) => { 
      // console.log("Socket: Disconnected", { reason });
      console.log("disconnected");
    });
  } else if (token && socket.auth && typeof socket.auth === "object" && !Array.isArray(socket.auth)) {
    // Update auth if token is provided and socket exists
    // console.log("Socket: Updating auth token");
    socket.auth.token = token;
  }
  return socket;
}

export function connectSocket(token: string) {
  const s = getSocket(token);
  
  // Ensure auth is set before connecting
  if (token && s.auth && typeof s.auth === "object" && !Array.isArray(s.auth)) {
    s.auth.token = token;
    // console.log("Socket: Auth token set", { hasToken: !!(s.auth as { token?: string }).token });
  }
  
  if (!s.connected) {
    // console.log("Socket: Attempting to connect with token...", { hasToken: !!token });
    s.connect();
  } else {
     console.log("connected");
  }
  
  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function useSocketConnection() {
  const [status, setStatus] = useState<SocketStatus>("connecting");

  useEffect(() => {
    const s = getSocket();

    const onConnect = () => setStatus("connected");
    const onDisconnect = () => setStatus("disconnected");
    const onConnectError = () => setStatus("disconnected");

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("connect_error", onConnectError);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("connect_error", onConnectError);
    };
  }, []);

  return { socket: getSocket(), status };
}

export function useSocketEvent<T = unknown>(
  event: string,
  handler: (payload: T) => void
) {
  useEffect(() => {
    const s = getSocket();
    
    // Wrapper to ensure handler is called with proper context
    const wrappedHandler = (payload: T) => {
      try {
        handler(payload);
      } catch (error) {
        // console.error(`Socket: Error in handler for event "${event}":`, error);
      }
    };
    
    // Only listen if socket is connected or will connect
    const setupListener = () => {
      if (s.connected) {
        // console.log(`Socket: Listening to event "${event}"`);
        s.on(event, wrappedHandler);
      }
    };

    // Set up listener if already connected
    if (s.connected) {
      setupListener();
    } else {
      // Wait for connection
      s.once("connect", setupListener);
    }

    return () => {
      s.off(event, wrappedHandler);
      s.off("connect", setupListener);
    };
  }, [event, handler]);
}


