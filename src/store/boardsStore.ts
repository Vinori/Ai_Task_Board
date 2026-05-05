import { create } from "zustand";
import {
  createBoard as apiCreateBoard,
  deleteBoard as apiDeleteBoard,
  fetchBoards as apiFetchBoards,
  type BoardRow,
} from "@/api/boards";

type BoardsState = {
  boards: BoardRow[];
  loading: boolean;
  error: string | null;
  activeBoardId: string | null;
  fetchBoards: () => Promise<void>;
  addBoard: (title: string) => Promise<boolean>;
  deleteBoard: (id: string) => Promise<boolean>;
  setActiveBoardId: (id: string | null) => void;
  reset: () => void;
  clearError: () => void;
};

export const useBoardsStore = create<BoardsState>((set, get) => ({
  boards: [],
  loading: false,
  error: null,
  activeBoardId: null,

  clearError: () => set({ error: null }),

  reset: () =>
    set({ boards: [], loading: false, error: null, activeBoardId: null }),

  setActiveBoardId: (activeBoardId) => set({ activeBoardId }),

  fetchBoards: async () => {
    set({ loading: true, error: null });
    const { data, error } = await apiFetchBoards();
    if (error) {
      set({ loading: false, error: error.message, boards: [] });
      return;
    }
    const boards = data ?? [];
    const current = get().activeBoardId;
    const stillValid = current && boards.some((b) => b.id === current);
    const nextActive =
      stillValid ? current : boards[0]?.id ?? null;
    set({
      boards,
      loading: false,
      error: null,
      activeBoardId: nextActive,
    });
  },

  addBoard: async (title) => {
    set({ error: null });
    const { data, error } = await apiCreateBoard(title);
    if (error || !data) {
      set({ error: error?.message ?? "Failed to create board" });
      return false;
    }
    set((s) => ({
      boards: [...s.boards, data],
      activeBoardId: data.id,
      error: null,
    }));
    return true;
  },

  deleteBoard: async (id) => {
    set({ error: null });
    const { success, error } = await apiDeleteBoard(id);
    if (!success) {
      set({ error: error?.message ?? "Failed to delete board" });
      return false;
    }
    const remaining = get().boards.filter((b) => b.id !== id);
    const current = get().activeBoardId;
    const nextActive =
      current === id ? (remaining[0]?.id ?? null) : current;
    set({ boards: remaining, activeBoardId: nextActive, error: null });
    return true;
  },
}));

export type { BoardRow } from "@/api/boards";
