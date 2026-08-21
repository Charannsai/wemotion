'use client';

import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/lib/store/editor';
import type { Document } from '@/lib/scene-graph/schema';

export function EditorInitializer({ document }: { document: Document }) {
  const init = useEditorStore(state => state.init);
  const initializedId = useRef<string | null>(null);

  useEffect(() => {
    // We check if the scenes[0]?.id is different, or use a better identifier
    // For now, if the document reference changes and it's a real document, we init.
    // A better check: has this specific document been initialized?
    const docId = document.meta?.title as string || 'default';
    if (initializedId.current !== docId) {
      init(document);
      initializedId.current = docId;
    }
  }, [document, init]);

  return null;
}
