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
    const created_at_source = String(body?.created_at_source ?? "landing");
    const copy_variant =
      body?.copy_variant !== undefined
        ? String(body.copy_variant).trim()
        : undefined;
    const utm_source =
      body?.utm_source !== undefined
        ? String(body.utm_source).trim()
        : undefined;
    const utm_medium =
      body?.utm_medium !== undefined
        ? String(body.utm_medium).trim()
        : undefined;
    const utm_campaign =
      body?.utm_campaign !== undefined
        ? String(body.utm_campaign).trim()
        : undefined;
    const utm_term =
      body?.utm_term !== undefined ? String(body.utm_term).trim() : undefined;
    const utm_content =
      body?.utm_content !== undefined
        ? String(body.utm_content).trim()
        : undefined;

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
        created_at_source,
        copy_variant,
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
