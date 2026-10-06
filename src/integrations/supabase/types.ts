export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      add_ons: {
        Row: {
          created_at: string;
          description: string;
          event_category_ids: string[];
          id: string;
          is_active: boolean;
          name: string;
          package_ids: string[];
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          event_category_ids?: string[];
          id?: string;
          is_active?: boolean;
          name: string;
          package_ids?: string[];
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          event_category_ids?: string[];
          id?: string;
          is_active?: boolean;
          name?: string;
          package_ids?: string[];
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      customer_addresses: {
        Row: {
          address: string;
          area: string;
          city: string;
          created_at: string;
          id: string;
          is_default: boolean;
          label: string;
          landmark: string;
          pincode: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          address?: string;
          area?: string;
          city?: string;
          created_at?: string;
          id?: string;
          is_default?: boolean;
          label?: string;
          landmark?: string;
          pincode?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          address?: string;
          area?: string;
          city?: string;
          created_at?: string;
          id?: string;
          is_default?: boolean;
          label?: string;
          landmark?: string;
          pincode?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      customer_drafts: {
        Row: {
          plan: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          plan?: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          plan?: Json;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      customer_notifications: {
        Row: {
          created_at: string;
          id: string;
          is_read: boolean;
          message: string;
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_read?: boolean;
          message: string;
          title: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_read?: boolean;
          message?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      event_categories: {
        Row: {
          created_at: string;
          id: string;
          image_url: string | null;
          is_active: boolean;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      hero_carousels: {
        Row: {
          created_at: string;
          desktop_image_url: string;
          eyebrow: string;
          id: string;
          is_active: boolean;
          mobile_image_url: string | null;
          sort_order: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          desktop_image_url: string;
          eyebrow?: string;
          id?: string;
          is_active?: boolean;
          mobile_image_url?: string | null;
          sort_order?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          desktop_image_url?: string;
          eyebrow?: string;
          id?: string;
          is_active?: boolean;
          mobile_image_url?: string | null;
          sort_order?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      menu_categories: {
        Row: {
          created_at: string;
          id: string;
          image_url: string | null;
          is_active: boolean;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      menu_items: {
        Row: {
          category_id: string | null;
          created_at: string;
          description: string;
          diet: string;
          id: string;
          image_url: string | null;
          is_active: boolean;
          is_addon: boolean;
          name: string;
          price: number;
          serves: string;
          sort_order: number;
          tags: string[];
          updated_at: string;
        };
        Insert: {
          category_id?: string | null;
          created_at?: string;
          description?: string;
          diet?: string;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          is_addon?: boolean;
          name: string;
          price?: number;
          serves?: string;
          sort_order?: number;
          tags?: string[];
          updated_at?: string;
        };
        Update: {
          category_id?: string | null;
          created_at?: string;
          description?: string;
          diet?: string;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          is_addon?: boolean;
          name?: string;
          price?: number;
          serves?: string;
          sort_order?: number;
          tags?: string[];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "menu_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          booking_reference: string | null;
          created_at: string;
          customer_id: string | null;
          customer_name: string;
          email: string | null;
          estimated_total: number;
          event_date: string | null;
          food_preference: string | null;
          guests: number;
          id: string;
          items: Json;
          mode: string | null;
          notes: string | null;
          occasion: string | null;
          package_id: string | null;
          phone: string;
          services: Json;
          serving_style: string | null;
          status: string;
          updated_at: string;
          venue: Json;
        };
        Insert: {
          booking_reference?: string | null;
          created_at?: string;
          customer_id?: string | null;
          customer_name: string;
          email?: string | null;
          estimated_total?: number;
          event_date?: string | null;
          food_preference?: string | null;
          guests?: number;
          id?: string;
          items?: Json;
          mode?: string | null;
          notes?: string | null;
          occasion?: string | null;
          package_id?: string | null;
          phone: string;
          services?: Json;
          serving_style?: string | null;
          status?: string;
          updated_at?: string;
          venue?: Json;
        };
        Update: {
          booking_reference?: string | null;
          created_at?: string;
          customer_id?: string | null;
          customer_name?: string;
          email?: string | null;
          estimated_total?: number;
          event_date?: string | null;
          food_preference?: string | null;
          guests?: number;
          id?: string;
          items?: Json;
          mode?: string | null;
          notes?: string | null;
          occasion?: string | null;
          package_id?: string | null;
          phone?: string;
          services?: Json;
          serving_style?: string | null;
          status?: string;
          updated_at?: string;
          venue?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "orders_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "packages";
            referencedColumns: ["id"];
          },
        ];
      };
      package_event_categories: {
        Row: {
          created_at: string;
          event_category_id: string;
          package_id: string;
        };
        Insert: {
          created_at?: string;
          event_category_id: string;
          package_id: string;
        };
        Update: {
          created_at?: string;
          event_category_id?: string;
          package_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "package_event_categories_event_category_id_fkey";
            columns: ["event_category_id"];
            isOneToOne: false;
            referencedRelation: "event_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "package_event_categories_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "packages";
            referencedColumns: ["id"];
          },
        ];
      };
      package_section_items: {
        Row: {
          created_at: string;
          id: string;
          label: string;
          section_id: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          label: string;
          section_id: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          label?: string;
          section_id?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "package_section_items_section_id_fkey";
            columns: ["section_id"];
            isOneToOne: false;
            referencedRelation: "package_sections";
            referencedColumns: ["id"];
          },
        ];
      };
      package_sections: {
        Row: {
          created_at: string;
          id: string;
          package_id: string;
          sort_order: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          package_id: string;
          sort_order?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          package_id?: string;
          sort_order?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "package_sections_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "packages";
            referencedColumns: ["id"];
          },
        ];
      };
      packages: {
        Row: {
          created_at: string;
          event_category_id: string | null;
          excluded_services: string[];
          food_preference: string;
          guest_count_from: number;
          guest_count_to: number;
          guests_per_mann: number;
          id: string;
          image_url: string | null;
          included_services: string[];
          is_active: boolean;
          name: string;
          price_per_mann: number;
          service_options: string[];
          signature: boolean;
          slug: string;
          sort_order: number;
          tagline: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          event_category_id?: string | null;
          excluded_services?: string[];
          food_preference?: string;
          guest_count_from: number;
          guest_count_to: number;
          guests_per_mann?: number;
          id?: string;
          image_url?: string | null;
          included_services?: string[];
          is_active?: boolean;
          name: string;
          price_per_mann?: number;
          service_options?: string[];
          signature?: boolean;
          slug: string;
          sort_order?: number;
          tagline?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          event_category_id?: string | null;
          excluded_services?: string[];
          food_preference?: string;
          guest_count_from?: number;
          guest_count_to?: number;
          guests_per_mann?: number;
          id?: string;
          image_url?: string | null;
          included_services?: string[];
          is_active?: boolean;
          name?: string;
          price_per_mann?: number;
          service_options?: string[];
          signature?: boolean;
          slug?: string;
          sort_order?: number;
          tagline?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "packages_event_category_id_fkey";
            columns: ["event_category_id"];
            isOneToOne: false;
            referencedRelation: "event_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      travel_booking_requests: {
        Row: {
          admin_notes: string;
          adults: number;
          booking_reference: string;
          category: string;
          child_ages: number[];
          children: number;
          contact_consent_at: string;
          created_at: string;
          customer_id: string | null;
          customer_name: string;
          dates_flexible: boolean;
          departure_city: string;
          departure_id: string | null;
          email: string | null;
          estimated_adult_total: number | null;
          id: string;
          notes: string;
          package_id: string | null;
          package_snapshot: Json;
          phone: string;
          preferences: Json;
          preferred_date: string | null;
          preferred_month: string | null;
          quoted_total: number | null;
          request_token: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          admin_notes?: string;
          adults: number;
          booking_reference?: string;
          category: string;
          child_ages?: number[];
          children?: number;
          contact_consent_at?: string;
          created_at?: string;
          customer_id?: string | null;
          customer_name: string;
          dates_flexible?: boolean;
          departure_city: string;
          departure_id?: string | null;
          email?: string | null;
          estimated_adult_total?: number | null;
          id?: string;
          notes?: string;
          package_id?: string | null;
          package_snapshot?: Json;
          phone: string;
          preferences?: Json;
          preferred_date?: string | null;
          preferred_month?: string | null;
          quoted_total?: number | null;
          request_token: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          admin_notes?: string;
          adults?: number;
          booking_reference?: string;
          category?: string;
          child_ages?: number[];
          children?: number;
          contact_consent_at?: string;
          created_at?: string;
          customer_id?: string | null;
          customer_name?: string;
          dates_flexible?: boolean;
          departure_city?: string;
          departure_id?: string | null;
          email?: string | null;
          estimated_adult_total?: number | null;
          id?: string;
          notes?: string;
          package_id?: string | null;
          package_snapshot?: Json;
          phone?: string;
          preferences?: Json;
          preferred_date?: string | null;
          preferred_month?: string | null;
          quoted_total?: number | null;
          request_token?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "travel_booking_requests_departure_id_fkey";
            columns: ["departure_id"];
            isOneToOne: false;
            referencedRelation: "travel_departures";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "travel_booking_requests_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "travel_packages";
            referencedColumns: ["id"];
          },
        ];
      };
      travel_catalogue_imports: {
        Row: {
          import_key: string;
          imported_at: string;
          previous_catalogue: Json;
          source_name: string;
        };
        Insert: {
          import_key: string;
          imported_at?: string;
          previous_catalogue: Json;
          source_name: string;
        };
        Update: {
          import_key?: string;
          imported_at?: string;
          previous_catalogue?: Json;
          source_name?: string;
        };
        Relationships: [];
      };
      travel_departures: {
        Row: {
          capacity: number | null;
          created_at: string;
          departure_city: string;
          end_date: string;
          id: string;
          is_active: boolean;
          notes: string;
          package_id: string;
          start_date: string;
          updated_at: string;
        };
        Insert: {
          capacity?: number | null;
          created_at?: string;
          departure_city: string;
          end_date: string;
          id?: string;
          is_active?: boolean;
          notes?: string;
          package_id: string;
          start_date: string;
          updated_at?: string;
        };
        Update: {
          capacity?: number | null;
          created_at?: string;
          departure_city?: string;
          end_date?: string;
          id?: string;
          is_active?: boolean;
          notes?: string;
          package_id?: string;
          start_date?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "travel_departures_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "travel_packages";
            referencedColumns: ["id"];
          },
        ];
      };
      travel_hero_carousels: {
        Row: {
          created_at: string;
          desktop_image_url: string;
          eyebrow: string;
          id: string;
          is_active: boolean;
          mobile_image_url: string | null;
          sort_order: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          desktop_image_url: string;
          eyebrow?: string;
          id?: string;
          is_active?: boolean;
          mobile_image_url?: string | null;
          sort_order?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          desktop_image_url?: string;
          eyebrow?: string;
          id?: string;
          is_active?: boolean;
          mobile_image_url?: string | null;
          sort_order?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      travel_packages: {
        Row: {
          cancellation_terms: string;
          category: string;
          collection: string;
          created_at: string;
          description: string;
          duration: string;
          exclusions: string[];
          highlights: string[];
          id: string;
          image_url: string | null;
          inclusions: string[];
          is_active: boolean;
          itinerary: Json;
          name: string;
          places: string;
          price_basis: string;
          price_per_adult: number | null;
          pricing_mode: string;
          pricing_note: string;
          slug: string;
          sort_order: number;
          tagline: string;
          updated_at: string;
        };
        Insert: {
          cancellation_terms?: string;
          category: string;
          collection?: string;
          created_at?: string;
          description?: string;
          duration?: string;
          exclusions?: string[];
          highlights?: string[];
          id?: string;
          image_url?: string | null;
          inclusions?: string[];
          is_active?: boolean;
          itinerary?: Json;
          name: string;
          places?: string;
          price_basis?: string;
          price_per_adult?: number | null;
          pricing_mode?: string;
          pricing_note?: string;
          slug: string;
          sort_order?: number;
          tagline?: string;
          updated_at?: string;
        };
        Update: {
          cancellation_terms?: string;
          category?: string;
          collection?: string;
          created_at?: string;
          description?: string;
          duration?: string;
          exclusions?: string[];
          highlights?: string[];
          id?: string;
          image_url?: string | null;
          inclusions?: string[];
          is_active?: boolean;
          itinerary?: Json;
          name?: string;
          places?: string;
          price_basis?: string;
          price_per_adult?: number | null;
          pricing_mode?: string;
          pricing_note?: string;
          slug?: string;
          sort_order?: number;
          tagline?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      cancel_customer_travel_booking: {
        Args: { p_booking_reference: string };
        Returns: boolean;
      };
      delete_admin_travel_booking: {
        Args: { p_booking_id: string };
        Returns: boolean;
      };
      cancel_customer_booking: {
        Args: { p_booking_reference: string };
        Returns: boolean;
      };
      get_my_travel_booking: {
        Args: { p_booking_reference: string };
        Returns: {
          adults: number;
          booking_reference: string;
          category: string;
          children: number;
          created_at: string;
          dates_flexible: boolean;
          departure_city: string;
          estimated_adult_total: number;
          package_name: string;
          preferred_date: string;
          preferred_month: string;
          quoted_total: number;
          status: string;
        }[];
      };
      get_my_travel_bookings: {
        Args: { p_limit?: number; p_offset?: number };
        Returns: {
          adults: number;
          booking_reference: string;
          category: string;
          children: number;
          created_at: string;
          dates_flexible: boolean;
          departure_city: string;
          estimated_adult_total: number;
          package_name: string;
          preferred_date: string;
          preferred_month: string;
          quoted_total: number;
          status: string;
        }[];
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      submit_booking: {
        Args: { p_booking: Json };
        Returns: {
          booking_reference: string;
        }[];
      };
      submit_travel_booking: {
        Args: { p_booking: Json };
        Returns: {
          booking_reference: string;
        }[];
      };
    };
    Enums: {
      app_role: "admin" | "moderator" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const;
