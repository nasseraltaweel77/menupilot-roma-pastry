import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/mock-data";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function requireUser(): Promise<{
  supabase: SupabaseServerClient;
  user: { id: string; email?: string };
}> {
  if (!hasSupabaseEnv()) {
    return {
      supabase: null as unknown as SupabaseServerClient,
      user: { id: "mock-admin", email: "admin@demo.local" },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return { supabase, user };
}

export async function getRestaurantForUser(userId: string) {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", userId)
    .single();

  if (error) {
    return null;
  }

  return data;
}
