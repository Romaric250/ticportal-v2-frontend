import { apiClient } from "./api-client";

export function isGoogleDriveUrl(url: string): boolean {
  if (!url) return false;
  return /drive\.google\.com|docs\.google\.com/.test(url);
}

/**
 * Check if a Google Drive URL is publicly accessible by calling the backend.
 */
export async function checkGDriveAccess(url: string): Promise<{
  accessible: boolean | null;
  error?: string;
}> {
  if (!isGoogleDriveUrl(url)) {
    return { accessible: null };
  }
  try {
    const { data } = await apiClient.post<{
      success: boolean;
      data: { accessible: boolean | null; error?: string };
    }>("/deliverables/check-url-access", { url });
    return data.data ?? { accessible: null };
  } catch {
    return { accessible: null, error: "Could not verify link access." };
  }
}
