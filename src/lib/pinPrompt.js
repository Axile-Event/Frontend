function getUserEmail() {
  if (!canUseStorage()) return null;
  try {
    // Get email from auth storage (Zustand persist)
    const authStorage = window.localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed?.state?.user?.email || null;
    }
    return null;
  } catch {
    return null;
  }
}

function getStorageKeys() {
  const email = getUserEmail();
  if (!email) {
    // Fallback to global keys if no email found
    return {
      hasPin: "Axile_has_pin",
      pinSalt: "Axile_pin_salt",
      pinHash: "Axile_pin_hash",
    };
  }
  // User-specific keys
  return {
    hasPin: `Axile_has_pin:${email.toLowerCase()}`,
    pinSalt: `Axile_pin_salt:${email.toLowerCase()}`,
    pinHash: `Axile_pin_hash:${email.toLowerCase()}`,
  };
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function readLocalStorage(key) {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocalStorage(key, value) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateSaltHex() {
  if (!canUseStorage()) return `${Date.now()}`;
  try {
    if (!window.crypto?.getRandomValues) return `${Date.now()}`;
    const bytes = window.crypto.getRandomValues(new Uint8Array(16));
    return toHex(bytes);
  } catch {
    return `${Date.now()}`;
  }
}

export function hasPinSet() {
  const STORAGE_KEYS = getStorageKeys();
  const flag = readLocalStorage(STORAGE_KEYS.hasPin) === "true";
  const salt = readLocalStorage(STORAGE_KEYS.pinSalt);
  const hash = readLocalStorage(STORAGE_KEYS.pinHash);
  return flag && !!salt && !!hash;
}

export async function hashPin(pin, salt) {
  if (!canUseStorage()) return "";
  const data = `${salt}:${pin}`;
  const enc = new TextEncoder();
  const digest = await window.crypto.subtle.digest("SHA-256", enc.encode(data));
  return toHex(digest);
}

export function getStoredPinSalt(storageKeys = null) {
  const STORAGE_KEYS = storageKeys || getStorageKeys();
  return readLocalStorage(STORAGE_KEYS.pinSalt);
}

export function getStoredPinHash(storageKeys = null) {
  const STORAGE_KEYS = storageKeys || getStorageKeys();
  return readLocalStorage(STORAGE_KEYS.pinHash);
}

export async function storePinLocally(pin) {
  if (!canUseStorage()) return;
  const STORAGE_KEYS = getStorageKeys();
  const salt = generateSaltHex();
  const pinHash = await hashPin(pin, salt);
  writeLocalStorage(STORAGE_KEYS.pinSalt, salt);
  writeLocalStorage(STORAGE_KEYS.pinHash, pinHash);
  writeLocalStorage(STORAGE_KEYS.hasPin, "true");
}

export async function updateLocalPin(pin) {
  // Reuse existing salt if present to avoid changing salt unless needed
  if (!canUseStorage()) return;
  const STORAGE_KEYS = getStorageKeys();
  const existingSalt = readLocalStorage(STORAGE_KEYS.pinSalt);
  const salt = existingSalt || generateSaltHex();
  const pinHash = await hashPin(pin, salt);
  writeLocalStorage(STORAGE_KEYS.pinSalt, salt);
  writeLocalStorage(STORAGE_KEYS.pinHash, pinHash);
  writeLocalStorage(STORAGE_KEYS.hasPin, "true");
}

export async function verifyPinLocally(pin) {
  const STORAGE_KEYS = getStorageKeys();
  const salt = readLocalStorage(STORAGE_KEYS.pinSalt);
  const storedHash = readLocalStorage(STORAGE_KEYS.pinHash);
  if (!salt || !storedHash) return false;
  const candidate = await hashPin(pin, salt);
  return candidate === storedHash;
}
