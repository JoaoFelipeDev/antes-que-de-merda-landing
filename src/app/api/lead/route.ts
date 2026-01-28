import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email: rawEmail,
      price_intent = "unknown",
      source = "landing",
      created_at_source = "landing",
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      company,
    } = body ?? {};

    const email = String(rawEmail ?? "").trim().toLowerCase();
    const intentValue = String(price_intent ?? "unknown");
    const sourceValue = String(source ?? "landing");
    const createdAtSourceValue = String(created_at_source ?? "landing");

    const hp = String(company ?? "").trim();
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
    const intent = allowed.has(intentValue) ? intentValue : "unknown";

    const user_agent = req.headers.get("user-agent") ?? undefined;
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      undefined;

    const { error } = await supabase.from("leads").upsert(
      {
        email,
        price_intent: intent,
        source: sourceValue,
        created_at_source: createdAtSourceValue,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
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
