"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "../../src/state/auth-store";

const WHATSAPP_NUMBER = "237650503544";
const PULSE_INTERVAL_MS = 15000;
const DEFAULT_RIGHT = 24;
const DEFAULT_BOTTOM = 20;
/** Max horizontal extent (px) — “Need help?” + button + gap */
const WIDGET_MAX_WIDTH = 200;
/** Approx. height of the floating control (px) */
const WIDGET_MAX_HEIGHT = 72;
const STORAGE_KEY = "tic_whatsapp_widget_pos";

type Pos = { right: number; bottom: number };

function clampRight(right: number): number {
  if (typeof window === "undefined") return right;
  const max = Math.max(16, window.innerWidth - WIDGET_MAX_WIDTH - 16);
  return Math.max(16, Math.min(max, right));
}

function clampBottom(bottom: number): number {
  if (typeof window === "undefined") return bottom;
  const max = Math.max(16, window.innerHeight - WIDGET_MAX_HEIGHT - 16);
  return Math.max(16, Math.min(max, bottom));
}

function loadSavedPosition(): Pos {
  if (typeof window === "undefined") {
    return { right: DEFAULT_RIGHT, bottom: DEFAULT_BOTTOM };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Pos>;
      if (typeof p.right === "number" && typeof p.bottom === "number") {
        return { right: clampRight(p.right), bottom: clampBottom(p.bottom) };
      }
    }
  } catch {
    /* ignore */
  }
  return { right: DEFAULT_RIGHT, bottom: DEFAULT_BOTTOM };
}

function buildWhatsAppMessage(user: { name?: string; email?: string } | null): string {
  const lines: string[] = ["Hello! I need help with the TIC Portal."];
  if (user?.name) lines.push(`Name: ${user.name.trim()}`);
  if (user?.email) lines.push(`Email: ${user.email}`);
  lines.push("", "My question: ");
  return lines.join("\n");
}

export function WhatsAppSupportWidget() {
  const { user } = useAuthStore();
  const [showPulse, setShowPulse] = useState(false);
  const [{ right, bottom }, setPos] = useState<Pos>({
    right: DEFAULT_RIGHT,
    bottom: DEFAULT_BOTTOM,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartRight = useRef(DEFAULT_RIGHT);
  const dragStartBottom = useRef(DEFAULT_BOTTOM);
  const hasMoved = useRef(false);

  useEffect(() => {
    setPos(loadSavedPosition());
  }, []);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setShowPulse(true);
      hideTimer = setTimeout(() => setShowPulse(false), 4000);
    }, PULSE_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(hideTimer!);
    };
  }, []);

  const persistPos = useCallback((next: Pos) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onResize = () => {
      setPos((p) => ({
        right: clampRight(p.right),
        bottom: clampBottom(p.bottom),
      }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const startDrag = useCallback(
    (clientX: number, clientY: number) => {
      setIsDragging(true);
      hasMoved.current = false;
      dragStartX.current = clientX;
      dragStartY.current = clientY;
      dragStartRight.current = right;
      dragStartBottom.current = bottom;
    },
    [right, bottom],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      startDrag(e.clientX, e.clientY);
    },
    [startDrag],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    },
    [startDrag],
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (clientX: number, clientY: number) => {
      const deltaX = dragStartX.current - clientX;
      const deltaY = clientY - dragStartY.current;
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) hasMoved.current = true;
      setPos({
        right: clampRight(dragStartRight.current + deltaX),
        bottom: clampBottom(dragStartBottom.current - deltaY),
      });
    };

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onEnd = () => {
      setIsDragging(false);
      setPos((p) => {
        persistPos(p);
        return p;
      });
    };

    document.addEventListener("mousemove", onMouseMove, { passive: false });
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onEnd);
    document.addEventListener("touchcancel", onEnd);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onEnd);
    };
  }, [isDragging, persistPos]);

  const handleClick = () => {
    if (hasMoved.current) return;
    const message = buildWhatsAppMessage(user);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      style={{ right: `${right}px`, bottom: `${bottom}px` }}
      title="Drag to move · Click to chat on WhatsApp"
      className={`fixed z-40 flex select-none items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 ${
        isDragging ? "cursor-grabbing touch-none" : "cursor-grab"
      }`}
      aria-label="Contact support via WhatsApp. Drag to reposition."
    >
      {showPulse && (
        <div className="pointer-events-none flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 shadow-md">
          <span className="text-sm font-semibold text-black">Need help?</span>
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-black" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
        </div>
      )}

      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-shadow hover:shadow-xl sm:h-14 sm:w-14 ${
          showPulse ? "animate-pulse ring-2 ring-white ring-offset-2 ring-offset-[#f9fafb]" : ""
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.865 9.865 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </div>
    </div>
  );
}
