import { createImageUpload } from "novel";
import { toast } from "sonner";
import { uploadFile } from "@/src/lib/uploadthing";

const onUpload = async (file: File): Promise<string> => uploadFile(file);

export const uploadFn = createImageUpload({
  onUpload,
  validateFn: (file) => {
    if (!file.type.includes("image/")) {
      toast.error("File type not supported. Please upload an image.");
      return false;
    }
    if (file.size / 1024 / 1024 > 12) {
      toast.error("File size too big (max 12 MB).");
      return false;
    }
    return true;
  },
});
