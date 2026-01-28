 "use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const source = useMemo(() => {
    if (typeof window === "undefined") return "landing";
    const url = new URL(window.location.href);
    return url.searchParams.get("src") ?? "landing";
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          price_intent: "unknown",
          source,
          company: "",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Erro ao enviar.");

      router.push("/thanks");
    } catch (error) {
      if (error instanceof Error) {
        setErr(error.message);
      } else {
        setErr("Erro ao enviar.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-10">
          <h1 className="text-5xl font-bold tracking-tight">
            Antes que dê merda.
          </h1>
          <p className="mt-4 text-lg text-zinc-300">
            Um app pra te avisar{" "}
            <span className="font-semibold text-zinc-100">antes</span> de você
            esquecer algo importante — e isso virar problema, multa ou
            prejuízo.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow">
          <p className="text-zinc-200">
            Fatura, IPVA, teste grátis, compromisso, documento.
            <br />
            <span className="text-zinc-400">
              Não é preguiça. É coisa demais pra lembrar.
            </span>
          </p>

          <ul className="mt-6 space-y-2 text-zinc-200">
            <li>
              • Você cadastra só o que{" "}
              <span className="font-semibold">não pode esquecer</span>
            </li>
            <li>
              • O app avisa{" "}
              <span className="font-semibold">mais de uma vez</span>
            </li>
            <li>• Sem tarefas inúteis, sem produtividade fake</li>
          </ul>

          <form onSubmit={submit} className="mt-8 space-y-3">
            <label className="block text-sm text-zinc-300">
              🔔 Quero ser avisado antes que dê merda
            </label>

            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            <div className="flex gap-3">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="seuemail@exemplo.com"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none focus:border-zinc-600"
              />
              <button
                disabled={loading}
                className="rounded-xl bg-zinc-100 px-5 py-3 font-semibold text-zinc-900 hover:bg-white disabled:opacity-60"
              >
                {loading ? "Enviando..." : "Quero"}
              </button>
            </div>

            {err && <p className="text-sm text-red-300">{err}</p>}
            <p className="text-xs text-zinc-500">
              Sem spam. Só aviso quando tiver beta.
            </p>
          </form>
        </div>

        <p className="mt-10 text-sm text-zinc-500">
          Dica: use{" "}
          <code className="rounded bg-zinc-900 px-1">?src=ig</code> /{" "}
          <code className="rounded bg-zinc-900 px-1">?src=fb</code> pra
          rastrear origem.
        </p>
      </div>
    </main>
  );
}
