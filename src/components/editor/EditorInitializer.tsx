'use client';

import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/lib/store/editor';
import type { Document } from '@/lib/scene-graph/schema';

/**
 * Initializes the editor Zustand store from a server-fetched Document.
 *
 * Previous implementation used `meta.title` as a cache key, which caused
 * the store to skip re-initialization when the document content changed
 * but the title stayed the same (or was missing). We now compare the full
 * serialized document so the store always reflects the latest DB state.
 */
export function EditorInitializer({ document }: { document: Document }) {
  const init = useEditorStore(state => state.init);
  const prevHash = useRef<string | null>(null);

  useEffect(() => {
    if (!document || !document.scenes) return;

    const hash = JSON.stringify(document);
    if (prevHash.current !== hash) {
      init(document);
      prevHash.current = hash;
    }
  }, [document, init]);

  return null;
}
