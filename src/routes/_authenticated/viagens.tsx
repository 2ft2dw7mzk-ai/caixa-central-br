import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { AppShell, Painel } from "@/components/AppShell";
import { BotaoExcluir, CardResumo, Vazio } from "@/components/Comuns";
import { LancamentoDialog } from "@/components/LancamentoDialog";
import { ProjetoDialog } from "@/components/ProjetoDialog";
import { Button } from "@/components/ui/button";
import { STATUS_PROJETO } from "@/lib/finance";
import { brl, dataBR } from "@/lib/format";
import { useCategorias, useLancamentos, useProjetos, type Projeto } from "@/lib/queries";
import { usePeriodo } from "@/hooks/usePeriodo";

export const Route = createFileRoute("/_authenticated/viagens")({
  head: () => ({
    meta: [
      { title: "Viagens e projetos — Realce" },
      { name: "description", content: "Controle o orçamento de viagens e projetos." },
    ],
  }),
  component: Viagens,
});

function Viagens() {
  const { mes, ano } = usePeriodo();
  const queryClient = useQueryClient();
  const { data: projetos = [], isLoading } = useProjetos();
  const { data: todos = [] } = useLancamentos();
  const { data: categorias = [] } = useCategorias();

  const [dialogoProjeto, setDialogoProjeto] = useState(false);
  const [editandoProjeto, setEditandoProjeto] = useState<Projeto | null>(null);
  const [dialogoGasto, setDialogoGasto] = useState(false);
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);

  const comGasto = useMemo(
    () =>
      projetos.map((p) => {
        const despesas = todos.filter((e) => e.project_id === p.id);
        const gasto = despesas.reduce((s, e) => s + Number(e.valor), 0);
        return { ...p, despesas, gasto, percentual: p.orcamento > 0 ? (gasto / p.orcamento) * 100 : 0 };
      }),
    [projetos, todos],
  );

  const selecionado = comGasto.find((p) => p.id === selecionadoId) ?? null;

  const porCategoria = useMemo(() => {
    if (!selecionado) return [];
    const mapa = new Map<string, number>();
    selecionado.despesas.forEach((e) => {
      const nome = categorias.find((c) => c.id === e.category_id)?.nome ?? "Sem categoria";
      mapa.set(nome, (mapa.get(nome) ?? 0) + Number(e.valor));
    });
    return Array.from(mapa.entries()).sort((a, b) => b[1] - a[1]);
  }, [selecionado, categorias]);

  async function excluir(id: string) {
    await supabase.from("projects").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    if (selecionadoId === id) setSelecionadoId(null);
    toast.success("Projeto excluído.");
  }

  return (
    <AppShell
      titulo="Viagens e projetos"
      subtitulo="Controle o orçamento de viagens e projetos com orçamento próprio"
      acoes={
        <Button
          onClick={() => {
            setEditandoProjeto(null);
            setDialogoProjeto(true);
          }}
        >
          <Plus className="size-4" /> Nova viagem/projeto
        </Button>
      }
    >
      {isLoading ? (
        <Vazio texto="Carregando..." />
      ) : comGasto.length === 0 ? (
        <Painel>
          <Vazio texto="Nenhuma viagem ou projeto cadastrado." />
        </Painel>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {comGasto.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelecionadoId(p.id)}
                className={`glass rounded-2xl p-4 text-left transition-transform hover:-translate-y-0.5 ${
                  selecionado?.id === p.id ? "ring-2 ring-ink" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display font-bold">{p.nome}</p>
                  <span className="inline-flex items-center rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-semibold text-slate-dim">
                    {STATUS_PROJETO.find((s) => s.value === p.status)?.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-dim">{p.descricao}</p>
                <p className="num mt-2 text-lg">
                  {brl(p.gasto)} <span className="text-xs text-slate-dim">/ {brl(p.orcamento)}</span>
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
                  <div
                    className={`h-full rounded-full ${p.percentual > 100 ? "bg-coral" : "bg-mint"}`}
                    style={{ width: `${Math.min(p.percentual, 100)}%` }}
                  />
                </div>
              </button>
            ))}
          </div>

          {selecionado && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditandoProjeto(selecionado);
                      setDialogoProjeto(true);
                    }}
                  >
                    <Pencil className="size-4" /> Editar
                  </Button>
                  <BotaoExcluir
                    onConfirm={() => excluir(selecionado.id)}
                    descricao="Este projeto será removido. Os lançamentos ficam sem viagem/projeto vinculado."
                  />
                </div>
                <Button onClick={() => setDialogoGasto(true)}>
                  <Plus className="size-4" /> Adicionar despesa
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <CardResumo titulo="Orçamento planejado" valor={selecionado.orcamento} />
                <CardResumo titulo="Total gasto" valor={selecionado.gasto} tom="negativo" />
                <CardResumo
                  titulo="Saldo restante"
                  valor={selecionado.orcamento - selecionado.gasto}
                  tom={selecionado.orcamento - selecionado.gasto >= 0 ? "positivo" : "negativo"}
                />
                <CardResumo
                  titulo="% do orçamento utilizado"
                  valor={`${selecionado.percentual.toFixed(0)}%`}
                  tom={selecionado.percentual > 100 ? "negativo" : "neutro"}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Painel titulo="Gastos por categoria">
                  {porCategoria.length === 0 ? (
                    <Vazio texto="Nenhuma despesa lançada." />
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

                <Painel titulo="Lista de despesas">
                  {selecionado.despesas.length === 0 ? (
                    <Vazio texto="Nenhuma despesa lançada." />
                  ) : (
                    <ul className="divide-y divide-black/5 text-sm">
                      {selecionado.despesas.map((e) => (
                        <li key={e.id} className="flex items-center justify-between gap-3 py-2">
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{e.descricao}</p>
                            <p className="text-xs text-slate-dim">{dataBR(e.data_gasto)}</p>
                          </div>
                          <span className="num shrink-0">{brl(e.valor)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Painel>
              </div>
            </>
          )}
        </div>
      )}

      <ProjetoDialog aberto={dialogoProjeto} onOpenChange={setDialogoProjeto} inicial={editandoProjeto} />
      {selecionado && (
        <LancamentoDialog
          aberto={dialogoGasto}
          onOpenChange={setDialogoGasto}
          mes={mes}
          ano={ano}
          projetoFixo={selecionado.id}
        />
      )}
    </AppShell>
  );
}
