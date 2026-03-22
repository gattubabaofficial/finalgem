import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ role: null });
  const user = session.user as any;
  return NextResponse.json({ role: user.role ?? null, name: user.name, email: user.email });
}
