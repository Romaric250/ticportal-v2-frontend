/**
 * Simple encryption utility for localStorage data
 * Uses a combination of encoding and cipher for basic obfuscation
 * Note: This is client-side encryption and not cryptographically secure
 * For production, consider using a more secure method or server-side encryption
 */

const ENCRYPTION_KEY = "tic-portal-encryption-key-2025"; // In production, derive this from user session or environment

/**
 * Simple encryption using XOR cipher with key
 */
function encrypt(text: string): string {
  if (typeof window === "undefined") return text;
  
  try {
    let encrypted = "";
    for (let i = 0; i < text.length; i++) {
      const keyChar = ENCRYPTION_KEY[i % ENCRYPTION_KEY.length];
      const encryptedChar = String.fromCharCode(
        text.charCodeAt(i) ^ keyChar.charCodeAt(0)
      );
      encrypted += encryptedChar;
    }
    // Encode to base64 for safe storage
    return btoa(encrypted);
  } catch (error) {
    console.error("Encryption error:", error);
    return text; // Fallback to plain text if encryption fails
  }
}

/**
 * Simple decryption using XOR cipher with key
 */
function decrypt(encryptedText: string): string {
  if (typeof window === "undefined") return encryptedText;
  
  try {
    // Decode from base64
    const decoded = atob(encryptedText);
    let decrypted = "";
    for (let i = 0; i < decoded.length; i++) {
      const keyChar = ENCRYPTION_KEY[i % ENCRYPTION_KEY.length];
      const decryptedChar = String.fromCharCode(
        decoded.charCodeAt(i) ^ keyChar.charCodeAt(0)
      );
      decrypted += decryptedChar;
    }
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    // If decryption fails, try to return as-is (might be unencrypted legacy data)
    try {
      return atob(encryptedText);
    } catch {
      return encryptedText;
    }
  }
}

/**
 * Encrypt and store data in localStorage
 */
export function setEncryptedItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    const encrypted = encrypt(value);
    localStorage.setItem(key, encrypted);
  } catch (error) {
    console.error("Error setting encrypted item:", error);
    // Fallback to plain storage if encryption fails
    localStorage.setItem(key, value);
  }
}

/**
 * Get and decrypt data from localStorage
 */
export function getEncryptedItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    
    // Try to decrypt
    return decrypt(encrypted);
  } catch (error) {
    console.error("Error getting encrypted item:", error);
    // Fallback to plain retrieval
    return localStorage.getItem(key);
  }
}

/**
 * Remove encrypted item from localStorage
 */
export function removeEncryptedItem(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

/**
 * Encrypt an object (JSON stringify then encrypt)
 */
export function setEncryptedObject<T>(key: string, value: T): void {
  try {
    const jsonString = JSON.stringify(value);
    setEncryptedItem(key, jsonString);
  } catch (error) {
    console.error("Error setting encrypted object:", error);
  }
}

/**
 * Get and decrypt an object (decrypt then JSON parse)
 */
export function getEncryptedObject<T>(key: string): T | null {
  try {
    const decrypted = getEncryptedItem(key);
    if (!decrypted) return null;
    return JSON.parse(decrypted) as T;
  } catch (error) {
    console.error("Error getting encrypted object:", error);
    return null;
  }
}

