// Storage port: how review comments are persisted. The app depends on this
// interface, not on localStorage directly — so prod wires the browser adapter
// while dev/tests wire an in-memory one (DIP).

import type { Comment } from "../types";

export type CommentMap = Record<string, Comment>;

export interface Storage {
  load(): CommentMap;
  save(comments: CommentMap): void;
}

// Browser localStorage, keyed per page so different wireframes don't collide.
export function localStorageAdapter(key: string): Storage {
  return {
    load() {
      try {
        const s = localStorage.getItem(key);
        return s ? (JSON.parse(s) as CommentMap) : {};
      } catch {
        return {};
      }
    },
    save(comments) {
      try {
        localStorage.setItem(key, JSON.stringify(comments));
      } catch {
        /* quota / private mode — comments stay in-memory for the session */
      }
    },
  };
}

// In-memory, for the dev harness and unit tests. No persistence across reloads.
export function memoryAdapter(initial: CommentMap = {}): Storage {
  let store: CommentMap = { ...initial };
  return {
    load: () => ({ ...store }),
    save: (comments) => {
      store = { ...comments };
    },
  };
}
