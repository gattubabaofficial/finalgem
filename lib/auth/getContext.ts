import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function getTenantContext() {
  const session = await auth();
  const sessionUser = session?.user as any;

  if (!sessionUser?.email) {
    throw new Error("Unauthorized: Please log in again");
  }

  // Fetch the latest user data from DB to get the current organizationId
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("id, organization_id, role")
    .eq("email", sessionUser.email)
    .single();

  if (error || !user) {
    throw new Error("Unauthorized: User not found in database");
  }

  if (!user.organization_id && user.role !== "SUPERADMIN") {
    throw new Error("Unauthorized: Your account is not associated with any organization");
  }

  return {
    userId: user.id,
    organizationId: user.organization_id as string,
    role: user.role,
  };
}
