"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Bell,
  BellOff,
  Hash,
  ImagePlus,
  Loader2,
  MessageSquare,
  MoreVertical,
  Pin,
  Send,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/src/state/auth-store";
import { connectSocket, getSocket, useSocketEvent } from "@/src/lib/socket";
import {
  fetchCommunityMessages,
  fetchThread,
  postCommunityMessage,
  pinCommunityMessage,
  getVapidPublicKey,
  subscribeCommunityPush,
  unsubscribeCommunityPush,
  updateCommunityMessage,
  deleteCommunityMessage,
  bulkDeleteCommunityMessages,
  type CommunityMessage,
} from "@/src/lib/services/communityService";
import { uploadFile } from "@/src/lib/uploadthing";
import { ConnectionStatus } from "@/components/realtime/ConnectionStatus";
import { cn } from "@/src/utils/cn";

function roleLabel(role: string): string {
  const r = role.replace(/_/g, " ").toLowerCase();
  return r.replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin" || role === "super-admin";
}

type TypingPeer = { userId: string; label: string; parentId: string | null };

function typingSummary(peers: { label: string }[]): string {
  if (peers.length === 0) return "";
  if (peers.length === 1) return `${peers[0].label} is typing…`;
  if (peers.length === 2) return `${peers[0].label} and ${peers[1].label} are typing…`;
  return `${peers[0].label} and ${peers.length - 1} others are typing…`;
}

const COMMUNITY_POLICY_KEY = "tic_community_policy_ok";
/** ISO timestamp — show community rules modal at most once per 24h after “Got it”. */
const COMMUNITY_RULES_MODAL_LAST_KEY = "tic_community_rules_modal_last";

const MESSAGE_PREVIEW_MAX_CHARS = 320;

const COMMUNITY_GUIDELINES = [
  "Be respectful and professional — this channel is visible to students, mentors, judges, admins, and partners.",
  "No harassment, hate speech, spam, or sharing of private or exam content.",
  "Images only (no video); keep content appropriate for an educational summit context.",
  "Threads keep conversations organized — use Reply in thread rather than flooding the main channel when continuing a topic.",
  "Admins may pin important posts or remove content that breaks these rules.",
];

