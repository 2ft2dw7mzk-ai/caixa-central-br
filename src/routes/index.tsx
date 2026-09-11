import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, PieChart, CreditCard, Plane } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Realce — Controle Financeiro Pessoal em R$" },
      {
        name: "description",
        content:
          "Centralize contas fixas, gastos variáveis, faturas de cartão, viagens e receitas com fechamento mensal sem duplicar lançamentos.",
      },
      { property: "og:title", content: "Realce — Controle Financeiro Pessoal" },
      {
        property: "og:description",
        content:
          "Um só lugar para acompanhar contas pagas, pendentes, faturas e o saldo do mês.",
      },
    ],
  }),
  component: Inicio,
});

function Inicio() {
  return (
    <div className="app-bg relative min-h-screen overflow-hidden text-ink">
      <div className="glow-blob -left-16 -top-24 h-[420px] w-[420px] bg-sky-glow/40" />
      <div className="glow-blob -right-24 top-32 h-[460px] w-[460px] bg-violet-glow/30" />

      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-ink font-display text-2xl font-bold text-white">
          R
        </div>
        <h1 className="mt-6 text-4xl font-bold sm:text-5xl">
          Todo o seu dinheiro em um só painel
        </h1>
        <p className="mt-4 max-w-xl text-slate-dim">
          Contas fixas, gastos variáveis, faturas de cartão, viagens e receitas — com
          mês de referência, contas pendentes e fechamento mensal sem lançamento
          duplicado.
        </p>

        <Link
          to="/auth"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
        >
          Entrar no meu controle <ArrowRight className="size-4" />
        </Link>

        <div className="mt-12 grid w-full gap-3 sm:grid-cols-3">
          {[
            { icon: PieChart, t: "Fechamento mensal", d: "Receitas, despesas e saldo" },
            { icon: CreditCard, t: "Faturas e parcelas", d: "Só a parcela entra no mês" },
            { icon: Plane, t: "Viagens e projetos", d: "Orçamento com saldo restante" },
          ].map(({ icon: Icone, t, d }) => (
            <div key={t} className="glass rounded-2xl p-4 text-left">
              <Icone className="size-5 text-sky-glow" />
              <p className="mt-2 text-sm font-semibold">{t}</p>
              <p className="text-xs text-slate-dim">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
