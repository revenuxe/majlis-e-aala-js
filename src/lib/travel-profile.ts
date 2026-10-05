import type { User } from "@supabase/supabase-js";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const profileSchema = z.object({
  name: z.string().max(100),
  phone: z.string().max(24),
  email: z.string().max(254),
});
export type TravelProfile = z.infer<typeof profileSchema>;
const key = (id: string) => `majlise-aala-travel-profile:${id}`;

export function travelProfileFromUser(user: User): TravelProfile {
  let local: unknown;
  try {
    local = JSON.parse(localStorage.getItem(key(user.id)) || "null");
  } catch {
    /* Optional storage. */
  }
  for (const candidate of [
    local,
    user.user_metadata?.["travel_profile"],
    user.user_metadata?.["customer_profile"]?.contact,
  ]) {
    const parsed = profileSchema.safeParse(candidate);
    if (parsed.success) return parsed.data;
  }
  return {
    name:
      typeof user.user_metadata?.["full_name"] === "string"
        ? user.user_metadata["full_name"].slice(0, 100)
        : "",
    phone: "",
    email: user.email || "",
  };
}

export async function saveTravelProfile(user: User, profile: TravelProfile) {
  const validated = profileSchema.parse(profile);
  try {
    localStorage.setItem(key(user.id), JSON.stringify(validated));
  } catch {
    /* Optional storage. */
  }
  const { error } = await supabase.auth.updateUser({ data: { travel_profile: validated } });
  if (error) throw error;
}
