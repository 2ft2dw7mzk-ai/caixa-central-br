import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell, Painel } from "@/components/AppShell";
import { CardResumo, Chip, Vazio } from "@/components/Comuns";
import { FORMAS, statusReal, type Entry } from "@/lib/finance";
import { brl, brlCurto, dataBR, MESES_CURTOS, somarMeses } from "@/lib/format";
import {
  useCartoes,
  useCategorias,
  useContas,
  useFaturas,
  useLancamentos,
  useProjetos,
  useReceitas,
} from "@/lib/queries";
import { usePeriodo } from "@/hooks/usePeriodo";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Realce" },
      { name: "description", content: "Visão geral do seu mês: receitas, despesas, faturas e contas." },
    ],
  }),
  component: DashboardComponent,
});

function DashboardComponent() {
  const { mes, ano } = usePeriodo();
  const navigate = useNavigate();

  const { data: todos = [], isLoading } = useLancamentos();
  const { data: categorias = [] } = useCategorias();
  const { data: cartoes = [] } = useCartoes();
  const { data: contas = [] } = useContas();
  const { data: faturas = [] } = useFaturas();
  const { data: projetos = [] } = useProjetos();
  const { data: receitas = [] } = useReceitas(mes, ano);

  const doMes = useMemo(
    () => todos.filter((e) => e.mes_ref === mes && e.ano_ref === ano),
    [todos, mes, ano],
  );

  const receitasMes = receitas.reduce((s, r) => s + Number(r.valor), 0);
  const despesasMes = doMes.reduce((s, e) => s + Number(e.valor), 0);
  const contasFixasMes = doMes
    .filter((e) => e.origem === "fixa")
    .reduce((s, e) => s + Number(e.valor), 0);
  const gastosVariaveisMes = doMes
    .filter((e) => e.origem === "variavel")
    .reduce((s, e) => s + Number(e.valor), 0);
  const totalPagoMes = doMes
    .filter((e) => statusReal(e) === "pago")
    .reduce((s, e) => s + Number(e.valor), 0);
  const pendentes = doMes.filter((e) => statusReal(e) !== "pago");
  const totalPendenteMes = pendentes.reduce((s, e) => s + Number(e.valor), 0);
  const saldoDisponivel = receitasMes - despesasMes;

  const faturasAbertas = faturas.filter((f) => f.status !== "paga");
  const totalFaturasAbertas = faturasAbertas.reduce((s, f) => {
    const total = todos
      .filter((e) => e.invoice_id === f.id)
      .reduce((acc, e) => acc + Number(e.valor), 0);
    return s + total;
  }, 0);

  const porCategoria = useMemo(() => {
    const mapa = new Map<string, number>();
    doMes.forEach((e) => {
      const nome = categorias.find((c) => c.id === e.category_id)?.nome ?? "Sem categoria";
      mapa.set(nome, (mapa.get(nome) ?? 0) + Number(e.valor));
    });
    const cores = categorias.reduce<Record<string, string>>((acc, c) => {
      acc[c.nome] = c.cor;
      return acc;
    }, {});
    return Array.from(mapa.entries())
      .map(([nome, valor]) => ({ nome, valor, cor: cores[nome] ?? "#94a3b8" }))
      .sort((a, b) => b.valor - a.valor);
  }, [doMes, categorias]);

  const porForma = useMemo(() => {
    const mapa = new Map<string, number>();
    doMes.forEach((e) => {
      const label = FORMAS.find((f) => f.value === e.forma_pagamento)?.label ?? e.forma_pagamento;
      mapa.set(label, (mapa.get(label) ?? 0) + Number(e.valor));
    });
    return Array.from(mapa.entries()).map(([nome, valor]) => ({ nome, valor }));
  }, [doMes]);

  const evolucao = useMemo(() => {
    const meses = Array.from({ length: 6 }, (_, i) => somarMeses(mes, ano, i - 5));
    return meses.map(({ mes: m, ano: a }) => ({
      label: MESES_CURTOS[m - 1],
      valor: todos
        .filter((e) => e.mes_ref === m && e.ano_ref === a)
        .reduce((s, e) => s + Number(e.valor), 0),
    }));
  }, [todos, mes, ano]);

  const proximasContas = pendentes
    .filter((e) => e.data_vencimento)
    .sort((a, b) => (a.data_vencimento! < b.data_vencimento! ? -1 : 1))
    .slice(0, 6);

  const ultimosLancamentos = [...doMes]
    .sort((a, b) => (a.data_gasto && b.data_gasto ? (a.data_gasto < b.data_gasto ? 1 : -1) : 0))
    .slice(0, 6);

  const viagensAndamento = projetos
    .filter((p) => p.status === "em_andamento")
    .map((p) => {
      const gasto = todos
        .filter((e) => e.project_id === p.id)
        .reduce((s, e) => s + Number(e.valor), 0);
      return { ...p, gasto, percentual: p.orcamento > 0 ? (gasto / p.orcamento) * 100 : 0 };
    });

  const nomeCategoria = (e: Entry) =>
    categorias.find((c) => c.id === e.category_id)?.nome ?? "—";

  const CORES = ["#38bdf8", "#a78bfa", "#34d399", "#fbbf24", "#fb7185", "#f472b6", "#60a5fa", "#22d3ee"];

  return (
    <AppShell titulo="Dashboard" subtitulo="Visão geral do seu mês">
      {isLoading ? (
        <Vazio texto="Carregando..." />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <CardResumo titulo="Receitas do mês" valor={receitasMes} tom="positivo" onClick={() => navigate({ to: "/receitas" })} />
            <CardResumo titulo="Despesas do mês" valor={despesasMes} tom="negativo" />
            <CardResumo titulo="Saldo disponível" valor={saldoDisponivel} destaque tom={saldoDisponivel >= 0 ? "positivo" : "negativo"} />
            <CardResumo titulo="Total pago no mês" valor={totalPagoMes} tom="positivo" />
            <CardResumo titulo="Contas fixas" valor={contasFixasMes} onClick={() => navigate({ to: "/contas-fixas" })} />
            <CardResumo titulo="Gastos variáveis" valor={gastosVariaveisMes} onClick={() => navigate({ to: "/gastos-variaveis" })} />
            <CardResumo titulo="Faturas em aberto" valor={totalFaturasAbertas} nota={`${faturasAbertas.length} fatura(s)`} tom="alerta" onClick={() => navigate({ to: "/cartoes" })} />
            <CardResumo titulo="Contas pendentes" valor={totalPendenteMes} nota={`${pendentes.length} lançamento(s)`} tom="alerta" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Painel titulo="Despesas por categoria" className="lg:col-span-1">
              {porCategoria.length === 0 ? (
                <Vazio texto="Sem dados neste mês." />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={porCategoria} dataKey="valor" nameKey="nome" innerRadius={50} outerRadius={80}>
                      {porCategoria.map((c, i) => (
                        <Cell key={c.nome} fill={c.cor || CORES[i % CORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => brl(v)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {porCategoria.slice(0, 6).map((c, i) => (
                  <span key={c.nome} className="inline-flex items-center gap-1.5 text-xs text-slate-dim">
                    <span className="size-2 rounded-full" style={{ background: c.cor || CORES[i % CORES.length] }} />
                    {c.nome}
                  </span>
                ))}
              </div>
            </Painel>

            <Painel titulo="Gastos por forma de pagamento" className="lg:col-span-1">
              {porForma.length === 0 ? (
                <Vazio texto="Sem dados neste mês." />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={porForma}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="nome" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => brlCurto(v)} tick={{ fontSize: 11 }} width={56} />
                    <Tooltip formatter={(v: number) => brl(v)} />
                    <Bar dataKey="valor" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Painel>

            <Painel titulo="Evolução dos gastos mensais" className="lg:col-span-1">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={evolucao}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => brlCurto(v)} tick={{ fontSize: 11 }} width={56} />
                  <Tooltip formatter={(v: number) => brl(v)} />
                  <Bar dataKey="valor" fill="#a78bfa" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Painel>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Painel titulo="Contas próximas do vencimento">
              {proximasContas.length === 0 ? (
                <Vazio texto="Nenhuma conta pendente." />
              ) : (
                <ul className="divide-y divide-black/5 text-sm">
                  {proximasContas.map((e) => (
                    <li key={e.id} className="flex items-center justify-between gap-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{e.descricao}</p>
                        <p className="text-xs text-slate-dim">Vence em {dataBR(e.data_vencimento)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="num text-sm">{brl(e.valor)}</span>
                        <Chip status={statusReal(e)} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Painel>

            <Painel titulo="Últimos lançamentos">
              {ultimosLancamentos.length === 0 ? (
                <Vazio texto="Nenhum lançamento neste mês." />
              ) : (
                <ul className="divide-y divide-black/5 text-sm">
                  {ultimosLancamentos.map((e) => (
                    <li key={e.id} className="flex items-center justify-between gap-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{e.descricao}</p>
                        <p className="text-xs text-slate-dim">{nomeCategoria(e)} · {dataBR(e.data_gasto)}</p>
                      </div>
                      <span className="num shrink-0 text-sm">{brl(e.valor)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Painel>

            <Painel titulo="Faturas em aberto">
              {faturasAbertas.length === 0 ? (
                <Vazio texto="Nenhuma fatura em aberto." />
              ) : (
                <ul className="divide-y divide-black/5 text-sm">
                  {faturasAbertas.map((f) => {
                    const cartao = cartoes.find((c) => c.id === f.card_id);
                    const total = todos
                      .filter((e) => e.invoice_id === f.id)
                      .reduce((s, e) => s + Number(e.valor), 0);
                    return (
                      <li key={f.id} className="flex items-center justify-between gap-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{cartao?.nome ?? "Cartão"}</p>
                          <p className="text-xs text-slate-dim">Vence em {dataBR(f.data_vencimento)}</p>
                        </div>
                        <span className="num shrink-0 text-sm">{brl(total)}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Painel>

            <Painel titulo="Viagens e projetos em andamento">
              {viagensAndamento.length === 0 ? (
                <Vazio texto="Nenhuma viagem ou projeto em andamento." />
              ) : (
                <ul className="divide-y divide-black/5 text-sm">
                  {viagensAndamento.map((p) => (
                    <li key={p.id} className="py-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate font-semibold">{p.nome}</p>
                        <span className="num shrink-0 text-sm">
                          {brl(p.gasto)} / {brl(p.orcamento)}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
                        <div
                          className={`h-full rounded-full ${p.percentual > 100 ? "bg-coral" : "bg-mint"}`}
                          style={{ width: `${Math.min(p.percentual, 100)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Painel>
          </div>
        </div>
      )}
    </AppShell>
  );
}

