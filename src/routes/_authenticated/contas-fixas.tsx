import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pause, Pencil, Play, Plus } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { AppShell, Painel } from "@/components/AppShell";
import { AjusteLancamentoDialog } from "@/components/AjusteLancamentoDialog";
import { BotaoExcluir, Chip, Vazio } from "@/components/Comuns";
import { ContaFixaDialog } from "@/components/ContaFixaDialog";
import { Button } from "@/components/ui/button";
import { gerarLancamentosFixos, statusReal, type Entry } from "@/lib/finance";
import { brl, dataBR, periodoLabel } from "@/lib/format";
import { useCategorias, useContasFixas, useLancamentos, type ContaFixa } from "@/lib/queries";
import { usePeriodo } from "@/hooks/usePeriodo";

export const Route = createFileRoute("/_authenticated/contas-fixas")({
  head: () => ({
    meta: [
      { title: "Contas fixas — Realce" },
      { name: "description", content: "Cadastre e acompanhe suas contas recorrentes." },
    ],
  }),
  component: ContasFixas,
});

function ContasFixas() {
  const { mes, ano } = usePeriodo();
  const queryClient = useQueryClient();
  const { data: bills = [], isLoading: carregandoBills } = useContasFixas();
  const { data: lancamentos = [], isLoading: carregandoEntries } = useLancamentos(mes, ano);
  const { data: categorias = [] } = useCategorias();

  const [dialogoConta, setDialogoConta] = useState(false);
  const [editandoConta, setEditandoConta] = useState<ContaFixa | null>(null);
  const [dialogoAjuste, setDialogoAjuste] = useState(false);
  const [ajustando, setAjustando] = useState<Entry | null>(null);
  const [gerando, setGerando] = useState(false);

  const entradasFixas = lancamentos.filter((e) => e.origem === "fixa");
  const nomeCategoria = (id: string | null) =>
    categorias.find((c) => c.id === id)?.nome ?? "—";

  async function gerar() {
    setGerando(true);
    try {
      const n = await gerarLancamentosFixos(mes, ano);
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      toast.success(n > 0 ? `${n} lançamento(s) gerado(s).` : "Nenhum lançamento novo para este mês.");
    } finally {
      setGerando(false);
    }
  }

  async function alternarAtivo(bill: ContaFixa) {
    await supabase.from("fixed_bills").update({ ativo: !bill.ativo }).eq("id", bill.id);
    queryClient.invalidateQueries({ queryKey: ["fixed_bills"] });
  }

  async function excluirConta(id: string) {
    await supabase.from("fixed_bills").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["fixed_bills"] });
    toast.success("Conta fixa excluída.");
  }

  return (
    <AppShell
      titulo="Contas fixas"
      subtitulo={`Lançamentos de ${periodoLabel(mes, ano)}`}
      acoes={
        <>
          <Button variant="outline" onClick={gerar} disabled={gerando}>
            {gerando ? "Gerando..." : "Gerar lançamentos do mês"}
          </Button>
          <Button
            onClick={() => {
              setEditandoConta(null);
              setDialogoConta(true);
            }}
          >
            <Plus className="size-4" /> Nova conta fixa
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <Painel titulo="Lançamentos do mês" descricao="Gerados a partir das contas fixas ativas.">
          {carregandoEntries ? (
            <Vazio texto="Carregando..." />
          ) : entradasFixas.length === 0 ? (
            <Vazio texto="Nenhum lançamento neste mês. Clique em “Gerar lançamentos do mês”." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-left text-[11px] uppercase tracking-wide text-slate-dim">
                    <th className="py-2 pr-3 font-semibold">Conta</th>
                    <th className="py-2 pr-3 font-semibold">Categoria</th>
                    <th className="py-2 pr-3 font-semibold">Vencimento</th>
                    <th className="py-2 pr-3 text-right font-semibold">Valor</th>
                    <th className="py-2 pr-3 font-semibold">Situação</th>
                    <th className="py-2 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {entradasFixas.map((e) => (
                    <tr key={e.id} className="transition-colors hover:bg-white/60">
                      <td className="py-2.5 pr-3 font-semibold">{e.descricao}</td>
                      <td className="py-2.5 pr-3 text-slate-dim">{nomeCategoria(e.category_id)}</td>
                      <td className="py-2.5 pr-3 text-slate-dim">{dataBR(e.data_vencimento)}</td>
                      <td className="num py-2.5 pr-3 text-right">{brl(e.valor)}</td>
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
                              setAjustando(e);
                              setDialogoAjuste(true);
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Painel>

        <Painel titulo="Contas fixas cadastradas">
          {carregandoBills ? (
            <Vazio texto="Carregando..." />
          ) : bills.length === 0 ? (
            <Vazio texto="Nenhuma conta fixa cadastrada." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-left text-[11px] uppercase tracking-wide text-slate-dim">
                    <th className="py-2 pr-3 font-semibold">Nome</th>
                    <th className="py-2 pr-3 font-semibold">Categoria</th>
                    <th className="py-2 pr-3 font-semibold">Frequência</th>
                    <th className="py-2 pr-3 font-semibold">Dia</th>
                    <th className="py-2 pr-3 text-right font-semibold">Valor previsto</th>
                    <th className="py-2 pr-3 font-semibold">Status</th>
                    <th className="py-2 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {bills.map((b) => (
                    <tr key={b.id} className="transition-colors hover:bg-white/60">
                      <td className="py-2.5 pr-3 font-semibold">{b.nome}</td>
                      <td className="py-2.5 pr-3 text-slate-dim">{nomeCategoria(b.category_id)}</td>
                      <td className="py-2.5 pr-3 text-slate-dim capitalize">{b.frequencia}</td>
                      <td className="py-2.5 pr-3 text-slate-dim">{b.dia_vencimento}</td>
                      <td className="num py-2.5 pr-3 text-right">{brl(b.valor_previsto)}</td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            b.ativo ? "bg-mint/15 text-mint" : "bg-black/5 text-slate-dim"
                          }`}
                        >
                          {b.ativo ? "Ativa" : "Pausada"}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={b.ativo ? "Pausar" : "Reativar"}
                            onClick={() => alternarAtivo(b)}
                          >
                            {b.ativo ? <Pause className="size-4" /> : <Play className="size-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Editar"
                            onClick={() => {
                              setEditandoConta(b);
                              setDialogoConta(true);
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <BotaoExcluir
                            onConfirm={() => excluirConta(b.id)}
                            descricao="Esta conta fixa será removida. Lançamentos já gerados não são afetados."
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Painel>
      </div>

      <ContaFixaDialog aberto={dialogoConta} onOpenChange={setDialogoConta} inicial={editandoConta} />
      <AjusteLancamentoDialog
        aberto={dialogoAjuste}
        onOpenChange={setDialogoAjuste}
        entrada={ajustando}
      />
    </AppShell>
  );
}
