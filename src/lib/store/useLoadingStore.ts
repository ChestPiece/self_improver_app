"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface LoadingState {
  // Global loading states
  isAppLoading: boolean;
  isAuthLoading: boolean;

  // Feature-specific loading states
  goals: {
    creating: boolean;
    updating: boolean;
    deleting: boolean;
    fetching: boolean;
  };

  habits: {
    creating: boolean;
    updating: boolean;
    deleting: boolean;
    fetching: boolean;
    logging: boolean;
  };

  practices: {
    creating: boolean;
    updating: boolean;
    deleting: boolean;
    fetching: boolean;
    sessionActive: boolean;
  };

  settings: {
    saving: boolean;
    exporting: boolean;
    deleting: boolean;
    fetching: boolean;
  };

  profile: {
    updating: boolean;
    fetching: boolean;
  };

  // Actions
  setAppLoading: (loading: boolean) => void;
  setAuthLoading: (loading: boolean) => void;

  setGoalLoading: (
    action: keyof LoadingState["goals"],
    loading: boolean
  ) => void;
  setHabitLoading: (
    action: keyof LoadingState["habits"],
    loading: boolean
  ) => void;
  setPracticeLoading: (
    action: keyof LoadingState["practices"],
    loading: boolean
  ) => void;
  setSettingsLoading: (
    action: keyof LoadingState["settings"],
    loading: boolean
  ) => void;
  setProfileLoading: (
    action: keyof LoadingState["profile"],
    loading: boolean
  ) => void;

  // Utility functions
  isAnyLoading: () => boolean;
  resetAllLoading: () => void;
}

const initialLoadingState = {
  goals: {
    creating: false,
    updating: false,
    deleting: false,
    fetching: false,
  },
  habits: {
    creating: false,
    updating: false,
    deleting: false,
    fetching: false,
    logging: false,
  },
  practices: {
    creating: false,
    updating: false,
    deleting: false,
    fetching: false,
    sessionActive: false,
  },
  settings: {
    saving: false,
    exporting: false,
    deleting: false,
    fetching: false,
  },
  profile: {
    updating: false,
    fetching: false,
  },
};

export const useLoadingStore = create<LoadingState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isAppLoading: false,
      isAuthLoading: false,
      ...initialLoadingState,

      // Global actions
      setAppLoading: (loading: boolean) =>
        set({ isAppLoading: loading }, false, "setAppLoading"),

      setAuthLoading: (loading: boolean) =>
        set({ isAuthLoading: loading }, false, "setAuthLoading"),

      // Feature-specific actions
      setGoalLoading: (action, loading) =>
        set(
          (state) => ({
            goals: { ...state.goals, [action]: loading },
          }),
          false,
          `setGoalLoading:${action}`
        ),

      setHabitLoading: (action, loading) =>
        set(
          (state) => ({
            habits: { ...state.habits, [action]: loading },
          }),
          false,
          `setHabitLoading:${action}`
        ),

      setPracticeLoading: (action, loading) =>
        set(
          (state) => ({
            practices: { ...state.practices, [action]: loading },
          }),
          false,
          `setPracticeLoading:${action}`
        ),

      setSettingsLoading: (action, loading) =>
        set(
          (state) => ({
            settings: { ...state.settings, [action]: loading },
          }),
          false,
          `setSettingsLoading:${action}`
        ),

      setProfileLoading: (action, loading) =>
        set(
          (state) => ({
            profile: { ...state.profile, [action]: loading },
          }),
          false,
          `setProfileLoading:${action}`
        ),

      // Utility functions
      isAnyLoading: () => {
        const state = get();
        return (
          state.isAppLoading ||
          state.isAuthLoading ||
          Object.values(state.goals).some(Boolean) ||
          Object.values(state.habits).some(Boolean) ||
          Object.values(state.practices).some(Boolean) ||
          Object.values(state.settings).some(Boolean) ||
          Object.values(state.profile).some(Boolean)
        );
      },

      resetAllLoading: () =>
        set(
          {
            isAppLoading: false,
            isAuthLoading: false,
            ...initialLoadingState,
          },
          false,
          "resetAllLoading"
        ),
    }),
    {
      name: "loading-store",
    }
  )
);

// Custom hooks for specific features
export const useGoalLoading = () => {
  const goals = useLoadingStore((state) => state.goals);
  const setGoalLoading = useLoadingStore((state) => state.setGoalLoading);
  return { ...goals, setLoading: setGoalLoading };
};

export const useHabitLoading = () => {
  const habits = useLoadingStore((state) => state.habits);
  const setHabitLoading = useLoadingStore((state) => state.setHabitLoading);
  return { ...habits, setLoading: setHabitLoading };
};

export const usePracticeLoading = () => {
  const practices = useLoadingStore((state) => state.practices);
  const setPracticeLoading = useLoadingStore(
    (state) => state.setPracticeLoading
  );
  return { ...practices, setLoading: setPracticeLoading };
};

export const useSettingsLoading = () => {
  const settings = useLoadingStore((state) => state.settings);
  const setSettingsLoading = useLoadingStore(
    (state) => state.setSettingsLoading
  );
  return { ...settings, setLoading: setSettingsLoading };
};

export const useProfileLoading = () => {
  const profile = useLoadingStore((state) => state.profile);
  const setProfileLoading = useLoadingStore((state) => state.setProfileLoading);
  return { ...profile, setLoading: setProfileLoading };
};

// Hook for overall app loading state
export const useAppLoading = () => {
  const isAppLoading = useLoadingStore((state) => state.isAppLoading);
  const isAuthLoading = useLoadingStore((state) => state.isAuthLoading);
  const isAnyLoading = useLoadingStore((state) => state.isAnyLoading);
  const setAppLoading = useLoadingStore((state) => state.setAppLoading);
  const setAuthLoading = useLoadingStore((state) => state.setAuthLoading);
  const resetAllLoading = useLoadingStore((state) => state.resetAllLoading);

  return {
    isAppLoading,
    isAuthLoading,
    isAnyLoading: isAnyLoading(),
    setAppLoading,
    setAuthLoading,
    resetAllLoading,
  };
};
