import { apiClient } from "../api-client";

export type CommunityAuthor = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePhoto: string | null;
};

export type CommunityMessage = {
  id: string;
  channelId: string;
  body: string;
  imageUrls: string[];
  parentId: string | null;
  isPinned: boolean;
  pinnedAt: string | null;
  createdAt: string;
  updatedAt?: string;
  author: CommunityAuthor;
  replyCount: number;
};

/**
 * Our axios response interceptor unwraps `{ success: true, data: T }` to `T`.
 * Support both shapes so callers stay correct if the interceptor changes.
 */
function unwrapData<T>(raw: unknown): T | undefined {
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw === "object" && !Array.isArray(raw) && "data" in (raw as object)) {
    const inner = (raw as { data: unknown }).data;
    return inner as T;
  }
  return raw as T;
}

function sanitizeMessageList(list: unknown): CommunityMessage[] {
  if (!Array.isArray(list)) return [];
  return list.filter((m): m is CommunityMessage => Boolean(m && typeof m === "object" && "id" in m && m.id));
}

function sanitizeMessage(m: unknown): CommunityMessage | null {
  if (!m || typeof m !== "object" || !("id" in m) || !(m as { id: unknown }).id) return null;
  return m as CommunityMessage;
}

function parseFeed(raw: unknown): { pinned: CommunityMessage[]; messages: CommunityMessage[] } {
  const inner =
    unwrapData<{ pinned?: unknown; messages?: unknown }>(raw) ??
    (raw as { pinned?: unknown; messages?: unknown } | null | undefined);
  if (!inner || typeof inner !== "object") {
    return { pinned: [], messages: [] };
  }
  return {
    pinned: sanitizeMessageList(inner.pinned),
    messages: sanitizeMessageList(inner.messages),
  };
}

function parseThreadMessages(raw: unknown): CommunityMessage[] {
  const inner =
    unwrapData<{ messages?: unknown }>(raw) ?? (raw as { messages?: unknown } | null | undefined);
  if (!inner || typeof inner !== "object") return [];
  return sanitizeMessageList(inner.messages);
}

function parseSingleMessage(raw: unknown): CommunityMessage | null {
  const candidate = unwrapData<unknown>(raw) ?? raw;
  return sanitizeMessage(candidate);
}

export async function fetchCommunityMessages(limit = 80): Promise<{
  pinned: CommunityMessage[];
  messages: CommunityMessage[];
}> {
  const { data } = await apiClient.get("/community/messages", { params: { limit } });
  return parseFeed(data);
}

export async function fetchThread(rootId: string): Promise<CommunityMessage[]> {
  const { data } = await apiClient.get(`/community/messages/${rootId}/thread`);
  return parseThreadMessages(data);
}

export async function postCommunityMessage(payload: {
  body: string;
  imageUrls?: string[];
  parentId?: string | null;
}): Promise<CommunityMessage> {
  const { data } = await apiClient.post("/community/messages", payload);
  const msg = parseSingleMessage(data);
  if (!msg) throw new Error("Invalid message response");
  return msg;
}

export async function pinCommunityMessage(messageId: string, pinned: boolean): Promise<CommunityMessage> {
  const { data } = await apiClient.patch(`/community/messages/${messageId}/pin`, { pinned });
  const msg = parseSingleMessage(data);
  if (!msg) throw new Error("Invalid message response");
  return msg;
}

export async function updateCommunityMessage(
  messageId: string,
  payload: { body: string; imageUrls?: string[] },
): Promise<CommunityMessage> {
  const { data } = await apiClient.patch(`/community/messages/${messageId}`, payload);
  const msg = parseSingleMessage(data);
  if (!msg) throw new Error("Invalid message response");
  return msg;
}

export async function deleteCommunityMessage(messageId: string): Promise<void> {
  await apiClient.delete(`/community/messages/${messageId}`);
}

export async function bulkDeleteCommunityMessages(ids: string[]): Promise<void> {
  await apiClient.post("/community/messages/bulk-delete", { ids });
}

export async function getVapidPublicKey(): Promise<{ publicKey: string | null; configured: boolean }> {
  const { data } = await apiClient.get("/community/push/vapid-public-key");
  const inner = unwrapData<{ publicKey: string | null; configured: boolean }>(data) ?? (data as { publicKey?: unknown; configured?: unknown });
  if (inner && typeof inner === "object" && "publicKey" in inner && "configured" in inner) {
    return {
      publicKey: inner.publicKey === null || typeof inner.publicKey === "string" ? inner.publicKey : null,
      configured: Boolean((inner as { configured: boolean }).configured),
    };
  }
  return { publicKey: null, configured: false };
}

export async function subscribeCommunityPush(sub: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}): Promise<void> {
  await apiClient.post("/community/push/subscribe", sub);
}

export async function unsubscribeCommunityPush(endpoint: string): Promise<void> {
  await apiClient.delete("/community/push/subscribe", { data: { endpoint } });
}
