// AUTO-GENERATED — do not edit manually
// Run: npm run supabase:types
// Project: vrnonxpxksaruvsvbplt

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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          code: string
          condition: Json
          created_at: string
          description: string
          icon: string
          id: string
          is_active: boolean
          name: string
          points: number
          updated_at: string
        }
        Insert: {
          code: string
          condition?: Json
          created_at?: string
          description: string
          icon: string
          id?: string
          is_active?: boolean
          name: string
          points?: number
          updated_at?: string
        }
        Update: {
          code?: string
          condition?: Json
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          points?: number
          updated_at?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          club_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          club_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          club_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          action_type: Database["public"]["Enums"]["challenge_action"]
          cadence: Database["public"]["Enums"]["challenge_cadence"]
          code: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          name: string
          reward_currency: number
          reward_xp: number
          target_count: number
          updated_at: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["challenge_action"]
          cadence: Database["public"]["Enums"]["challenge_cadence"]
          code: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          name: string
          reward_currency?: number
          reward_xp?: number
          target_count: number
          updated_at?: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["challenge_action"]
          cadence?: Database["public"]["Enums"]["challenge_cadence"]
          code?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          name?: string
          reward_currency?: number
          reward_xp?: number
          target_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      club_documents: {
        Row: {
          club_id: string
          created_at: string
          file_name: string
          file_path: string
          id: string
          kind: string
          mime_type: string
          size_bytes: number
          uploaded_by: string | null
        }
        Insert: {
          club_id: string
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          kind: string
          mime_type: string
          size_bytes: number
          uploaded_by?: string | null
        }
        Update: {
          club_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          kind?: string
          mime_type?: string
          size_bytes?: number
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_documents_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      club_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          club_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["staff_role"]
          status: string
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          club_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role: Database["public"]["Enums"]["staff_role"]
          status?: string
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          club_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          status?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_invitations_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_invitations_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      club_status_history: {
        Row: {
          actor_id: string | null
          club_id: string
          created_at: string
          from_status: Database["public"]["Enums"]["club_status"] | null
          id: string
          note: string | null
          to_status: Database["public"]["Enums"]["club_status"]
        }
        Insert: {
          actor_id?: string | null
          club_id: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["club_status"] | null
          id?: string
          note?: string | null
          to_status: Database["public"]["Enums"]["club_status"]
        }
        Update: {
          actor_id?: string | null
          club_id?: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["club_status"] | null
          id?: string
          note?: string | null
          to_status?: Database["public"]["Enums"]["club_status"]
        }
        Relationships: [
          {
            foreignKeyName: "club_status_history_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_status_history_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
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
          lat: number | null
          legal_name: string | null
          lng: number | null
          logo_url: string | null
          name: string
          phone: string | null
          settings: Json
          slug: string
          status: Database["public"]["Enums"]["club_status"]
          tax_id: string | null
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
          lat?: number | null
          legal_name?: string | null
          lng?: number | null
          logo_url?: string | null
          name: string
          phone?: string | null
          settings?: Json
          slug: string
          status?: Database["public"]["Enums"]["club_status"]
          tax_id?: string | null
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
          lat?: number | null
          legal_name?: string | null
          lng?: number | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          settings?: Json
          slug?: string
          status?: Database["public"]["Enums"]["club_status"]
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cosmetics: {
        Row: {
          code: string
          created_at: string
          description: string
          id: string
          image_url: string
          is_active: boolean
          name: string
          price_currency: number
          type: Database["public"]["Enums"]["cosmetic_type"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          id?: string
          image_url: string
          is_active?: boolean
          name: string
          price_currency: number
          type: Database["public"]["Enums"]["cosmetic_type"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
          price_currency?: number
          type?: Database["public"]["Enums"]["cosmetic_type"]
          updated_at?: string
        }
        Relationships: []
      }
      court_blocks: {
        Row: {
          club_id: string
          court_id: string
          created_at: string
          created_by: string | null
          end_time: string
          id: string
          reason: string | null
          start_time: string
        }
        Insert: {
          club_id: string
          court_id: string
          created_at?: string
          created_by?: string | null
          end_time: string
          id?: string
          reason?: string | null
          start_time: string
        }
        Update: {
          club_id?: string
          court_id?: string
          created_at?: string
          created_by?: string | null
          end_time?: string
          id?: string
          reason?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "court_blocks_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "court_blocks_court_fkey"
            columns: ["court_id", "club_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id", "club_id"]
          },
          {
            foreignKeyName: "court_blocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      court_price_rules: {
        Row: {
          court_id: string
          created_at: string
          days_of_week: number[]
          end_time: string
          id: string
          is_active: boolean
          name: string
          price_per_hour: number
          priority: number
          start_time: string
          updated_at: string
        }
        Insert: {
          court_id: string
          created_at?: string
          days_of_week: number[]
          end_time: string
          id?: string
          is_active?: boolean
          name: string
          price_per_hour: number
          priority?: number
          start_time: string
          updated_at?: string
        }
        Update: {
          court_id?: string
          created_at?: string
          days_of_week?: number[]
          end_time?: string
          id?: string
          is_active?: boolean
          name?: string
          price_per_hour?: number
          priority?: number
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "court_price_rules_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
        ]
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
      court_schedule_exceptions: {
        Row: {
          close_time: string | null
          closed: boolean
          club_id: string
          court_id: string | null
          created_at: string
          created_by: string | null
          date: string
          id: string
          open_time: string | null
          reason: string | null
          slot_minutes: number | null
        }
        Insert: {
          close_time?: string | null
          closed?: boolean
          club_id: string
          court_id?: string | null
          created_at?: string
          created_by?: string | null
          date: string
          id?: string
          open_time?: string | null
          reason?: string | null
          slot_minutes?: number | null
        }
        Update: {
          close_time?: string | null
          closed?: boolean
          club_id?: string
          court_id?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          open_time?: string | null
          reason?: string | null
          slot_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "court_schedule_exceptions_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "court_schedule_exceptions_court_fkey"
            columns: ["court_id", "club_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id", "club_id"]
          },
          {
            foreignKeyName: "court_schedule_exceptions_created_by_fkey"
            columns: ["created_by"]
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
      currency_purchases: {
        Row: {
          amount_ars: number
          created_at: string
          currency_amount: number
          id: string
          metadata: Json
          mp_event_id: string | null
          mp_payment_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_ars: number
          created_at?: string
          currency_amount: number
          id?: string
          metadata?: Json
          mp_event_id?: string | null
          mp_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_ars?: number
          created_at?: string
          currency_amount?: number
          id?: string
          metadata?: Json
          mp_event_id?: string | null
          mp_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "currency_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      email_log: {
        Row: {
          club_id: string | null
          created_at: string
          error: string | null
          id: string
          provider_id: string | null
          status: string
          template: string
          to_email: string
        }
        Insert: {
          club_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          provider_id?: string | null
          status: string
          template: string
          to_email: string
        }
        Update: {
          club_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          provider_id?: string | null
          status?: string
          template?: string
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_log_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
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
          pending_score_team1: Json | null
          pending_score_team2: Json | null
          reservation_id: string | null
          score_dispute_attempts: number
          score_status: Database["public"]["Enums"]["score_status"]
          score_submitted_by: string | null
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
          pending_score_team1?: Json | null
          pending_score_team2?: Json | null
          reservation_id?: string | null
          score_dispute_attempts?: number
          score_status?: Database["public"]["Enums"]["score_status"]
          score_submitted_by?: string | null
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
          pending_score_team1?: Json | null
          pending_score_team2?: Json | null
          reservation_id?: string | null
          score_dispute_attempts?: number
          score_status?: Database["public"]["Enums"]["score_status"]
          score_submitted_by?: string | null
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
            foreignKeyName: "matches_score_submitted_by_fkey"
            columns: ["score_submitted_by"]
            isOneToOne: false
            referencedRelation: "users"
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
      platform_staff: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          role: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["platform_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
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
      tournament_matches: {
        Row: {
          created_at: string
          id: string
          match_id: string | null
          round: number
          scheduled_at: string | null
          score_team1: number[] | null
          score_team2: number[] | null
          status: string
          team1_id: string | null
          team2_id: string | null
          tournament_id: string
          winner_team_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_id?: string | null
          round?: number
          scheduled_at?: string | null
          score_team1?: number[] | null
          score_team2?: number[] | null
          status?: string
          team1_id?: string | null
          team2_id?: string | null
          tournament_id: string
          winner_team_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string | null
          round?: number
          scheduled_at?: string | null
          score_team1?: number[] | null
          score_team2?: number[] | null
          status?: string
          team1_id?: string | null
          team2_id?: string | null
          tournament_id?: string
          winner_team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_matches_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_team1_id_fkey"
            columns: ["team1_id"]
            isOneToOne: false
            referencedRelation: "tournament_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_team2_id_fkey"
            columns: ["team2_id"]
            isOneToOne: false
            referencedRelation: "tournament_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_winner_team_id_fkey"
            columns: ["winner_team_id"]
            isOneToOne: false
            referencedRelation: "tournament_teams"
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
      user_challenges: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string
          id: string
          period_end: string
          period_start: string
          progress: number
          status: Database["public"]["Enums"]["user_challenge_status"]
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          progress?: number
          status?: Database["public"]["Enums"]["user_challenge_status"]
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          progress?: number
          status?: Database["public"]["Enums"]["user_challenge_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cosmetics: {
        Row: {
          acquired_at: string
          cosmetic_id: string
          id: string
          user_id: string
        }
        Insert: {
          acquired_at?: string
          cosmetic_id: string
          id?: string
          user_id: string
        }
        Update: {
          acquired_at?: string
          cosmetic_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_cosmetics_cosmetic_id_fkey"
            columns: ["cosmetic_id"]
            isOneToOne: false
            referencedRelation: "cosmetics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_cosmetics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          losses: number
          total_matches: number
          updated_at: string
          user_id: string
          wins: number
        }
        Insert: {
          losses?: number
          total_matches?: number
          updated_at?: string
          user_id: string
          wins?: number
        }
        Update: {
          losses?: number
          total_matches?: number
          updated_at?: string
          user_id?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
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
          equipped_avatar_cosmetic_id: string | null
          equipped_emblem_cosmetic_id: string | null
          equipped_palette_cosmetic_id: string | null
          fcm_token: string | null
          first_name: string
          full_name: string | null
          id: string
          is_active: boolean
          last_name: string
          level: number
          onboarding_completed_at: string | null
          phone: string | null
          points_balance: number
          preferred_hand: Database["public"]["Enums"]["preferred_hand"] | null
          role: Database["public"]["Enums"]["user_role"]
          skill_level: Database["public"]["Enums"]["skill_level"] | null
          updated_at: string
          username: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          elo?: number
          equipped_avatar_cosmetic_id?: string | null
          equipped_emblem_cosmetic_id?: string | null
          equipped_palette_cosmetic_id?: string | null
          fcm_token?: string | null
          first_name: string
          full_name?: string | null
          id: string
          is_active?: boolean
          last_name: string
          level?: number
          onboarding_completed_at?: string | null
          phone?: string | null
          points_balance?: number
          preferred_hand?: Database["public"]["Enums"]["preferred_hand"] | null
          role?: Database["public"]["Enums"]["user_role"]
          skill_level?: Database["public"]["Enums"]["skill_level"] | null
          updated_at?: string
          username: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          elo?: number
          equipped_avatar_cosmetic_id?: string | null
          equipped_emblem_cosmetic_id?: string | null
          equipped_palette_cosmetic_id?: string | null
          fcm_token?: string | null
          first_name?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string
          level?: number
          onboarding_completed_at?: string | null
          phone?: string | null
          points_balance?: number
          preferred_hand?: Database["public"]["Enums"]["preferred_hand"] | null
          role?: Database["public"]["Enums"]["user_role"]
          skill_level?: Database["public"]["Enums"]["skill_level"] | null
          updated_at?: string
          username?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "users_equipped_avatar_fkey"
            columns: ["equipped_avatar_cosmetic_id"]
            isOneToOne: false
            referencedRelation: "cosmetics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_equipped_emblem_fkey"
            columns: ["equipped_emblem_cosmetic_id"]
            isOneToOne: false
            referencedRelation: "cosmetics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_equipped_palette_fkey"
            columns: ["equipped_palette_cosmetic_id"]
            isOneToOne: false
            referencedRelation: "cosmetics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_club_invitation: {
        Args: { p_invitation_id: string; p_user_id: string }
        Returns: {
          already_member: boolean
          club_id: string
          role: Database["public"]["Enums"]["staff_role"]
        }[]
      }
      accept_match_score: {
        Args: {
          p_apply_elo: boolean
          p_match_id: string
          p_winner_team: number
        }
        Returns: {
          club_id: string | null
          created_at: string
          created_by: string
          id: string
          is_ranked: boolean
          lobby_url: string | null
          pending_score_team1: Json | null
          pending_score_team2: Json | null
          reservation_id: string | null
          score_dispute_attempts: number
          score_status: Database["public"]["Enums"]["score_status"]
          score_submitted_by: string | null
          score_team1: number[] | null
          score_team2: number[] | null
          status: Database["public"]["Enums"]["match_status"]
          tournament_id: string | null
          type: Database["public"]["Enums"]["match_type"]
          updated_at: string
          winner_team: number | null
        }
        SetofOptions: {
          from: "*"
          to: "matches"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      assign_and_expire_challenges: { Args: never; Returns: undefined }
      award_match_xp: {
        Args: { p_match_id: string; p_winner_team: number }
        Returns: undefined
      }
      create_court_blocks: {
        Args: {
          p_club_id: string
          p_court_ids: string[]
          p_created_by: string
          p_end: string
          p_reason: string
          p_start: string
        }
        Returns: Json
      }
      credit_currency: {
        Args: { p_amount: number; p_reason: string; p_user_id: string }
        Returns: undefined
      }
      increment_challenge_progress: {
        Args: {
          p_action: Database["public"]["Enums"]["challenge_action"]
          p_amount?: number
          p_user_id: string
        }
        Returns: undefined
      }
      is_club_member: { Args: { p_club_id: string }; Returns: boolean }
      is_court_club_member: { Args: { p_court_id: string }; Returns: boolean }
      is_match_club_member: { Args: { p_match_id: string }; Returns: boolean }
      is_platform_staff: { Args: never; Returns: boolean }
      is_platform_superadmin: { Args: never; Returns: boolean }
      level_for_xp: { Args: { p_xp: number }; Returns: number }
      purchase_cosmetic: {
        Args: { p_cosmetic_id: string; p_user_id: string }
        Returns: {
          acquired_at: string
          cosmetic_id: string
          id: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_cosmetics"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      replace_court_price_rules: {
        Args: { p_court_id: string; p_rows: Json }
        Returns: undefined
      }
      replace_court_schedule: {
        Args: { p_court_id: string; p_rows: Json }
        Returns: undefined
      }
      submit_match_score_draft: {
        Args: { p_draft: Json; p_match_id: string; p_team: number }
        Returns: {
          club_id: string | null
          created_at: string
          created_by: string
          id: string
          is_ranked: boolean
          lobby_url: string | null
          pending_score_team1: Json | null
          pending_score_team2: Json | null
          reservation_id: string | null
          score_dispute_attempts: number
          score_status: Database["public"]["Enums"]["score_status"]
          score_submitted_by: string | null
          score_team1: number[] | null
          score_team2: number[] | null
          status: Database["public"]["Enums"]["match_status"]
          tournament_id: string | null
          type: Database["public"]["Enums"]["match_type"]
          updated_at: string
          winner_team: number | null
        }
        SetofOptions: {
          from: "*"
          to: "matches"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      challenge_action: "play_matches" | "win_matches"
      challenge_cadence: "daily" | "weekly" | "monthly" | "one_time"
      club_status:
        | "draft"
        | "pending"
        | "changes_requested"
        | "approved"
        | "rejected"
        | "suspended"
      cosmetic_type: "palette_skin" | "avatar" | "emblem"
      court_surface: "indoor" | "outdoor" | "panoramic"
      match_status: "waiting" | "in_progress" | "completed" | "cancelled"
      match_type: "friendly" | "ranked" | "tournament"
      notification_type:
        | "match_invite"
        | "score_submitted"
        | "tournament_update"
        | "reservation_reminder"
        | "system"
        | "match_started"
        | "match_cancelled"
        | "score_accepted"
        | "reservation_confirmed"
        | "reservation_cancelled"
      payment_status:
        | "pending"
        | "approved"
        | "rejected"
        | "cancelled"
        | "refunded"
      platform_role: "superadmin" | "reviewer"
      preferred_hand: "drive" | "backhand"
      reservation_status: "pending" | "confirmed" | "cancelled" | "completed"
      score_status: "pending" | "accepted" | "disputed"
      skill_level: "beginner" | "intermediate" | "advanced"
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
      user_challenge_status: "active" | "completed" | "expired"
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
      challenge_action: ["play_matches", "win_matches"],
      challenge_cadence: ["daily", "weekly", "monthly", "one_time"],
      club_status: [
        "draft",
        "pending",
        "changes_requested",
        "approved",
        "rejected",
        "suspended",
      ],
      cosmetic_type: ["palette_skin", "avatar", "emblem"],
      court_surface: ["indoor", "outdoor", "panoramic"],
      match_status: ["waiting", "in_progress", "completed", "cancelled"],
      match_type: ["friendly", "ranked", "tournament"],
      notification_type: [
        "match_invite",
        "score_submitted",
        "tournament_update",
        "reservation_reminder",
        "system",
        "match_started",
        "match_cancelled",
        "score_accepted",
        "reservation_confirmed",
        "reservation_cancelled",
      ],
      payment_status: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "refunded",
      ],
      platform_role: ["superadmin", "reviewer"],
      preferred_hand: ["drive", "backhand"],
      reservation_status: ["pending", "confirmed", "cancelled", "completed"],
      score_status: ["pending", "accepted", "disputed"],
      skill_level: ["beginner", "intermediate", "advanced"],
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
      user_challenge_status: ["active", "completed", "expired"],
      user_role: ["player", "club_staff", "super_admin"],
    },
  },
} as const
