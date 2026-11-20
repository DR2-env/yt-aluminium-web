"use client";

// Carries what a visitor typed or photographed in the home page box over to the quote page,
// and shrinks photos in the browser so they upload quickly from a phone.
import { MAX_PHOTO_BYTES } from "./quote-request";

export interface DraftPhoto {
  name: string;
  type: string;
  dataUrl: string;
}

export interface QuoteDraft {
  list?: string;
  photo?: DraftPhoto;
}

const KEY = "yt-quote-draft";
// The draft taken by the quote page. Cached so React's double-run of state initialisers
// in development (and remounts) see the same draft instead of an already-cleared one.
let taken: QuoteDraft | null = null;

export function saveDraft(draft: QuoteDraft) {
  taken = null;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // Storage full or blocked: the quote page simply starts empty.
  }
}

/** Read and clear the draft (it is only meant to be picked up once). */
export function takeDraft(): QuoteDraft {
  if (taken) return taken;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    window.sessionStorage.removeItem(KEY);
    taken = raw ? (JSON.parse(raw) as QuoteDraft) : {};
  } catch {
    taken = {};
  }
  return taken;
}

/** Forget the draft once it has been sent, so a remount starts empty. */
export function clearDraft() {
  taken = {};
}

const readAsDataUrl = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

const bytesOf = (dataUrl: string) => Math.round(((dataUrl.length - dataUrl.indexOf(",") - 1) * 3) / 4);

/**
 * Turn a chosen file into an uploadable data URL. Photos are resized to at most 1800 px and
 * saved as JPEG; PDFs are kept as they are. Returns null when the result is still too large.
 */
export async function prepareFile(file: File): Promise<DraftPhoto | null> {
  if (file.type === "application/pdf") {
    const dataUrl = await readAsDataUrl(file);
    return bytesOf(dataUrl) <= MAX_PHOTO_BYTES ? { name: file.name, type: file.type, dataUrl } : null;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    return bytesOf(dataUrl) <= MAX_PHOTO_BYTES ? { name: file.name.replace(/\.\w+$/, ".jpg"), type: "image/jpeg", dataUrl } : null;
  } catch {
    // Formats the browser cannot decode (e.g. HEIC outside Safari): send as is if small enough.
    const dataUrl = await readAsDataUrl(file);
    return bytesOf(dataUrl) <= MAX_PHOTO_BYTES ? { name: file.name, type: file.type, dataUrl } : null;
  }
}
