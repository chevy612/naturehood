import { create } from 'zustand';
import type { AiFoodAnalysis } from '../lib/types/meal';

// ── State shape ──────────────────────────────────────────────────────────────

type MealDraftState = {
  // Image
  imageUri: string | null;

  // Form fields
  title: string;
  calories: string; // kept as string for TextInput; parsed to number on save
  weightG: string;  // optional context for AI
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
  setField: (key: 'title' | 'calories' | 'weightG' | 'mealNotes', value: string) => void;

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
  weightG: '',
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

  setAiResult: (result) => set({ aiResult: result }),

  setRecordInfo: (mealId, s3Link) => set({ currentMealId: mealId, currentS3Link: s3Link }),

  setLoading: (key, value) => set({ [key]: value }),

  reset: () => set(initialState),
}));
