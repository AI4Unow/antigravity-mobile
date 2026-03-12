import { useState, useEffect, useRef, useCallback } from "react";

/** Persist draft text per cascadeId across re-renders, HMR, and page reloads. */
const DRAFT_PREFIX = "porta:draft:";
const draftStore = {
  get(key: string): string {
    try {
      return localStorage.getItem(DRAFT_PREFIX + key) ?? "";
    } catch {
      return "";
    }
  },
  set(key: string, value: string): void {
    try {
      if (value) {
        localStorage.setItem(DRAFT_PREFIX + key, value);
      } else {
        localStorage.removeItem(DRAFT_PREFIX + key);
      }
    } catch {
      // localStorage might be full or unavailable
    }
  },
  delete(key: string): void {
    try {
      localStorage.removeItem(DRAFT_PREFIX + key);
    } catch {
      // localStorage might be unavailable
    }
  },
};

interface UseDraftTextResult {
  draftText: string;
  handleDraftChange: (text: string) => void;
}

/**
 * Manages per-conversation draft text with localStorage persistence.
 * Saves the current draft when switching away, loads the new draft when switching to.
 */
export function useDraftText(activeId: string | null): UseDraftTextResult {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const activeIdRef = useRef(activeId);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const draftText = activeId ? (drafts[activeId] ?? draftStore.get(activeId)) : "";

  const handleDraftChange = useCallback(
    (text: string) => {
      if (!activeId) return;

      setDrafts((prev) => {
        if (text) {
          return { ...prev, [activeId]: text };
        }

        const next = { ...prev };
        delete next[activeId];
        return next;
      });
      draftStore.set(activeId, text);
    },
    [activeId],
  );

  return { draftText, handleDraftChange };
}

export { draftStore };
