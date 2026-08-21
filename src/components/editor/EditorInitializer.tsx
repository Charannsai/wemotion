'use client';

import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/lib/store/editor';
import type { Document } from '@/lib/scene-graph/schema';

export function EditorInitializer({ document }: { document: Document }) {
  const init = useEditorStore(state => state.init);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      init(document);
      initialized.current = true;
    }
  }, [document, init]);

  return null;
}