export function TicCommunity() {
  const { user, accessToken } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [pinned, setPinned] = useState<CommunityMessage[]>([]);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [threadRoot, setThreadRoot] = useState<CommunityMessage | null>(null);
  const [threadMsgs, setThreadMsgs] = useState<CommunityMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [body, setBody] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [threadBody, setThreadBody] = useState("");
  const [threadImages, setThreadImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const threadFileRef = useRef<HTMLInputElement>(null);
  const [typingPeers, setTypingPeers] = useState<TypingPeer[]>([]);
  const typingClearTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const lastTypingEmitMain = useRef(0);
  const lastTypingEmitThread = useRef(0);
  const [communityAccess, setCommunityAccess] = useState<"loading" | "gate" | "ready">("loading");
  const [pushConfigured, setPushConfigured] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [editing, setEditing] = useState<CommunityMessage | null>(null);
  const [editBody, setEditBody] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editSaving, setEditSaving] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);
  const [adminSelectMode, setAdminSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const scrollBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCommunityMessages(100);
      setPinned(data.pinned);
      setMessages(data.messages);
      return data;
    } catch {
      toast.error("Could not load community messages");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshFeed = useCallback(async () => {
    try {
      const data = await fetchCommunityMessages(100);
      setPinned(data.pinned);
      setMessages(data.messages);
      return data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setThreadBody("");
    setThreadImages([]);
  }, [threadRoot?.id]);

  useEffect(() => {
    return () => {
      typingClearTimers.current.forEach((t) => clearTimeout(t));
      typingClearTimers.current.clear();
    };
  }, []);

  const emitTyping = useCallback((parentId: string | null) => {
    const s = getSocket();
    if (!s?.connected) return;
    const now = Date.now();
    if (parentId) {
      if (now - lastTypingEmitThread.current < 1200) return;
      lastTypingEmitThread.current = now;
    } else {
      if (now - lastTypingEmitMain.current < 1200) return;
      lastTypingEmitMain.current = now;
    }
    s.emit("community:typing", { parentId });
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    connectSocket(accessToken);
    const s = getSocket();
    const onConnect = () => {
      s.emit("community:join");
    };
    if (s.connected) onConnect();
    else s.once("connect", onConnect);
    return () => {
      s.off("connect", onConnect);
      s.emit("community:leave");
    };
  }, [accessToken]);

  useSocketEvent<{ message?: CommunityMessage }>("community:message:new", (payload) => {
    const message = payload?.message;
    if (!message?.id) return;
    setMessages((prev) => {
      if (message.parentId) return prev;
      if (prev.some((m) => m?.id === message.id)) return prev;
      return [...prev, message];
    });
    if (message.parentId && threadRoot?.id === message.parentId) {
      setThreadMsgs((prev) => (prev.some((m) => m?.id === message.id) ? prev : [...prev, message]));
    }
    scrollBottom();
  });

  useSocketEvent<{ rootId: string; replyCount: number }>("community:thread:count", ({ rootId, replyCount }) => {
    if (!rootId) return;
    setMessages((prev) =>
      prev.filter(Boolean).map((m) => (m?.id === rootId ? { ...m, replyCount } : m)),
    );
    setPinned((prev) =>
      prev.filter(Boolean).map((m) => (m?.id === rootId ? { ...m, replyCount } : m)),
    );
    if (threadRoot?.id === rootId) {
      setThreadRoot((r) => (r ? { ...r, replyCount } : r));
    }
  });

  useSocketEvent<{ messageId: string; isPinned: boolean; message: CommunityMessage }>(
    "community:message:pin",
    ({ message }) => {
      void load();
    },
  );

  useSocketEvent<{ message?: CommunityMessage }>("community:message:updated", (payload) => {
    const msg = payload?.message;
    if (!msg?.id) return;
    setMessages((prev) => prev.map((m) => (m?.id === msg.id ? msg : m)));
    setPinned((prev) => prev.map((m) => (m?.id === msg.id ? msg : m)));
    setThreadMsgs((prev) => prev.map((m) => (m?.id === msg.id ? msg : m)));
    setThreadRoot((r) => (r?.id === msg.id ? msg : r));
    setEditing((e) => (e?.id === msg.id ? null : e));
  });

  useSocketEvent<{ id?: string; parentId?: string | null }>("community:message:deleted", (payload) => {
    const id = payload?.id;
    if (!id) return;
    setMessages((prev) => prev.filter((m) => m?.id !== id));
    setPinned((prev) => prev.filter((m) => m?.id !== id));
    setThreadMsgs((prev) => prev.filter((m) => m?.id !== id));
    setThreadRoot((r) => (r?.id === id ? null : r));
    setEditing((e) => (e?.id === id ? null : e));
  });

  useSocketEvent<{ ids?: string[] }>("community:messages:bulk-deleted", (payload) => {
    const ids = payload?.ids;
    if (!ids?.length) return;
    const idSet = new Set(ids);
    setMessages((prev) => prev.filter((m) => m && !idSet.has(m.id)));
    setPinned((prev) => prev.filter((m) => m && !idSet.has(m.id)));
    setThreadMsgs((prev) => prev.filter((m) => m && !idSet.has(m.id)));
    setThreadRoot((r) => (r && idSet.has(r.id) ? null : r));
    setEditing((e) => (e && idSet.has(e.id) ? null : e));
    setSelectedMessageIds((prev) => prev.filter((id) => !idSet.has(id)));
  });

  useSocketEvent<{ userId: string; label: string; parentId: string | null }>("community:typing", (payload) => {
    if (!payload?.userId || payload.userId === user?.id) return;
    const peer: TypingPeer = {
      userId: payload.userId,
      label: payload.label?.trim() || "Someone",
      parentId: payload.parentId ?? null,
    };
    setTypingPeers((prev) => {
      const rest = prev.filter((p) => p.userId !== peer.userId);
      return [...rest, peer];
    });
    const existing = typingClearTimers.current.get(peer.userId);
    if (existing) clearTimeout(existing);
    const t = setTimeout(() => {
      typingClearTimers.current.delete(peer.userId);
      setTypingPeers((prev) => prev.filter((p) => p.userId !== peer.userId));
    }, 4000);
    typingClearTimers.current.set(peer.userId, t);
  });

  const openThread = async (root: CommunityMessage) => {
    setThreadRoot(root);
    setThreadLoading(true);
    try {
      const tm = await fetchThread(root.id);
      setThreadMsgs(tm);
    } catch {
      toast.error("Could not load thread");
      setThreadMsgs([]);
    } finally {
      setThreadLoading(false);
    }
  };

  const send = async (parentId: string | null) => {
    const inThread = !!parentId;
    const text = (inThread ? threadBody : body).trim();
    const imgs = inThread ? threadImages : images;
    if (!text && imgs.length === 0) {
      toast.error("Add a message or image");
      return;
    }
    setSending(true);
    try {
      const payload = {
        body: text,
        imageUrls: imgs.length ? imgs : undefined,
        parentId: parentId ?? undefined,
      };
      const s = getSocket();
      if (s?.connected) {
        s.emit("community:message:send", payload);
        if (!inThread) {
          setBody("");
          setImages([]);
        } else {
          setThreadBody("");
          setThreadImages([]);
        }
      } else {
        const msg = await postCommunityMessage({
          body: text,
          imageUrls: imgs.length ? imgs : undefined,
          parentId,
        });
        if (msg?.id) {
          if (!parentId) {
            setMessages((prev) => [...prev, msg]);
          } else if (threadRoot?.id === parentId) {
            setThreadMsgs((prev) => [...prev, msg]);
          }
        }
        if (!inThread) {
          setBody("");
          setImages([]);
        } else {
          setThreadBody("");
          setThreadImages([]);
        }
      }
      scrollBottom();
    } catch {
      toast.error("Failed to send");
    } finally {
      setSending(false);
    }
  };

  const onPin = async (m: CommunityMessage) => {
    try {
      await pinCommunityMessage(m.id, !m.isPinned);
      toast.success(m.isPinned ? "Unpinned" : "Pinned");
      void load();
    } catch {
      toast.error("Could not update pin");
    }
  };

  const toggleMessageSelected = useCallback((id: string) => {
    setSelectedMessageIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const selectAllVisibleMessages = useCallback(() => {
    setSelectedMessageIds(messages.map((m) => m.id));
  }, [messages]);

  const handleBulkDelete = async () => {
    if (selectedMessageIds.length === 0) return;
    if (!confirm(`Delete ${selectedMessageIds.length} message(s)? This cannot be undone.`)) return;
    setBulkDeleting(true);
    try {
      await bulkDeleteCommunityMessages(selectedMessageIds);
      toast.success("Messages deleted");
      const ids = [...selectedMessageIds];
      const idSet = new Set(ids);
      if (threadRoot && idSet.has(threadRoot.id)) setThreadRoot(null);
      setThreadMsgs((prev) => prev.filter((m) => !idSet.has(m.id)));
      setSelectedMessageIds([]);
      setAdminSelectMode(false);
      await refreshFeed();
    } catch {
      toast.error("Could not delete messages");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDeleteMessage = async (m: CommunityMessage) => {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    try {
      await deleteCommunityMessage(m.id);
      toast.success("Message deleted");
      const data = await refreshFeed();
      if (threadRoot?.id === m.id) {
        setThreadRoot(null);
      } else if (threadRoot && m.parentId === threadRoot.id) {
        const tm = await fetchThread(threadRoot.id);
        setThreadMsgs(tm);
        if (data) {
          const root = [...data.pinned, ...data.messages].find((x) => x.id === threadRoot.id);
          if (root) setThreadRoot(root);
        }
      }
    } catch {
      toast.error("Could not delete message");
    }
  };

  const startEdit = (m: CommunityMessage) => {
    setEditing(m);
    setEditBody(m.body.replace(/\u200b/g, ""));
    setEditImages([...(m.imageUrls ?? [])]);
  };

  const saveEdit = async () => {
    if (!editing) return;
    const text = editBody.trim();
    if (!text && editImages.length === 0) {
      toast.error("Message cannot be empty");
      return;
    }
    setEditSaving(true);
    try {
      const updated = await updateCommunityMessage(editing.id, {
        body: text,
        imageUrls: editImages.length ? editImages : undefined,
      });
      setMessages((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setPinned((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setThreadMsgs((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setThreadRoot((r) => (r?.id === updated.id ? updated : r));
      setEditing(null);
      toast.success("Message updated");
    } catch {
      toast.error("Could not update message");
    } finally {
      setEditSaving(false);
    }
  };

  const onPickEditImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files).slice(0, 8)) {
        if (!f.type.startsWith("image/")) continue;
        if (f.size > 12 * 1024 * 1024) {
          toast.error(`${f.name} is too large (max 12 MB)`);
          continue;
        }
        urls.push(await uploadFile(f));
      }
      setEditImages((prev) => [...prev, ...urls].slice(0, 8));
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (editFileRef.current) editFileRef.current.value = "";
    }
  };

  const onPickImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files).slice(0, 8)) {
        if (!f.type.startsWith("image/")) continue;
        if (f.size > 12 * 1024 * 1024) {
          toast.error(`${f.name} is too large (max 12 MB)`);
          continue;
        }
        urls.push(await uploadFile(f));
      }
      setImages((prev) => [...prev, ...urls].slice(0, 8));
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onPickThreadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files).slice(0, 8)) {
        if (!f.type.startsWith("image/")) continue;
        if (f.size > 12 * 1024 * 1024) {
          toast.error(`${f.name} is too large (max 12 MB)`);
          continue;
        }
        urls.push(await uploadFile(f));
      }
      setThreadImages((prev) => [...prev, ...urls].slice(0, 8));
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (threadFileRef.current) threadFileRef.current.value = "";
    }
  };

  const subscribePushNotifications = useCallback(async (): Promise<boolean> => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Notifications are not supported in this browser");
      return false;
    }
    setPushBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        toast.error("Notification permission denied");
        return false;
      }
      await navigator.serviceWorker.register("/sw.js");
      const reg = await navigator.serviceWorker.ready;
      const { publicKey, configured } = await getVapidPublicKey();
      if (!configured || !publicKey) {
        toast.error("Push is not configured on the server (VAPID keys)");
        return false;
      }
      const key = urlBase64ToUint8Array(publicKey);
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      });
      const json = sub.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error("Invalid subscription object");
      }
      await subscribeCommunityPush({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      });
      setPushEnabled(true);
      toast.success("You’ll get browser notifications for new messages");
      return true;
    } catch (e: unknown) {
      console.error(e);
      toast.error("Could not enable notifications");
      return false;
    } finally {
      setPushBusy(false);
    }
  }, []);

  const togglePush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Notifications are not supported in this browser");
      return;
    }
    if (pushEnabled) {
      setPushBusy(true);
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        if (sub) {
          await unsubscribeCommunityPush(sub.endpoint);
          await sub.unsubscribe();
        }
        setPushEnabled(false);
        toast.message("Browser notifications disabled");
      } finally {
        setPushBusy(false);
      }
      return;
    }
    await subscribePushNotifications();
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    (async () => {
      try {
        let sub: PushSubscription | null = null;
        if ("serviceWorker" in navigator) {
          await navigator.serviceWorker.register("/sw.js");
          const reg = await navigator.serviceWorker.ready;
          sub = await reg.pushManager.getSubscription();
          if (cancelled) return;
          setPushEnabled(!!sub);
        }
        const { configured } = await getVapidPublicKey();
        if (cancelled) return;
        setPushConfigured(configured);
        if (sub) {
          setCommunityAccess("ready");
          return;
        }
        if (!configured) {
          const policyOk = localStorage.getItem(COMMUNITY_POLICY_KEY) === "1";
          setCommunityAccess(policyOk ? "ready" : "gate");
          return;
        }
        setCommunityAccess("gate");
      } catch {
        if (!cancelled) setCommunityAccess("gate");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const completePolicyOnlyGate = () => {
    localStorage.setItem(COMMUNITY_POLICY_KEY, "1");
    setCommunityAccess("ready");
  };

  const onGateSubscribe = async () => {
    const ok = await subscribePushNotifications();
    if (ok) setCommunityAccess("ready");
  };

  useEffect(() => {
    if (communityAccess !== "ready" || typeof window === "undefined") return;
    const last = localStorage.getItem(COMMUNITY_RULES_MODAL_LAST_KEY);
    const oneDay = 24 * 60 * 60 * 1000;
    const overdue =
      !last || Number.isNaN(Date.parse(last)) || Date.now() - new Date(last).getTime() >= oneDay;
    if (overdue) setRulesModalOpen(true);
  }, [communityAccess]);

  const acknowledgeCommunityRules = () => {
    localStorage.setItem(COMMUNITY_RULES_MODAL_LAST_KEY, new Date().toISOString());
    setRulesModalOpen(false);
  };

  const showThread = !!threadRoot;

  if (communityAccess === "loading") {
    return (
      <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
      </div>
    );
  }

  if (communityAccess === "gate") {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/85 p-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:p-4">
        <div className="flex max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="shrink-0 px-4 pb-2 pt-4 text-center sm:px-6 sm:pb-3 sm:pt-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tic.ico" alt="" className="mx-auto mb-2 h-10 w-10 sm:mb-3 sm:h-12 sm:w-12" width={48} height={48} />
            <h2 className="text-lg font-bold leading-tight text-slate-900 sm:text-xl">TIC Community</h2>
            <p className="mt-1.5 text-xs leading-snug text-slate-600 sm:mt-2 sm:text-sm">
              Read the guidelines and enable alerts before you join the conversation.
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6">
            <div className="rounded-xl border border-amber-100 bg-amber-50/90 p-3 text-left sm:p-4">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 sm:mb-2 sm:text-xs">
                Community policy
              </p>
              <ul className="list-inside list-disc space-y-1.5 text-[11px] leading-snug text-amber-950/90 sm:space-y-2 sm:text-sm sm:leading-normal">
                {COMMUNITY_GUIDELINES.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </div>
            {pushConfigured ? (
              <p className="mt-3 text-center text-xs leading-snug text-slate-600 sm:mt-4 sm:text-sm">
                Subscribe to browser notifications so you do not miss important messages. You can mute later from the channel.
              </p>
            ) : (
              <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs leading-snug text-slate-700 sm:mt-4 sm:p-3 sm:text-sm">
                Push notifications are not configured on the server yet. You can still enter after confirming you have read the policy.
              </p>
            )}
          </div>

          <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
            {pushConfigured ? (
              <button
                type="button"
                disabled={pushBusy}
                onClick={() => void onGateSubscribe()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50 sm:py-4 sm:text-base"
              >
                {pushBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Bell className="h-5 w-5 shrink-0" />}
                Turn on notifications to continue
              </button>
            ) : (
              <button
                type="button"
                onClick={completePolicyOnlyGate}
                className="w-full rounded-xl bg-slate-900 px-3 py-3.5 text-sm font-semibold text-white shadow hover:bg-slate-800 sm:py-3.5 sm:text-base"
              >
                I have read the policy — continue
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col lg:flex-row lg:min-h-[calc(100vh-5rem)]">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden border-slate-200 bg-white lg:border-r">
        <header className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Hash className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-base">TIC Community</h1>
              <p className="text-[11px] text-slate-500 sm:text-xs">
                <span className="hidden sm:inline">Everyone on the platform — stay respectful and professional · </span>
                <button
                  type="button"
                  onClick={() => setRulesModalOpen(true)}
                  className="font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:text-slate-950"
                >
                  Community guidelines
                </button>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <ConnectionStatus />
            {isAdminRole(user?.role) ? (
              <button
                type="button"
                onClick={() => {
                  setAdminSelectMode((v) => !v);
                  setSelectedMessageIds([]);
                }}
                className={cn(
                  "rounded-xl border-2 px-3 py-2 text-sm font-semibold transition sm:px-4",
                  adminSelectMode
                    ? "border-rose-400 bg-rose-50 text-rose-900 hover:bg-rose-100"
                    : "border-slate-300 bg-white text-slate-900 hover:bg-slate-100",
                )}
              >
                {adminSelectMode ? "Cancel selection" : "Select messages"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void togglePush()}
              disabled={pushBusy}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-semibold shadow-sm transition sm:px-4",
                pushEnabled
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                  : "border-sky-400 bg-sky-50 text-sky-900 hover:bg-sky-100",
              )}
            >
              {pushBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : pushEnabled ? (
                <BellOff className="h-4 w-4" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              <span>{pushEnabled ? "Mute alerts" : "Notification alerts"}</span>
            </button>
          </div>
        </header>

        {pushConfigured && !pushEnabled && (
          <div className="flex shrink-0 flex-col gap-2 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-3 sm:flex-row sm:items-center sm:px-4">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-amber-950">Enable notifications</p>
                <p className="text-xs text-amber-900/90">
                  Get alerted when someone posts in TIC Community. Recommended so you do not miss updates.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={pushBusy}
              onClick={() => void subscribePushNotifications()}
              className="shrink-0 rounded-lg bg-amber-900 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-950 disabled:opacity-50"
            >
              {pushBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe now"}
            </button>
          </div>
        )}

        {isAdminRole(user?.role) && adminSelectMode ? (
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-900 px-3 py-2.5 text-white sm:px-4">
            <p className="text-sm font-medium">
              {selectedMessageIds.length} selected
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={selectAllVisibleMessages}
                className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold hover:bg-white/10"
              >
                Select all in feed
              </button>
              <button
                type="button"
                onClick={() => setSelectedMessageIds([])}
                className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold hover:bg-white/10"
              >
                Clear
              </button>
              <button
                type="button"
                disabled={bulkDeleting || selectedMessageIds.length === 0}
                onClick={() => void handleBulkDelete()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-600 disabled:opacity-40"
              >
                {bulkDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Delete selected
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
            {pinned.length > 0 && (
              <div className="sticky top-0 z-20 -mx-3 mb-3 border-b border-amber-200/90 bg-amber-50/95 px-3 py-2 shadow-sm backdrop-blur-md sm:-mx-4 sm:px-4">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">Pinned</p>
                <div className="flex flex-wrap gap-2">
                  {pinned.filter((p): p is CommunityMessage => Boolean(p?.id)).map((p) => (
                    <div key={p.id} className="inline-flex max-w-full items-center gap-1 rounded-full border border-amber-200 bg-white pl-2 pr-1 text-xs text-amber-950">
                      <button
                        type="button"
                        onClick={() => void openThread(p)}
                        className="flex min-w-0 flex-1 items-center gap-1 truncate py-1 text-left hover:text-amber-900"
                      >
                        <Pin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{p.body.replace(/\u200b/g, "").trim() || "Image"}</span>
                      </button>
                      {isAdminRole(user?.role) && (
                        <button
                          type="button"
                          title="Unpin"
                          onClick={(e) => {
                            e.stopPropagation();
                            void onPin(p);
                          }}
                          className="rounded-full p-1 text-amber-800 hover:bg-amber-100"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {typingPeers.filter((p) => p.parentId === null).length > 0 && (
              <p className="mb-3 text-xs italic text-slate-500" aria-live="polite">
                {typingSummary(typingPeers.filter((p) => p.parentId === null))}
              </p>
            )}
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : messages.length === 0 && pinned.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-500">No messages yet. Start the conversation.</p>
            ) : (
              <ul className="space-y-6 pb-2">
                {messages.filter((m): m is CommunityMessage => Boolean(m?.id)).map((m) => (
                  <li key={m.id}>
                    <MessageBubble
                      message={m}
                      selfId={user?.id}
                      selectMode={adminSelectMode && isAdminRole(user?.role)}
                      selected={selectedMessageIds.includes(m.id)}
                      onToggleSelect={() => toggleMessageSelected(m.id)}
                      onOpenThread={() => void openThread(m)}
                      onPin={isAdminRole(user?.role) ? () => void onPin(m) : undefined}
                      onEdit={m.author.id === user?.id ? () => startEdit(m) : undefined}
                      onDelete={
                        adminSelectMode
                          ? undefined
                          : m.author.id === user?.id || isAdminRole(user?.role)
                            ? () => void handleDeleteMessage(m)
                            : undefined
                      }
                    />
                  </li>
                ))}
                <div ref={bottomRef} />
              </ul>
            )}
          </div>

        <footer className="flex-shrink-0 border-t border-slate-200 bg-slate-50/90 p-3 backdrop-blur sm:p-4">
          {images.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {images.map((url) => (
                <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                    className="absolute right-0 top-0 rounded-bl bg-black/60 p-0.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => void onPickImages(e)} />
            <button
              type="button"
              disabled={uploading || images.length >= 8}
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-black/25 p-2 text-black hover:bg-slate-100 disabled:opacity-50"
              title="Add images"
            >
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5 stroke-[2.5]" />}
            </button>
            <textarea
              value={body}
              onChange={(e) => {
                const v = e.target.value;
                setBody(v);
                if (v.trim().length > 0) emitTyping(null);
              }}
              placeholder="Message #tic-community"
              rows={1}
              className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-1 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(null);
                }
              }}
            />
            <button
              type="button"
              disabled={sending || (!body.trim() && images.length === 0)}
              onClick={() => void send(null)}
              className="rounded-lg bg-slate-900 p-2.5 text-white hover:bg-slate-800 disabled:opacity-40"
            >
              {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-slate-400">Images only · Enter to send · Shift+Enter newline</p>
        </footer>
        </div>
      </section>

      {showThread && threadRoot && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setThreadRoot(null)} aria-hidden />
          <aside
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-2xl border border-slate-200 bg-white shadow-2xl lg:static lg:z-0 lg:max-h-none lg:min-h-0 lg:w-[380px] lg:max-w-[40vw] lg:flex-1 lg:rounded-none lg:border-l lg:border-t-0 lg:shadow-none",
            )}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5 sm:px-4">
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare className="h-4 w-4 shrink-0 text-slate-500" />
                <span className="truncate text-sm font-semibold text-slate-900">Thread</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                  {threadRoot.replyCount} replies
                </span>
              </div>
              <button
                type="button"
                onClick={() => setThreadRoot(null)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label="Close thread"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
              <div className="mb-4 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-800">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <AuthorAvatar author={threadRoot.author} own={threadRoot.author.id === user?.id} size="sm" />
                    <p className="font-medium text-slate-900">
                      {threadRoot.author.firstName} {threadRoot.author.lastName}
                    </p>
                  </div>
                  <MessageActionsMenu
                    alignEnd
                    items={[
                      ...(threadRoot.author.id === user?.id
                        ? [{ label: "Edit message", onClick: () => startEdit(threadRoot) }]
                        : []),
                      ...(threadRoot.author.id === user?.id || isAdminRole(user?.role)
                        ? [
                            {
                              label: "Delete message",
                              onClick: () => void handleDeleteMessage(threadRoot),
                              danger: true as const,
                            },
                          ]
                        : []),
                    ]}
                  />
                </div>
                <div className="text-slate-700">
                  <ExpandableMessageText
                    text={threadRoot.body}
                    isOwn={threadRoot.author.id === user?.id}
                    variant="light"
                  />
                </div>
                {threadRoot.imageUrls?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {threadRoot.imageUrls.map((u) => (
                      <a key={u} href={u} target="_blank" rel="noreferrer" className="block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u} alt="" className="max-h-40 rounded-lg border border-slate-200" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
              {typingPeers.filter((p) => p.parentId === threadRoot.id).length > 0 && (
                <p className="mb-3 text-xs italic text-slate-500" aria-live="polite">
                  {typingSummary(typingPeers.filter((p) => p.parentId === threadRoot.id))}
                </p>
              )}
              {threadLoading ? (
                <Loader2 className="mx-auto my-8 h-6 w-6 animate-spin text-slate-400" />
              ) : (
                <ul className="space-y-4">
                  {threadMsgs.filter((tm): tm is CommunityMessage => Boolean(tm?.id)).map((tm) => (
                    <li key={tm.id}>
                      <MessageBubble
                        message={tm}
                        selfId={user?.id}
                        compact
                        onEdit={tm.author.id === user?.id ? () => startEdit(tm) : undefined}
                        onDelete={
                          tm.author.id === user?.id || isAdminRole(user?.role)
                            ? () => void handleDeleteMessage(tm)
                            : undefined
                        }
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t border-slate-100 p-3 sm:p-4">
              <div className="space-y-2">
              {threadImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {threadImages.map((url) => (
                    <div key={url} className="relative h-14 w-14 overflow-hidden rounded-lg border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setThreadImages((prev) => prev.filter((u) => u !== url))}
                        className="absolute right-0 top-0 bg-black/60 p-0.5 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                <input
                  ref={threadFileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => void onPickThreadImages(e)}
                />
                <button
                  type="button"
                  disabled={uploading || threadImages.length >= 8}
                  onClick={() => threadFileRef.current?.click()}
                  className="self-end rounded-lg border border-black/25 p-2 text-black hover:bg-slate-100 disabled:opacity-50"
                  title="Add images"
                >
                  <ImagePlus className="h-4 w-4 stroke-[2.5]" />
                </button>
                <textarea
                  value={threadBody}
                  onChange={(e) => {
                    const v = e.target.value;
                    setThreadBody(v);
                    if (v.trim().length > 0) emitTyping(threadRoot.id);
                  }}
                  placeholder="Reply in thread…"
                  rows={2}
                  className="min-h-[44px] flex-1 resize-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send(threadRoot.id);
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={sending || (!threadBody.trim() && threadImages.length === 0)}
                  onClick={() => void send(threadRoot.id)}
                  className="self-end rounded-lg bg-slate-900 p-2 text-white hover:bg-slate-800 disabled:opacity-40"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
            </div>
          </aside>
        </>
      )}

      {rulesModalOpen && communityAccess === "ready" ? (
        <div
          className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal
          aria-labelledby="community-rules-title"
          onClick={() => acknowledgeCommunityRules()}
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Shield className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 id="community-rules-title" className="text-lg font-bold text-slate-900">
                  Community guidelines
                </h2>
                <p className="mt-1 text-sm text-slate-600">A quick reminder to keep TIC Community useful for everyone.</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm leading-relaxed text-slate-700">
              {COMMUNITY_GUIDELINES.map((line, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={acknowledgeCommunityRules}
              className="mt-6 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}

      {editing ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal
          aria-labelledby="community-edit-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 id="community-edit-title" className="text-lg font-semibold text-slate-900">
                Edit message
              </h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={5}
              className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            {editImages.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {editImages.map((url) => (
                  <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setEditImages((prev) => prev.filter((u) => u !== url))}
                      className="absolute right-0 top-0 rounded-bl bg-black/60 p-0.5 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={editFileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => void onPickEditImages(e)}
              />
              <button
                type="button"
                disabled={uploading || editImages.length >= 8}
                onClick={() => editFileRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-lg border border-black/25 px-3 py-2 text-xs font-semibold text-black hover:bg-slate-50 disabled:opacity-50"
              >
                <ImagePlus className="h-4 w-4 stroke-[2.5]" />
                Add images
              </button>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={editSaving}
                onClick={() => void saveEdit()}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function ExpandableMessageText({
  text,
  isOwn,
  variant = "darkBubble",
}: {
  text: string;
  isOwn: boolean;
  variant?: "darkBubble" | "light";
}) {
  const clean = text.replace(/\u200b/g, "");
  const [expanded, setExpanded] = useState(false);
  const long = clean.length > MESSAGE_PREVIEW_MAX_CHARS;
  const preview = long && !expanded ? `${clean.slice(0, MESSAGE_PREVIEW_MAX_CHARS).trimEnd()}…` : clean;
  const linkClass =
    variant === "light"
      ? "text-sky-700 hover:text-sky-900"
      : isOwn
        ? "text-sky-300 hover:text-white"
        : "text-sky-700 hover:text-sky-900";
  return (
    <div className="text-left">
      <p className="whitespace-pre-wrap break-words">{preview}</p>
      {long ? (
        <button type="button" onClick={() => setExpanded((e) => !e)} className={cn("mt-1.5 text-xs font-semibold underline underline-offset-2", linkClass)}>
          {expanded ? "Show less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}

function MessageActionsMenu({
  alignEnd,
  items,
}: {
  alignEnd?: boolean;
  items: Array<{ label: string; onClick: () => void; danger?: boolean }>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div className="relative inline-flex shrink-0" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Message actions"
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200/90 hover:text-black"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open ? (
        <div
          className={cn(
            "absolute top-full z-40 mt-0.5 min-w-[12rem] rounded-lg border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5",
            alignEnd ? "right-0" : "left-0",
          )}
          role="menu"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={cn(
                "flex w-full px-3 py-2 text-left text-xs font-medium hover:bg-slate-50",
                item.danger ? "text-red-600 hover:bg-red-50" : "text-slate-800",
              )}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AuthorAvatar({
  author,
  own,
  size = "md",
}: {
  author: CommunityMessage["author"];
  own?: boolean;
  size?: "sm" | "md";
}) {
  const photo = author.profilePhoto?.trim();
  const sizeClass =
    size === "sm"
      ? "h-8 w-8 min-h-[2rem] min-w-[2rem] text-[10px]"
      : "h-9 w-9 min-h-[2.25rem] min-w-[2.25rem] text-xs sm:h-10 sm:w-10 sm:min-h-[2.5rem] sm:min-w-[2.5rem]";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-white ring-1 ring-black/15",
        sizeClass,
        own ? "bg-slate-900" : "bg-slate-400",
      )}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden>{(author.firstName?.[0] ?? "?") + (author.lastName?.[0] ?? "")}</span>
      )}
    </div>
  );
}

function messageWasEdited(m: CommunityMessage): boolean {
  if (!m.updatedAt) return false;
  try {
    return new Date(m.updatedAt).getTime() - new Date(m.createdAt).getTime() > 2000;
  } catch {
    return false;
  }
}

function MessageBubble({
  message: m,
  selfId,
  selectMode,
  selected,
  onToggleSelect,
  onOpenThread,
  onPin,
  onEdit,
  onDelete,
  compact,
}: {
  message: CommunityMessage;
  selfId?: string;
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onOpenThread?: () => void;
  onPin?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}) {
  const own = m.author.id === selfId;
  const edited = messageWasEdited(m);

  const menuItems: Array<{ label: string; onClick: () => void; danger?: boolean }> = [];
  if (onEdit) {
    menuItems.push({ label: "Edit message", onClick: onEdit });
  }
  if (onDelete) {
    menuItems.push({ label: "Delete message", onClick: onDelete, danger: true });
  }

  const showReplyInThread = !m.parentId && Boolean(onOpenThread);
  const showPinButton = Boolean(onPin);

  return (
    <div className={cn("flex gap-3", own && "flex-row-reverse")}>
      {selectMode && onToggleSelect ? (
        <label className="mt-2 flex cursor-pointer shrink-0 items-start">
          <input
            type="checkbox"
            checked={!!selected}
            onChange={() => onToggleSelect()}
            className="h-4 w-4 rounded border-2 border-black text-black focus:ring-black"
          />
        </label>
      ) : null}
      <AuthorAvatar author={m.author} own={own} size={compact ? "sm" : "md"} />
      <div className={cn("min-w-0 flex-1", own && "text-right")}>
        <div className={cn("mb-1 flex flex-wrap items-center gap-2", own && "justify-end")}>
          <span className="text-sm font-semibold text-slate-900">
            {m.author.firstName} {m.author.lastName}
          </span>
          <span className="rounded border border-black bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase text-black">
            {roleLabel(m.author.role)}
          </span>
          <span className="text-[11px] text-slate-400">{formatTime(m.createdAt)}</span>
          {edited ? <span className="text-[10px] text-slate-400">(edited)</span> : null}
          {m.isPinned && <Pin className="inline h-3 w-3 text-amber-600" />}
        </div>
        <div
          className={cn(
            "inline-block max-w-full rounded-2xl px-3 py-2 text-left text-sm leading-relaxed text-slate-800 shadow-sm",
            own ? "rounded-tr-sm bg-slate-900 text-white" : "rounded-tl-sm border border-slate-100 bg-slate-50",
          )}
        >
          {m.body.replace(/\u200b/g, "").trim() ? (
            <ExpandableMessageText text={m.body} isOwn={own} variant="darkBubble" />
          ) : null}
          {m.imageUrls?.length ? (
            <div className={cn("mt-2 flex flex-wrap gap-2", compact && "max-w-[280px]")}>
              {m.imageUrls.map((u) => (
                <a key={u} href={u} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt="" className="max-h-48 rounded-lg border border-white/20" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
        {showReplyInThread || showPinButton || menuItems.length > 0 ? (
          <div className={cn("mt-1 flex", own ? "justify-end" : "justify-start")}>
            <div className="inline-flex max-w-full min-w-0 items-center gap-0.5">
              {showReplyInThread ? (
                <button
                  type="button"
                  onClick={onOpenThread}
                  className={cn(
                    "min-w-0 shrink text-left text-[11px] font-medium leading-tight underline underline-offset-2",
                    own ? "text-sky-300 hover:text-white" : "text-sky-700 hover:text-sky-900",
                  )}
                >
                  {m.replyCount > 0 ? `Open thread (${m.replyCount} replies)` : "Reply in thread"}
                </button>
              ) : null}
              {showPinButton ? (
                <button
                  type="button"
                  title={m.isPinned ? "Unpin" : "Pin message"}
                  onClick={onPin}
                  className={cn(
                    "shrink-0 rounded-lg p-1",
                    own
                      ? "text-white/90 hover:bg-white/10"
                      : "text-slate-600 hover:bg-slate-200/90 hover:text-black",
                  )}
                >
                  <Pin className={cn("h-3.5 w-3.5", m.isPinned && "text-amber-500")} />
                </button>
              ) : null}
              {menuItems.length > 0 ? (
                <MessageActionsMenu alignEnd={own} items={menuItems} />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
