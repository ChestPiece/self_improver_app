"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface UseSupabaseRealtimeProps {
  table: string;
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  enabled?: boolean;
}

export function useSupabaseRealtime({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseSupabaseRealtimeProps) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!enabled) return;

    // Create a unique channel name
    const channelName = `${table}-${filter || "all"}-${Date.now()}`;

    // Create the channel
    const channel = supabase.channel(channelName);

    // Set up table listener with optional filter
    let tableListener = channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: table,
        ...(filter && { filter }),
      },
      (payload) => {
        switch (payload.eventType) {
          case "INSERT":
            onInsert?.(payload);
            break;
          case "UPDATE":
            onUpdate?.(payload);
            break;
          case "DELETE":
            onDelete?.(payload);
            break;
        }
      }
    );

    // Subscribe to the channel
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED" && process.env.NODE_ENV === "development") {
        console.log(`🔴 Subscribed to ${table} realtime updates`);
      }
    });

    channelRef.current = channel;

    // Cleanup function
    return () => {
      if (channelRef.current) {
        if (process.env.NODE_ENV === "development") {
          console.log(`🔴 Unsubscribing from ${table} realtime updates`);
        }
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [table, filter, enabled, onInsert, onUpdate, onDelete]);

  return {
    isConnected: channelRef.current?.state === "joined",
    disconnect: () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    },
  };
}

// Hook for goals real-time updates
export function useGoalsRealtime(userId: string, onUpdate?: () => void) {
  return useSupabaseRealtime({
    table: "goals",
    filter: `user_id=eq.${userId}`,
    onInsert: () => onUpdate?.(),
    onUpdate: () => onUpdate?.(),
    onDelete: () => onUpdate?.(),
  });
}

// Hook for habits real-time updates
export function useHabitsRealtime(userId: string, onUpdate?: () => void) {
  return useSupabaseRealtime({
    table: "habits",
    filter: `user_id=eq.${userId}`,
    onInsert: () => onUpdate?.(),
    onUpdate: () => onUpdate?.(),
    onDelete: () => onUpdate?.(),
  });
}

// Hook for habit logs real-time updates
export function useHabitLogsRealtime(onUpdate?: () => void) {
  return useSupabaseRealtime({
    table: "habit_logs",
    onInsert: () => onUpdate?.(),
    onUpdate: () => onUpdate?.(),
    onDelete: () => onUpdate?.(),
  });
}

// Hook for practice sessions real-time updates
export function usePracticeSessionsRealtime(
  userId: string,
  onUpdate?: () => void
) {
  return useSupabaseRealtime({
    table: "practice_sessions",
    filter: `user_id=eq.${userId}`,
    onInsert: () => onUpdate?.(),
    onUpdate: () => onUpdate?.(),
    onDelete: () => onUpdate?.(),
  });
}

// Hook for notifications real-time updates
export function useNotificationsRealtime(
  userId: string,
  onNewNotification?: (notification: any) => void
) {
  return useSupabaseRealtime({
    table: "notifications",
    filter: `user_id=eq.${userId}`,
    onInsert: (payload) => {
      onNewNotification?.(payload.new);
    },
    onUpdate: () => {}, // Handle notification read status updates
  });
}
