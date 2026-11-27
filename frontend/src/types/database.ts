// DBの型（Supabaseの自動生成と同じ形）
//
// ※ 2026-11-20時点：ローカル環境（T02）が未整備のため、
//   `supabase gen types typescript --local` の出力と同じ形で手書きしています。
//   環境ができたら、次のコマンドで生成し直して置き換えます（手で編集しないでください）。
//   supabase gen types typescript --local > frontend/src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          created_by: string | null
          created_at: string
          expires_at: string
          photo_count: number
          total_bytes: number
        }
        Insert: {
          id?: string
          created_by?: string | null
          created_at?: string
          expires_at?: string
          photo_count?: number
          total_bytes?: number
        }
        Update: {
          id?: string
          created_by?: string | null
          created_at?: string
          expires_at?: string
          photo_count?: number
          total_bytes?: number
        }
        Relationships: []
      }
      room_members: {
        Row: {
          room_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          room_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          room_id?: string
          user_id?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'room_members_room_id_fkey'
            columns: ['room_id']
            isOneToOne: false
            referencedRelation: 'rooms'
            referencedColumns: ['id']
          },
        ]
      }
      photos: {
        Row: {
          id: string
          room_id: string
          uploader_id: string | null
          storage_path: string
          thumbnail_path: string | null
          mime_type: string
          size_bytes: number
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          uploader_id?: string | null
          storage_path: string
          thumbnail_path?: string | null
          mime_type: string
          size_bytes: number
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          uploader_id?: string | null
          storage_path?: string
          thumbnail_path?: string | null
          mime_type?: string
          size_bytes?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'photos_room_id_fkey'
            columns: ['room_id']
            isOneToOne: false
            referencedRelation: 'rooms'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update']
