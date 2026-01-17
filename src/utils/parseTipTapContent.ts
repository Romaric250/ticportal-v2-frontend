/**
 * Utility to parse TipTap/ProseMirror JSON content and extract plain text
 */

type TipTapNode = {
  type: string;
  text?: string;
  content?: TipTapNode[];
  attrs?: Record<string, unknown>;
};

export function parseTipTapToPlainText(jsonString: string | null | undefined, maxLength?: number): string {
  if (!jsonString) return "";
  
  try {
    // If it's already plain text, return it trimmed
    if (!jsonString.trim().startsWith("{")) {
      const trimmed = jsonString.trim();
      return maxLength ? trimmed.slice(0, maxLength) + (trimmed.length > maxLength ? "..." : "") : trimmed;
    }

    const parsed = JSON.parse(jsonString) as { type?: string; content?: TipTapNode[] };
    
    if (!parsed.content || !Array.isArray(parsed.content)) {
      return "";
    }

    const extractText = (nodes: TipTapNode[]): string => {
      let text = "";
      
      for (const node of nodes) {
        if (node.text) {
          text += node.text + " ";
        }
        if (node.content && Array.isArray(node.content)) {
          text += extractText(node.content);
        }
      }
      
      return text;
    };

    const plainText = extractText(parsed.content).trim();
    return maxLength 
      ? plainText.slice(0, maxLength) + (plainText.length > maxLength ? "..." : "")
      : plainText;
  } catch (error) {
    // If parsing fails, return the original string trimmed
    console.warn("Failed to parse TipTap content:", error);
    const trimmed = jsonString.trim();
    return maxLength ? trimmed.slice(0, maxLength) + (trimmed.length > maxLength ? "..." : "") : trimmed;
  }
}
