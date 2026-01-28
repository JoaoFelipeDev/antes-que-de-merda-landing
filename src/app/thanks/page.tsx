"use client";

import { useMemo, useState } from "react";

export default function ThanksPage() {
  const [sent, setSent] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const source = useMemo(() => {
    if (typeof window === "undefined") return "thanks";
    const url = new URL(window.location.href);
    return url.searchParams.get("src") ?? "thanks";
  }, []);

  async function send(intent: "yes" | "maybe" | "no") {
    setErr(null);
    setSent(null);

    try {
      const pseudoEmail = `vote-${intent}-${Date.now()}@example.local`;

      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pseudoEmail,
          price_intent: intent,
          source,
          company: "",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Erro.");

      setSent(intent);
    } catch (error) {
      if (error instanceof Error) {
        setErr(error.message);
      } else {
        setErr("Erro.");
      }
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight">Fechado ✅</h1>
        <p className="mt-3 text-lg text-zinc-300">
          Quando tiver beta eu te aviso.
        </p>

        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <p className="text-zinc-100 font-semibold">
            Você pagaria{" "}
            <span className="underline">R$ 7,90/mês</span> pra não perder
            dinheiro por esquecimento?
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => send("yes")}
              className="rounded-xl bg-zinc-100 px-5 py-3 font-semibold text-zinc-900 hover:bg-white"
            >
              Sim
            </button>
            <button
              onClick={() => send("maybe")}
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-3 font-semibold text-zinc-100 hover:border-zinc-500"
            >
              Talvez
            </button>
            <button
              onClick={() => send("no")}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-3 font-semibold text-zinc-300 hover:border-zinc-600"
            >
              Não
            </button>
          </div>

          {sent && (
            <p className="mt-4 text-sm text-zinc-300">
              Valeu! Resposta registrada:{" "}
              <span className="font-semibold">{sent}</span>
            </p>
          )}
          {err && <p className="mt-4 text-sm text-red-300">{err}</p>}

          <p className="mt-6 text-xs text-zinc-500">
            (Se quiser amarrar essa resposta ao email real, eu te passo a versão
            com <code className="rounded bg-zinc-900 px-1">localStorage</code>.)
          </p>
        </div>
      </div>
    </main>
  );
}

