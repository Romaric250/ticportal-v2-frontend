import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";

let socket: Socket | null = null;

export type SocketStatus = "disconnected" | "connecting" | "connected";

export function getSocket(token?: string) {
  if (!socket) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:5000";
    socket = io(wsUrl, {
      withCredentials: true,
      autoConnect: false, // We'll connect manually after setting auth
      transports: ["websocket"],
      auth: token ? { token } : undefined,
    });
  } else if (token && !socket.auth?.token) {
    // Update auth if token is provided and socket exists
    socket.auth = { token };
  }
  return socket;
}

export function connectSocket(token: string) {
  const s = getSocket(token);
  if (!s.connected) {
    s.connect();
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
    s.on(event, handler);
    return () => {
      s.off(event, handler);
    };
  }, [event, handler]);
}


