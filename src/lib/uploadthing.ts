import { apiClient } from "./api-client";

const MAX_FILE_SIZE = 12 * 1024 * 1024; // 12 MB

/**
 * Upload a single file via FormData. The backend forwards it to
 * UploadThing using UTApi and returns the file URL.
 */
export async function uploadFile(
  file: File,
  opts?: {
    onProgress?: (progress: number) => void;
  },
): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed is 12 MB.`,
    );
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post<{
      success: boolean;
      data: { url: string };
    }>("/f/upload", formData, {
      timeout: 120_000,
      onUploadProgress: opts?.onProgress
        ? (e) => {
            const pct = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
            opts.onProgress!(pct);
          }
        : undefined,
    });

    const url = data?.data?.url ?? (data as any)?.url;
    if (!url) {
      throw new Error("no-url");
    }
    return url;
  } catch (err: any) {
    const msg = err?.message?.toLowerCase?.() ?? "";
    if (msg.includes("no-url")) {
      throw new Error("Upload completed but no file URL was returned. Please try again.");
    }
    if (msg.includes("too large") || msg.includes("size")) {
      throw new Error("File is too large. Maximum allowed size is 12 MB.");
    }
    if (msg.includes("timeout") || msg.includes("network") || msg.includes("econnreset")) {
      throw new Error("Upload failed due to a network issue. Please check your connection and try again.");
    }
    const serverMsg = err?.response?.data?.message;
    if (serverMsg) {
      throw new Error(serverMsg);
    }
    throw new Error("Error uploading file. Please try again.");
  }
}

/**
 * Upload multiple files. Returns an array of uploaded file URLs.
 */
export async function uploadMultipleFiles(
  files: File[],
  opts?: {
    onProgress?: (progress: number) => void;
  },
): Promise<string[]> {
  const urls: string[] = [];
  for (const f of files) {
    const url = await uploadFile(f, opts);
    urls.push(url);
  }
  return urls;
}
