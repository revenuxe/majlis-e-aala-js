import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AdminDashboard from "@/routes/admin.dashboard";

import { createSupabaseServerClient } from "@/integrations/supabase/server";
export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
  if (!isAdmin) redirect("/admin/login");
  return <AdminDashboard />;
}
