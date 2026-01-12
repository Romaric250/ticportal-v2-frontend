import { createImageUpload } from "novel";
import { toast } from "sonner";
import axios from "axios";
import { tokenStorage } from "../../../src/lib/api-client";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

const onUpload = async (file: File): Promise<string> => {
  // Convert file to base64 data URL
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  try {
    const token = tokenStorage.getAccessToken();
    const response = await axios.post<{
      success: boolean;
      data: {
        url: string;
        key: string;
        name: string;
        size: number;
      };
    }>(
      `${apiBaseUrl}/f/upload`,
      {
        file: base64Data,
        fileName: file.name,
      },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data.url;
  } catch (error: any) {
    toast.error(error?.message || "Failed to upload image");
    throw error;
  }
};

export const uploadFn = createImageUpload({
  onUpload,
  validateFn: (file) => {
    if (!file.type.includes("image/")) {
      toast.error("File type not supported. Please upload an image.");
      return false;
    }
    if (file.size / 1024 / 1024 > 20) {
      toast.error("File size too big (max 20MB).");
      return false;
    }
    return true;
  },
});

