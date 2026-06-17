// Review comments, keyed by stable wf-id. Persistence is delegated to an
// injected Storage port (localStorage in prod, in-memory for dev/tests).

import { useCallback, useMemo, useState } from "react";
import type { Comment } from "../types";
import type { CommentMap, Storage } from "../ports/storage";

export function useComments(storage: Storage) {
  const initial = useMemo(() => storage.load(), [storage]);
  const [comments, setComments] = useState<CommentMap>(initial);
  const [order, setOrder] = useState<string[]>(Object.keys(initial));

  const upsert = useCallback((c: Comment) => {
    setComments((prev) => {
      const next = { ...prev, [c.id]: c };
      storage.save(next);
      return next;
    });
    setOrder((prev) => (prev.includes(c.id) ? prev : [...prev, c.id]));
  }, [storage]);

  const remove = useCallback((id: string) => {
    setComments((prev) => {
      const next = { ...prev };
      delete next[id];
      storage.save(next);
      return next;
    });
    setOrder((prev) => prev.filter((x) => x !== id));
  }, [storage]);

  return { comments, order, upsert, remove };
}
