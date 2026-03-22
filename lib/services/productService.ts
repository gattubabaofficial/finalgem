import { supabaseAdmin } from "@/lib/supabaseClient";

export async function getProducts(organizationId: string) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function createProduct(
  data: { name: string; category: string; description?: string },
  organizationId: string
) {
  if (!organizationId) throw new Error("Organization ID is required to create a product");

  const { data: product, error } = await supabaseAdmin
    .from("products")
    .insert({
      name: data.name,
      category: data.category,
      description: data.description,
      organization_id: organizationId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return product;
}

export async function getProductById(id: string, organizationId: string) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*, lots(*)")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProduct(id: string, organizationId: string) {
  const { error } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);
}
