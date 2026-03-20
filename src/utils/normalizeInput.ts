/**
 * Normalize user input to prevent font/Unicode-related login failures.
 * Some system fonts can cause invisible Unicode characters or full-width
 * lookalikes to be entered, leading to "invalid credentials" even when correct.
 */
const ZERO_WIDTH = /[\u200B-\u200D\uFEFF\u2060]/g;

export function normalizeEmail(email: string): string {
  if (!email || typeof email !== "string") return "";
  return email
    .replace(ZERO_WIDTH, "")
    .normalize("NFKC")
    .trim()
    .toLowerCase();
}

export function normalizePassword(password: string): string {
  if (!password || typeof password !== "string") return "";
  return password.replace(ZERO_WIDTH, "").normalize("NFKC").trim();
}
