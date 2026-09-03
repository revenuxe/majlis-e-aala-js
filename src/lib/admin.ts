import { supabase } from "@/integrations/supabase/client";

export type PackageRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  price_per_mann: number;
  guests_per_mann: number;
  guest_count_from: number;
  guest_count_to: number;
  event_category_id: string | null;
  food_preference: "veg" | "nonveg" | "mixed";
  included_services: string[];
  excluded_services: string[];
  service_options: string[];
  image_url: string | null;
  signature: boolean;
  is_active: boolean;
  sort_order: number;
};

export type EventCategoryRow = {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type HeroCarouselRow = {
  id: string;
  eyebrow: string;
  title: string;
  desktop_image_url: string;
  mobile_image_url: string | null;
  is_active: boolean;
  sort_order: number;
};

export type SectionRow = {
  id: string;
  package_id: string;
  title: string;
  sort_order: number;
};

export type SectionItemRow = {
  id: string;
  section_id: string;
  label: string;
  sort_order: number;
};

export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type MenuItemRow = {
  id: string;
  category_id: string | null;
  name: string;
  description: string;
  price: number;
  serves: string;
  diet: string;
  image_url: string | null;
  tags: string[];
  is_active: boolean;
  sort_order: number;
};

export type OrderRow = {
  id: string;
  booking_reference?: string | null;
  customer_name: string;
  phone: string;
  email: string | null;
  occasion: string | null;
  event_date: string | null;
  guests: number;
  mode: string | null;
  package_id: string | null;
  items: unknown;
  services: unknown;
  estimated_total: number;
  notes: string | null;
  status: string;
  created_at: string;
};

export const ORDER_STATUSES = [
  "new",
  "contacted",
  "quoted",
  "confirmed",
  "completed",
  "cancelled",
] as const;

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || `item-${Date.now()}`;

/** Uploads to the private media bucket and returns a long-lived signed URL. */
export async function uploadImage(file: File) {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  const { data, error: signError } = await supabase.storage
    .from("media")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
  if (signError || !data) throw signError ?? new Error("Could not create image link");
  return data.signedUrl;
}

export async function isCurrentUserAdmin() {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return false;
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });
  if (error) return false;
  return Boolean(data);
}

export const inr = (n: number) => "₹" + Number(n || 0).toLocaleString("en-IN");
