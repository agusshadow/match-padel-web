// AUTO-GENERADO — no editar manualmente
// Ejecutar: pnpm supabase:types
// Comando: supabase gen types typescript --project-id <ID> > packages/types/src/supabase.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      // Se poblará al correr supabase gen types
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
