"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Debounced auto-save hook for the workspace.
 *
 * Takes a value + a save function. When the value changes, waits
 * `delay` ms of quiet (no further changes) then calls save. Tracks
 * status so the UI can show "saving / saved / error" instead of
 * making the user guess whether their edit landed.
 *
 * The ref-based change detector lets us skip the very first save
 * (on initial mount the value hasn't actually changed — it's just
 * what came from the server).
 */
export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutoSave<T>(
  value: T,
  save: (next: T) => Promise<void>,
  delay = 600,
) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const previousRef = useRef<T>(value);
  const mountedRef = useRef(false);

  useEffect(() => {
    // Skip the initial value — it came from the server, no need to
    // round-trip it back.
    if (!mountedRef.current) {
      mountedRef.current = true;
      previousRef.current = value;
      return;
    }
    if (value === previousRef.current) return;
    previousRef.current = value;

    setStatus("saving");
    const timer = setTimeout(async () => {
      try {
        await save(value);
        setStatus("saved");
        // Fade "saved" back to idle after a beat so the indicator
        // doesn't permanently say "saved" — that reads as stale state.
        setTimeout(() => setStatus("idle"), 1500);
      } catch (err) {
        console.error("autosave failed", err);
        setStatus("error");
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [value, save, delay]);

  return status;
}
