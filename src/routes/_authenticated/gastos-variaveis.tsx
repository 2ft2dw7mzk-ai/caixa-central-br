import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Copy, Pencil, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { AppShell, Painel } from "@/components/AppShell";
import { BotaoExcluir, Chip, Vazio } from "@/components/Comuns";
import { LancamentoDialog } from "@/components/LancamentoDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePeriodo } from "@/hooks/usePeriodo";
import { FORMAS, statusReal, type Entry } from "@/lib/finance";
import { brl, dataBR, periodoLabel } from "@/lib/format";
import { useCartoes, useCategorias, useContas, useLancamentos } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/gastos-variaveis")({
  head: () => ({
    meta: [
      { title: "Gastos variáveis — Realce" },
      {
        name: "description",
        content: "Cadastre apenas o que você realmente gastou em cada mês.",
      },
      { property: "og:title", content: "Gastos variáveis — Realce" },
      {
        property: "og:description",
        content: "Cadastre apenas o que você realmente gastou em cada mês.",
      },
    ],
  }),
  component: GastosVariaveis,
});

function GastosVariaveis() {
  const { mes, ano } = usePeriodo();
  const queryClient = useQueryClient();
  const { data: lancamentos = [], isLoading } = useLancamentos(mes, ano);
  const { data: categorias = [] } = useCategorias();
  const { data: contas = [] } = useContas();
  const { data: cartoes = [] } = useCartoes();

  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroForma, setFiltroForma] = useState("todas");
  const [dialogo, setDialogo] = useState(false);
  const [editando, setEditando] = useState<Entry | null>(null);

  const variaveis = useMemo(
    () =>
      lancamentos
        .filter((e) => e.origem === "variavel")
        .filter((e) => e.descricao.toLowerCase().includes(busca.toLowerCase()))
        .filter(
          (e) => filtroCategoria === "todas" || e.category_id === filtroCategoria,
        )
        .filter((e) => filtroForma === "todas" || e.forma_pagamento === filtroForma),
    [lancamentos, busca, filtroCategoria, filtroForma],
  );

  const total = variaveis.reduce((s, e) => s + Number(e.valor), 0);
  const nomeCategoria = (id: string | null) =>
    categorias.find((c) => c.id === id)?.nome ?? "—";
  const nomeOrigemPagamento = (e: Entry) =>
    e.card_id
      ? (cartoes.find((c) => c.id === e.card_id)?.nome ?? "Cartão")
      : (contas.find((c) => c.id === e.account_id)?.nome ?? "—");

  async function excluir(id: string) {
    await supabase.from("entries").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["entries"] });
    toast.success("Lançamento excluído.");
  }

  async function duplicar(e: Entry) {
    const { id, ...resto } = e;
    void id;
    await supabase.from("entries").insert({ ...resto, descricao: `${e.descricao} (cópia)` });
    queryClient.invalidateQueries({ queryKey: ["entries"] });
    toast.success("Lançamento duplicado.");
  }

  return (
    <AppShell
      titulo="Gastos variáveis"
      subtitulo={`Lançamentos de ${periodoLabel(mes, ano)}`}
      acoes={
        <Button
          onClick={() => {
            setEditando(null);
            setDialogo(true);
          }}
        >
          <Plus className="size-4" /> Adicionar gasto
        </Button>
      }
    >
      <Painel>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-dim" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por descrição"
              className="bg-white/70 pl-9"
            />
          </div>
          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger className="w-[170px] bg-white/70">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categorias
                .filter((c) => c.tipo === "despesa")
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select value={filtroForma} onValueChange={setFiltroForma}>
            <SelectTrigger className="w-[160px] bg-white/70">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as formas</SelectItem>
              {FORMAS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="ml-auto text-sm">
            <span className="text-slate-dim">Total: </span>
            <span className="num">{brl(total)}</span>
          </div>
        </div>

        {isLoading ? (
          <Vazio texto="Carregando..." />
        ) : variaveis.length === 0 ? (
          <Vazio texto="Nenhum gasto lançado neste mês. Cadastre apenas o que você realmente gastou." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 text-left text-[11px] uppercase tracking-wide text-slate-dim">
                  <th className="py-2 pr-3 font-semibold">Descrição</th>
                  <th className="py-2 pr-3 font-semibold">Categoria</th>
                  <th className="py-2 pr-3 font-semibold">Data</th>
                  <th className="py-2 pr-3 font-semibold">Forma</th>
                  <th className="py-2 pr-3 font-semibold">Conta/cartão</th>
                  <th className="py-2 pr-3 text-right font-semibold">Valor</th>
                  <th className="py-2 pr-3 font-semibold">Situação</th>
                  <th className="py-2 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {variaveis.map((e) => (
                  <tr key={e.id} className="transition-colors hover:bg-white/60">
                    <td className="py-2.5 pr-3 font-semibold">{e.descricao}</td>
                    <td className="py-2.5 pr-3 text-slate-dim">
                      {nomeCategoria(e.category_id)}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-dim">
                      {dataBR(e.data_gasto)}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-dim">
                      {FORMAS.find((f) => f.value === e.forma_pagamento)?.label}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-dim">
                      {nomeOrigemPagamento(e)}
                    </td>
                    <td className="num py-2.5 pr-3 text-right text-sm">
                      {brl(e.valor)}
                    </td>
                    <td className="py-2.5 pr-3">
                      <Chip status={statusReal(e)} />
                    </td>
                    <td className="py-2.5">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Editar"
                          onClick={() => {
                            setEditando(e);
                            setDialogo(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Duplicar"
                          onClick={() => duplicar(e)}
                        >
                          <Copy className="size-4" />
                        </Button>
                        <BotaoExcluir onConfirm={() => excluir(e.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Painel>

      <LancamentoDialog
        aberto={dialogo}
        onOpenChange={setDialogo}
        inicial={editando}
        mes={mes}
        ano={ano}
      />
    </AppShell>
  );
}
