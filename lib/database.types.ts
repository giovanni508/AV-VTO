/**
 * Tipi del database, allineati allo schema SQL in supabase/migrations.
 * In futuro si possono rigenerare con:
 *   supabase gen types typescript --project-id <id> > lib/database.types.ts
 */
export type GarmentType = "mannequin" | "flat_lay" | "model";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          credits_balance: number;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          credits_balance?: number;
          created_at?: string;
        };
        Update: {
          email?: string | null;
        };
        Relationships: [];
      };
      ai_models: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;
          name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_url: string;
          name?: string | null;
          created_at?: string;
        };
        Update: {
          image_url?: string;
          name?: string | null;
        };
        Relationships: [];
      };
      generations: {
        Row: {
          id: string;
          user_id: string;
          original_garment_url: string;
          garment_type: GarmentType;
          generated_image_url: string | null;
          cost_in_credits: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          original_garment_url: string;
          garment_type: GarmentType;
          generated_image_url?: string | null;
          cost_in_credits?: number;
          created_at?: string;
        };
        Update: {
          generated_image_url?: string | null;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          stripe_payment_id: string | null;
          credits_added: number;
          amount_eur: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_payment_id?: string | null;
          credits_added: number;
          amount_eur: number;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      videos: {
        Row: {
          id: string;
          user_id: string;
          source_image_url: string | null;
          video_url: string | null;
          prompt: string | null;
          camera_move: string | null;
          duration: number;
          resolution: string;
          cost_in_credits: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_image_url?: string | null;
          video_url?: string | null;
          prompt?: string | null;
          camera_move?: string | null;
          duration?: number;
          resolution?: string;
          cost_in_credits?: number;
          created_at?: string;
        };
        Update: {
          video_url?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      consume_credits_for_generation: {
        Args: {
          p_original_garment_url: string;
          p_garment_type: GarmentType;
          p_cost: number;
        };
        Returns: Database["public"]["Tables"]["generations"]["Row"];
      };
      consume_credits: {
        Args: { p_cost: number };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
  };
};
