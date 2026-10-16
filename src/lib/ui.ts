import { useSyncExternalStore } from "react";

/** chalk sticks, assigned by join order */
export const CHALK = ["#f2d16b", "#f29bb2", "#8ec5e8", "#9be0b8", "#f4a66a", "#c3a7f0"];

const CODE_LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ"; // no I/L/O: easy to read across a room
export const newCode = () => Array.from({ length: 4 }, () => CODE_LETTERS[Math.floor(Math.random() * CODE_LETTERS.length)]).join("");
export const cleanCode = (c: string) => c.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);

const NAME_KEY = "classclash:name";
function loadName() {
  try { return localStorage.getItem(NAME_KEY) ?? ""; } catch { return ""; }
}
const noop = () => () => {};
/** saved name; null during server render */
export const useStoredName = () => useSyncExternalStore(noop, loadName, () => null);
export function saveName(n: string) {
  try { localStorage.setItem(NAME_KEY, n); } catch {}
}
