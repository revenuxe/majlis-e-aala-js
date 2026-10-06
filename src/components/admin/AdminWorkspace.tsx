"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

const WorkspaceContext = createContext<string | null>(null);
export function AdminWorkspaceProvider({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <WorkspaceContext.Provider value={`mea-admin-workspace-v1:${userId}:`}>
      {ready ? (
        children
      ) : (
        <div role="status" className="grid min-h-screen place-items-center">
          Loading workspace…
        </div>
      )}
    </WorkspaceContext.Provider>
  );
}

export function useAdminStorageKey(key: string) {
  const prefix = useContext(WorkspaceContext);
  return prefix ? prefix + key : null;
}

// Session storage survives navigation and reloads without sharing drafts between
// administrators or browser tabs. Unavailable storage falls back to React state.
export function useAdminState<T>(
  key: string,
  initial: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const storageKey = useAdminStorageKey(key);
  const [value, setValue] = useState<T>(() => {
    const fallback = typeof initial === "function" ? (initial as () => T)() : initial;
    if (storageKey && typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem(storageKey);
        if (stored !== null) {
          const parsed: unknown = JSON.parse(stored);
          const valid =
            fallback === null
              ? parsed === null || (typeof parsed === "object" && !Array.isArray(parsed))
              : Array.isArray(fallback)
                ? Array.isArray(parsed)
                : typeof parsed === typeof fallback && parsed !== null;
          if (valid) return parsed as T;
        }
      } catch {
        /* Ignore unavailable storage or a damaged draft. */
      }
    }
    return fallback;
  });
  useEffect(() => {
    if (!storageKey) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      /* Keep editing when storage is full or disabled. */
    }
  }, [storageKey, value]);
  return [value, setValue];
}
