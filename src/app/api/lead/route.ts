import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const price_intent = String(body?.price_intent ?? "unknown");
    const source = String(body?.source ?? "landing");

    const hp = String(body?.company ?? "").trim();
    if (hp) {
      return NextResponse.json({ ok: true });
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "Email inválido." },
        { status: 400 },
      );
    }

    const allowed = new Set(["yes", "maybe", "no", "unknown"]);
    const intent = allowed.has(price_intent) ? price_intent : "unknown";

    const user_agent = req.headers.get("user-agent") ?? undefined;
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      undefined;

    const { error } = await supabase.from("leads").upsert(
      {
        email,
        price_intent: intent,
        source,
        user_agent,
        ip,
      },
      { onConflict: "email" },
    );

    if (error) {
      return NextResponse.json(
        { ok: false, error: "Falha ao salvar lead." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Requisição inválida." },
      { status: 400 },
    );
  }
}

