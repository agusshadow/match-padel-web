// AUTO-GENERATED — do not edit manually
// Run: pnpm supabase:types
// Project: ebdnlrwzhthqflsbdzvu

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          code: string
          condition: Json
          description: string
          icon: string
          id: string
          name: string
          points: number
        }
        Insert: {
          code: string
          condition?: Json
          description: string
          icon: string
          id?: string
          name: string
          points?: number
        }
        Update: {
          code?: string
          condition?: Json
          description?: string
          icon?: string
          id?: string
          name?: string
          points?: number
        }
        Relationships: []
      }
      club_staff: {
        Row: {
          club_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["staff_role"]
          user_id: string
        }
        Insert: {
          club_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["staff_role"]
          user_id: string
        }
        Update: {
          club_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["staff_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_staff_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          address: string
          city: string
          cover_url: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          phone: string | null
          settings: Json
          slug: string
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          phone?: string | null
          settings?: Json
          slug: string
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          phone?: string | null
          settings?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      court_reservations: {
        Row: {
          club_id: string
          court_id: string
          created_at: string
          end_time: string
          id: string
          notes: string | null
          start_time: string
          status: Database["public"]["Enums"]["reservation_status"]
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          club_id: string
          court_id: string
          created_at?: string
          end_time: string
          id?: string
          notes?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["reservation_status"]
          total_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          club_id?: string
          court_id?: string
          created_at?: string
          end_time?: string
          id?: string
          notes?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "court_reservations_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "court_reservations_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "court_reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      court_schedules: {
        Row: {
          close_time: string
          court_id: string
          day_of_week: number
          id: string
          is_active: boolean
          open_time: string
          slot_minutes: number
        }
        Insert: {
          close_time: string
          court_id: string
          day_of_week: number
          id?: string
          is_active?: boolean
          open_time: string
          slot_minutes?: number
        }
        Update: {
          close_time?: string
          court_id?: string
          day_of_week?: number
          id?: string
          is_active?: boolean
          open_time?: string
          slot_minutes?: number
        }
        Relationships: [
          {
            foreignKeyName: "court_schedules_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
        ]
      }
      courts: {
        Row: {
          club_id: string
          created_at: string
          id: string
          is_active: boolean
          is_indoor: boolean
          name: string
          price_per_hour: number
          surface: Database["public"]["Enums"]["court_surface"]
          updated_at: string
        }
        Insert: {
          club_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_indoor?: boolean
          name: string
          price_per_hour: number
          surface?: Database["public"]["Enums"]["court_surface"]
          updated_at?: string
        }
        Update: {
          club_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_indoor?: boolean
          name?: string
          price_per_hour?: number
          surface?: Database["public"]["Enums"]["court_surface"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courts_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      elo_history: {
        Row: {
          created_at: string
          delta: number
          elo_after: number
          elo_before: number
          id: string
          match_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          elo_after: number
          elo_before: number
          id?: string
          match_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          elo_after?: number
          elo_before?: number
          id?: string
          match_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "elo_history_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elo_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      match_chats: {
        Row: {
          created_at: string
          id: string
          match_id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_chats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      match_players: {
        Row: {
          id: string
          joined_at: string
          match_id: string
          team: number
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          match_id: string
          team: number
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          match_id?: string
          team?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_players_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_players_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          club_id: string | null
          created_at: string
          created_by: string
          id: string
          is_ranked: boolean
          lobby_url: string | null
          reservation_id: string | null
          score_status: Database["public"]["Enums"]["score_status"]
          score_team1: number[] | null
          score_team2: number[] | null
          status: Database["public"]["Enums"]["match_status"]
          tournament_id: string | null
          type: Database["public"]["Enums"]["match_type"]
          updated_at: string
          winner_team: number | null
        }
        Insert: {
          club_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          is_ranked?: boolean
          lobby_url?: string | null
          reservation_id?: string | null
          score_status?: Database["public"]["Enums"]["score_status"]
          score_team1?: number[] | null
          score_team2?: number[] | null
          status?: Database["public"]["Enums"]["match_status"]
          tournament_id?: string | null
          type?: Database["public"]["Enums"]["match_type"]
          updated_at?: string
          winner_team?: number | null
        }
        Update: {
          club_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_ranked?: boolean
          lobby_url?: string | null
          reservation_id?: string | null
          score_status?: Database["public"]["Enums"]["score_status"]
          score_team1?: number[] | null
          score_team2?: number[] | null
          status?: Database["public"]["Enums"]["match_status"]
          tournament_id?: string | null
          type?: Database["public"]["Enums"]["match_type"]
          updated_at?: string
          winner_team?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "court_reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          data: Json
          id: string
          is_read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json
          id?: string
          is_read?: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json
          id?: string
          is_read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          metadata: Json
          mp_event_id: string | null
          mp_payment_id: string | null
          reservation_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          mp_event_id?: string | null
          mp_payment_id?: string | null
          reservation_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          mp_event_id?: string | null
          mp_payment_id?: string | null
          reservation_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "court_reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      points_transactions: {
        Row: {
          created_at: string
          delta: number
          id: string
          metadata: Json
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          metadata?: Json
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          metadata?: Json
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_teams: {
        Row: {
          id: string
          name: string
          player1_id: string
          player2_id: string
          registered_at: string
          seed: number | null
          tournament_id: string
        }
        Insert: {
          id?: string
          name: string
          player1_id: string
          player2_id: string
          registered_at?: string
          seed?: number | null
          tournament_id: string
        }
        Update: {
          id?: string
          name?: string
          player1_id?: string
          player2_id?: string
          registered_at?: string
          seed?: number | null
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_teams_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_teams_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_teams_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          bracket: Json
          club_id: string
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          entry_fee: number
          format: Database["public"]["Enums"]["tournament_format"]
          id: string
          max_teams: number
          name: string
          prize_pool: number
          rules: Json
          start_date: string
          status: Database["public"]["Enums"]["tournament_status"]
          updated_at: string
        }
        Insert: {
          bracket?: Json
          club_id: string
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          entry_fee?: number
          format?: Database["public"]["Enums"]["tournament_format"]
          id?: string
          max_teams?: number
          name: string
          prize_pool?: number
          rules?: Json
          start_date: string
          status?: Database["public"]["Enums"]["tournament_status"]
          updated_at?: string
        }
        Update: {
          bracket?: Json
          club_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          entry_fee?: number
          format?: Database["public"]["Enums"]["tournament_format"]
          id?: string
          max_teams?: number
          name?: string
          prize_pool?: number
          rules?: Json
          start_date?: string
          status?: Database["public"]["Enums"]["tournament_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournaments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          elo: number
          fcm_token: string | null
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          elo?: number
          fcm_token?: string | null
          full_name: string
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          elo?: number
          fcm_token?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      court_surface: "indoor" | "outdoor" | "panoramic"
      match_status: "waiting" | "in_progress" | "completed" | "cancelled"
      match_type: "friendly" | "ranked" | "tournament"
      notification_type:
        | "match_invite"
        | "score_submitted"
        | "tournament_update"
        | "reservation_reminder"
        | "system"
      payment_status:
        | "pending"
        | "approved"
        | "rejected"
        | "cancelled"
        | "refunded"
      reservation_status: "pending" | "confirmed" | "cancelled" | "completed"
      score_status: "pending" | "accepted" | "disputed"
      staff_role: "owner" | "admin" | "staff"
      tournament_format:
        | "round_robin"
        | "single_elimination"
        | "double_elimination"
        | "americano"
      tournament_status:
        | "draft"
        | "open"
        | "in_progress"
        | "completed"
        | "cancelled"
      user_role: "player" | "club_staff" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      court_surface: ["indoor", "outdoor", "panoramic"],
      match_status: ["waiting", "in_progress", "completed", "cancelled"],
      match_type: ["friendly", "ranked", "tournament"],
      notification_type: [
        "match_invite",
        "score_submitted",
        "tournament_update",
        "reservation_reminder",
        "system",
      ],
      payment_status: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "refunded",
      ],
      reservation_status: ["pending", "confirmed", "cancelled", "completed"],
      score_status: ["pending", "accepted", "disputed"],
      staff_role: ["owner", "admin", "staff"],
      tournament_format: [
        "round_robin",
        "single_elimination",
        "double_elimination",
        "americano",
      ],
      tournament_status: [
        "draft",
        "open",
        "in_progress",
        "completed",
        "cancelled",
      ],
      user_role: ["player", "club_staff", "super_admin"],
    },
  },
} as const
