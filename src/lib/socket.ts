import { io, Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { tokenStorage } from "./api-client";

let socket: Socket | null = null;

export type SocketStatus = "disconnected" | "connecting" | "connected";

/**
 * Socket.io connects to the HTTP(S) origin of the API by default.
 * Derive from NEXT_PUBLIC_API_BASE_URL when NEXT_PUBLIC_WS_URL is unset so port matches the backend.
 */
function resolveSocketUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const api = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5005/api";
  try {
    const u = new URL(api);
    return u.origin;
  } catch {
    return "http://localhost:5000";
  }
}

export function getSocket(token?: string) {
  if (!socket) {
    const wsUrl = resolveSocketUrl();
    socket = io(wsUrl, {
      withCredentials: true,
      autoConnect: false,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
      auth: token ? { token } : {},
    });

    socket.on("connect", () => {
      /* connected */
    });
    socket.on("connect_error", () => {
      /* handled via useSocketConnection */
    });
  } else if (token && socket.auth && typeof socket.auth === "object" && !Array.isArray(socket.auth)) {
    (socket.auth as { token?: string }).token = token;
  }
  return socket;
}

export function connectSocket(token: string) {
  const s = getSocket(token);
  if (s.auth && typeof s.auth === "object" && !Array.isArray(s.auth)) {
    (s.auth as { token?: string }).token = token;
  }
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
    const token = tokenStorage.getAccessToken();
    if (token) {
      connectSocket(token);
    }

    const s = getSocket(token ?? undefined);

    const sync = () => {
      setStatus(s.connected ? "connected" : "disconnected");
    };

    const onConnect = () => setStatus("connected");
    const onDisconnect = () => setStatus("disconnected");
    const onConnectError = () => setStatus("disconnected");
    const onReconnect = () => setStatus("connected");

    sync();
    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("connect_error", onConnectError);
    s.io.on("reconnect", onReconnect);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("connect_error", onConnectError);
      s.io.off("reconnect", onReconnect);
    };
  }, []);

  return { socket: getSocket(), status };
}

export function useSocketEvent<T = unknown>(event: string, handler: (payload: T) => void) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const s = getSocket();
    const wrappedHandler = (payload: T) => {
      try {
        handlerRef.current(payload);
      } catch {
        /* ignore */
      }
    };

    s.on(event, wrappedHandler);
    return () => {
      s.off(event, wrappedHandler);
    };
  }, [event]);
}
