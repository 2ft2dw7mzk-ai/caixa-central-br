import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AppShell, Painel } from "@/components/AppShell";
import { CardResumo, Vazio } from "@/components/Comuns";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FORMAS, statusReal } from "@/lib/finance";
import { brl, brlCurto, dataBR, MESES_CURTOS, periodoLabel, somarMeses } from "@/lib/format";
import {
  useCartoes,
  useCategorias,
  useContas,
  useLancamentos,
  useProjetos,
  useReceitas,
} from "@/lib/queries";
import { usePeriodo } from "@/hooks/usePeriodo";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Realce" },
      { name: "description", content: "Totais por categoria, forma de pagamento, cartão e mais." },
    ],
  }),
  component: Relatorios,
});

const TODAS = "todas";

function Relatorios() {
  const { mes, ano } = usePeriodo();
  const { data: todos = [] } = useLancamentos();
  const { data: receitas = [] } = useReceitas(mes, ano);
  const { data: categorias = [] } = useCategorias();
  const { data: contas = [] } = useContas();
  const { data: cartoes = [] } = useCartoes();
  const { data: projetos = [] } = useProjetos();

  const [filtroCategoria, setFiltroCategoria] = useState(TODAS);
  const [filtroForma, setFiltroForma] = useState(TODAS);
  const [filtroStatus, setFiltroStatus] = useState(TODAS);

  const doMes = useMemo(
    () => todos.filter((e) => e.mes_ref === mes && e.ano_ref === ano),
    [todos, mes, ano],
  );

  const filtrados = useMemo(
    () =>
      doMes
        .filter((e) => filtroCategoria === TODAS || e.category_id === filtroCategoria)
        .filter((e) => filtroForma === TODAS || e.forma_pagamento === filtroForma)
        .filter((e) => filtroStatus === TODAS || statusReal(e) === filtroStatus),
    [doMes, filtroCategoria, filtroForma, filtroStatus],
  );

  const somaPor = (chave: (e: (typeof filtrados)[number]) => string) => {
    const mapa = new Map<string, number>();
    filtrados.forEach((e) => {
      const k = chave(e);
      mapa.set(k, (mapa.get(k) ?? 0) + Number(e.valor));
    });
    return Array.from(mapa.entries()).sort((a, b) => b[1] - a[1]);
  };

  const nomeCategoria = (id: string | null) => categorias.find((c) => c.id === id)?.nome ?? "Sem categoria";
  const nomeCartao = (id: string | null) => cartoes.find((c) => c.id === id)?.nome ?? "—";
  const nomeProjeto = (id: string | null) => projetos.find((p) => p.id === id)?.nome ?? "—";

  const porCategoria = somaPor((e) => nomeCategoria(e.category_id));
  const porForma = somaPor((e) => FORMAS.find((f) => f.value === e.forma_pagamento)?.label ?? e.forma_pagamento);
  const porCartao = somaPor((e) => (e.card_id ? nomeCartao(e.card_id) : "—")).filter(([k]) => k !== "—");
  const porViagem = somaPor((e) => (e.project_id ? nomeProjeto(e.project_id) : "—")).filter(([k]) => k !== "—");

  const totalContasFixas = filtrados.filter((e) => e.origem === "fixa").reduce((s, e) => s + Number(e.valor), 0);
  const totalVariaveis = filtrados.filter((e) => e.origem === "variavel").reduce((s, e) => s + Number(e.valor), 0);
  const totalReceitas = receitas.reduce((s, r) => s + Number(r.valor), 0);
  const totalPago = filtrados.filter((e) => statusReal(e) === "pago").reduce((s, e) => s + Number(e.valor), 0);
  const totalPendente = filtrados.filter((e) => statusReal(e) === "pendente").reduce((s, e) => s + Number(e.valor), 0);
  const totalAtrasado = filtrados.filter((e) => statusReal(e) === "atrasado").reduce((s, e) => s + Number(e.valor), 0);

  const comprasParceladasFuturas = todos.filter(
    (e) => e.parcela_num && e.parcela_total && e.parcela_num < e.parcela_total && e.status !== "pago",
  );

  const evolucao = useMemo(() => {
    const meses = Array.from({ length: 6 }, (_, i) => somarMeses(mes, ano, i - 5));
    return meses.map(({ mes: m, ano: a }) => ({
      label: MESES_CURTOS[m - 1],
      valor: todos.filter((e) => e.mes_ref === m && e.ano_ref === a).reduce((s, e) => s + Number(e.valor), 0),
    }));
  }, [todos, mes, ano]);

  const mesAnterior = somarMeses(mes, ano, -1);
  const totalMesAnterior = todos
    .filter((e) => e.mes_ref === mesAnterior.mes && e.ano_ref === mesAnterior.ano)
    .reduce((s, e) => s + Number(e.valor), 0);
  const totalMesAtual = doMes.reduce((s, e) => s + Number(e.valor), 0);
  const variacao = totalMesAnterior > 0 ? ((totalMesAtual - totalMesAnterior) / totalMesAnterior) * 100 : 0;

  function exportarCSV() {
    const linhas = [
      ["Descrição", "Categoria", "Data", "Forma", "Conta/Cartão", "Valor", "Situação"],
      ...filtrados.map((e) => [
        e.descricao,
        nomeCategoria(e.category_id),
        dataBR(e.data_gasto ?? e.data_vencimento),
        FORMAS.find((f) => f.value === e.forma_pagamento)?.label ?? e.forma_pagamento,
        e.card_id ? nomeCartao(e.card_id) : (contas.find((c) => c.id === e.account_id)?.nome ?? "—"),
        String(e.valor).replace(".", ","),
        statusReal(e),
      ]),
    ];
    const csv = linhas.map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${mes}-${ano}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell
      titulo="Relatórios"
      subtitulo={`Totais de ${periodoLabel(mes, ano)}`}
      acoes={
        <Button variant="outline" onClick={exportarCSV}>
          <Download className="size-4" /> Exportar CSV
        </Button>
      }
    >
      <div className="space-y-6">
        <Painel>
          <div className="flex flex-wrap gap-2">
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-[180px] bg-white/70">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODAS}>Todas as categorias</SelectItem>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroForma} onValueChange={setFiltroForma}>
              <SelectTrigger className="w-[170px] bg-white/70">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODAS}>Todas as formas</SelectItem>
                {FORMAS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-[160px] bg-white/70">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODAS}>Todas as situações</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Painel>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <CardResumo titulo="Contas fixas" valor={totalContasFixas} />
          <CardResumo titulo="Gastos variáveis" valor={totalVariaveis} />
          <CardResumo titulo="Receitas" valor={totalReceitas} tom="positivo" />
          <CardResumo titulo="Pago" valor={totalPago} tom="positivo" />
          <CardResumo titulo="Pendente" valor={totalPendente} tom="alerta" />
          <CardResumo titulo="Atrasado" valor={totalAtrasado} tom="negativo" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Painel titulo="Total por categoria">
            {porCategoria.length === 0 ? (
              <Vazio texto="Sem dados." />
            ) : (
              <ul className="divide-y divide-black/5 text-sm">
                {porCategoria.map(([nome, valor]) => (
                  <li key={nome} className="flex items-center justify-between py-2">
                    <span>{nome}</span>
                    <span className="num">{brl(valor)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Painel>

          <Painel titulo="Total por forma de pagamento">
            {porForma.length === 0 ? (
              <Vazio texto="Sem dados." />
            ) : (
              <ul className="divide-y divide-black/5 text-sm">
                {porForma.map(([nome, valor]) => (
                  <li key={nome} className="flex items-center justify-between py-2">
                    <span>{nome}</span>
                    <span className="num">{brl(valor)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Painel>

          <Painel titulo="Total por cartão">
            {porCartao.length === 0 ? (
              <Vazio texto="Sem dados." />
            ) : (
              <ul className="divide-y divide-black/5 text-sm">
                {porCartao.map(([nome, valor]) => (
                  <li key={nome} className="flex items-center justify-between py-2">
                    <span>{nome}</span>
                    <span className="num">{brl(valor)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Painel>

          <Painel titulo="Gastos por viagem/projeto">
            {porViagem.length === 0 ? (
              <Vazio texto="Sem dados." />
            ) : (
              <ul className="divide-y divide-black/5 text-sm">
                {porViagem.map(([nome, valor]) => (
                  <li key={nome} className="flex items-center justify-between py-2">
                    <span>{nome}</span>
                    <span className="num">{brl(valor)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Painel>
        </div>

        <Painel titulo="Evolução mensal">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={evolucao}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => brlCurto(v)} tick={{ fontSize: 11 }} width={56} />
              <Tooltip formatter={(v: number) => brl(v)} />
              <Bar dataKey="valor" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Painel>

        <div className="grid gap-4 lg:grid-cols-2">
          <Painel titulo="Comparativo entre meses">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-slate-dim">{periodoLabel(mesAnterior.mes, mesAnterior.ano)}</p>
                <p className="num text-lg">{brl(totalMesAnterior)}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-dim">{periodoLabel(mes, ano)}</p>
                <p className="num text-lg">{brl(totalMesAtual)}</p>
              </div>
            </div>
            <p className={`mt-2 text-xs font-semibold ${variacao > 0 ? "text-coral" : "text-mint"}`}>
              {variacao === 0 ? "Sem variação" : `${variacao > 0 ? "+" : ""}${variacao.toFixed(1)}% em relação ao mês anterior`}
            </p>
          </Painel>

          <Painel titulo="Compras parceladas futuras">
            {comprasParceladasFuturas.length === 0 ? (
              <Vazio texto="Nenhuma parcela futura." />
            ) : (
              <ul className="divide-y divide-black/5 text-sm">
                {comprasParceladasFuturas.slice(0, 6).map((e) => (
                  <li key={e.id} className="flex items-center justify-between py-2">
                    <span className="truncate">
                      {e.descricao} ({e.parcela_num}/{e.parcela_total})
                    </span>
                    <span className="num shrink-0">{brl(e.valor)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Painel>
        </div>
      </div>
    </AppShell>
  );
}
