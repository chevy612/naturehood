import { create } from 'zustand';
import type { AiFoodAnalysis, MealType } from '../lib/types/meal';

// ── AI Usage Slice ──────────────────────────────────────────────────────────

type AiUsageState = {
  aiUsedCount: number;
  aiUsageUpdatedAt: string | null;
};

type AiUsageActions = {
  /** Set AI usage from Supabase on app mount */
  setAiUsage: (count: number, updatedAt: string | null) => void;
  /** Increment after a successful AI call */
  incrementAiUsage: () => void;
};

export const AI_LIMIT = 8;

export const useAiUsageStore = create<AiUsageState & AiUsageActions>((set) => ({
  aiUsedCount: 0,
  aiUsageUpdatedAt: null,

  setAiUsage: (count, updatedAt) => set({ aiUsedCount: count, aiUsageUpdatedAt: updatedAt }),

  incrementAiUsage: () =>
    set((s) => ({
      aiUsedCount: s.aiUsedCount + 1,
      aiUsageUpdatedAt: new Date().toISOString(),
    })),
}));

// ── Meal Draft Slice ────────────────────────────────────────────────────────

type MealDraftState = {
  // Image
  imageUri: string | null;

  // Form fields (strings for TextInput; parsed to numbers on save)
  title: string;
  calories: string;
  protein: string;
  mealType: MealType | null;
  mealNotes: string;

  // AI result (set after successful analysis)
  aiResult: AiFoodAnalysis | null;

  // Record tracking
  currentMealId: string | null;
  currentS3Link: string | null;

  // Loading flags
  savingRecord: boolean;
  analyzingAI: boolean;
  savingSummary: boolean;
};

type MealDraftActions = {
  /** Store the captured image URI */
  setImage: (uri: string) => void;

  /** Generic setter for any text form field */
  setField: (key: 'title' | 'calories' | 'protein' | 'mealNotes', value: string) => void;

  /** Set the meal type */
  setMealType: (type: MealType | null) => void;

  /** Store the parsed AI analysis result */
  setAiResult: (result: AiFoodAnalysis) => void;

  /** Store the created record id + storage URL after initial save */
  setRecordInfo: (mealId: string, s3Link: string) => void;

  /** Toggle a specific loading state */
  setLoading: (key: 'savingRecord' | 'analyzingAI' | 'savingSummary', value: boolean) => void;

  /** Reset the entire draft (call when navigating back to history) */
  reset: () => void;
};

// ── Initial / default values ─────────────────────────────────────────────────

const initialState: MealDraftState = {
  imageUri: null,
  title: '',
  calories: '',
  protein: '',
  mealType: null,
  mealNotes: '',
  aiResult: null,
  currentMealId: null,
  currentS3Link: null,
  savingRecord: false,
  analyzingAI: false,
  savingSummary: false,
};

// ── Store ────────────────────────────────────────────────────────────────────

export const useMealStore = create<MealDraftState & MealDraftActions>((set) => ({
  ...initialState,

  setImage: (uri) => set({ imageUri: uri }),

  setField: (key, value) => set({ [key]: value }),

  setMealType: (type) => set({ mealType: type }),

  setAiResult: (result) => set({ aiResult: result }),

  setRecordInfo: (mealId, s3Link) => set({ currentMealId: mealId, currentS3Link: s3Link }),

  setLoading: (key, value) => set({ [key]: value }),

  reset: () => set(initialState),
}));
