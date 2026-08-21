/**
 * Editor Zustand Store
 *
 * Manages the client-side state of the video editor, wrapping the immutable
 * operations engine to provide a reactive UI, along with transient UI state
 * (selected layers, playback head).
 */
import { create } from 'zustand';
import type { Document } from '@/lib/scene-graph/schema';
import { type HistoryState, createHistory, pushOperations, undo, redo, canUndo, canRedo } from '@/lib/operations/history';
import { type Operation } from '@/lib/operations/types';

interface EditorUiState {
  selectedSceneId: string | null;
  selectedLayerIds: string[];
  currentFrame: number;
  isPlaying: boolean;
  zoom: number;
}

interface EditorState extends EditorUiState {
  history: HistoryState;
  
  // Actions - Document
  dispatch: (operations: Operation | Operation[], label?: string) => void;
  undo: () => void;
  redo: () => void;
  
  // Actions - UI
  selectScene: (id: string | null) => void;
  selectLayer: (id: string, additive?: boolean) => void;
  clearSelection: () => void;
  setFrame: (frame: number) => void;
  setPlaying: (playing: boolean) => void;
  setZoom: (zoom: number) => void;
  
  // Initialization
  init: (doc: Document) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial empty state (will be replaced by init())
  history: createHistory({
    version: 1, scenes: [], fps: 30, canvasWidth: 1920, canvasHeight: 1080, meta: {}
  }),
  
  selectedSceneId: null,
  selectedLayerIds: [],
  currentFrame: 0,
  isPlaying: false,
  zoom: 0.5,

  dispatch: (ops, label = 'Update') => {
    const operations = Array.isArray(ops) ? ops : [ops];
    set((state) => ({
      history: pushOperations(state.history, operations, label)
    }));
  },
  
  undo: () => set((state) => ({ history: undo(state.history) })),
  redo: () => set((state) => ({ history: redo(state.history) })),
  
  selectScene: (id) => set({ selectedSceneId: id, selectedLayerIds: [] }),
  selectLayer: (id, additive = false) => set((state) => {
    if (additive) {
      const isSelected = state.selectedLayerIds.includes(id);
      return { 
        selectedLayerIds: isSelected 
          ? state.selectedLayerIds.filter(l => l !== id)
          : [...state.selectedLayerIds, id] 
      };
    }
    return { selectedLayerIds: [id] };
  }),
  clearSelection: () => set({ selectedLayerIds: [] }),
  
  setFrame: (frame) => set({ currentFrame: Math.max(0, frame) }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(zoom, 5)) }),
  
  init: (doc) => set({
    history: createHistory(doc),
    selectedSceneId: doc.scenes[0]?.id || null,
    selectedLayerIds: [],
    currentFrame: 0,
    isPlaying: false,
  })
}));

// Selectors for performance
export const useDocument = () => useEditorStore(state => state.history.document);
export const useCanUndo = () => useEditorStore(state => canUndo(state.history));
export const useCanRedo = () => useEditorStore(state => canRedo(state.history));
