import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CreditCard, Pencil, Plus, Receipt } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { AppShell, Painel } from "@/components/AppShell";
import { BotaoExcluir, CardResumo, Vazio } from "@/components/Comuns";
import { CartaoDialog } from "@/components/CartaoDialog";
import { CompraCartaoDialog } from "@/components/CompraCartaoDialog";
import { Button } from "@/components/ui/button";
import { fecharFatura, pagarFatura } from "@/lib/finance";
import { brl, dataBR, hojeISO } from "@/lib/format";
import { useCartoes, useCompras, useFaturas, useLancamentos, type Cartao } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/cartoes")({
  head: () => ({
    meta: [
      { title: "Cartões de crédito — Realce" },
      { name: "description", content: "Acompanhe faturas, limites e compras parceladas." },
    ],
  }),
  component: Cartoes,
});

function Cartoes() {
  const queryClient = useQueryClient();
  const { data: cartoes = [], isLoading } = useCartoes();
  const { data: faturas = [] } = useFaturas();
  const { data: compras = [] } = useCompras();
  const { data: entries = [] } = useLancamentos();

  const [dialogoCartao, setDialogoCartao] = useState(false);
  const [editandoCartao, setEditandoCartao] = useState<Cartao | null>(null);
  const [dialogoCompra, setDialogoCompra] = useState(false);
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);

  const selecionado = cartoes.find((c) => c.id === selecionadoId) ?? cartoes[0] ?? null;

  const faturasDoCartao = useMemo(
    () =>
      selecionado
        ? faturas
            .filter((f) => f.card_id === selecionado.id)
            .sort((a, b) => (a.ano_ref !== b.ano_ref ? b.ano_ref - a.ano_ref : b.mes_ref - a.mes_ref))
        : [],
    [faturas, selecionado],
  );

  const totalFatura = (invoiceId: string) =>
    entries.filter((e) => e.invoice_id === invoiceId).reduce((s, e) => s + Number(e.valor), 0);

  const limiteUtilizado = useMemo(() => {
    if (!selecionado) return 0;
    return entries
      .filter((e) => e.card_id === selecionado.id && e.status !== "pago")
      .reduce((s, e) => s + Number(e.valor), 0);
  }, [entries, selecionado]);

  const comprasParceladasFuturas = useMemo(() => {
    if (!selecionado) return 0;
    return entries
      .filter(
        (e) =>
          e.card_id === selecionado.id &&
          e.parcela_num &&
          e.parcela_total &&
          e.parcela_num < e.parcela_total &&
          e.status !== "pago",
      )
      .reduce((s, e) => s + Number(e.valor), 0);
  }, [entries, selecionado]);

  const comprasDoCartao = useMemo(
    () =>
      selecionado
        ? compras
            .filter((c: { card_id: string }) => c.card_id === selecionado.id)
            .slice(0, 8)
        : [],
    [compras, selecionado],
  );

  async function excluirCartao(id: string) {
    await supabase.from("cards").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["cards"] });
    if (selecionadoId === id) setSelecionadoId(null);
    toast.success("Cartão excluído.");
  }

  async function aoFecharFatura(id: string) {
    await fecharFatura(id);
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    toast.success("Fatura fechada.");
  }

  async function aoPagarFatura(id: string) {
    await pagarFatura(id, hojeISO());
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    queryClient.invalidateQueries({ queryKey: ["entries"] });
    toast.success("Fatura marcada como paga.");
  }

  return (
    <AppShell
      titulo="Cartões de crédito"
      subtitulo="Faturas, limites e compras parceladas"
      acoes={
        <Button
          onClick={() => {
            setEditandoCartao(null);
            setDialogoCartao(true);
          }}
        >
          <Plus className="size-4" /> Novo cartão
        </Button>
      }
    >
      {isLoading ? (
        <Vazio texto="Carregando..." />
      ) : cartoes.length === 0 ? (
        <Painel>
          <Vazio texto="Nenhum cartão cadastrado." />
        </Painel>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {cartoes.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelecionadoId(c.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                  selecionado?.id === c.id ? "text-white" : "glass text-ink/80 hover:bg-white/70"
                }`}
                style={selecionado?.id === c.id ? { background: c.cor } : undefined}
              >
                <CreditCard className="size-4" />
                {c.nome}
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
                      setEditandoCartao(selecionado);
                      setDialogoCartao(true);
                    }}
                  >
                    <Pencil className="size-4" /> Editar cartão
                  </Button>
                  <BotaoExcluir
                    onConfirm={() => excluirCartao(selecionado.id)}
                    descricao="Este cartão e suas faturas serão removidos."
                  />
                </div>
                <Button onClick={() => setDialogoCompra(true)}>
                  <Receipt className="size-4" /> Nova compra
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <CardResumo titulo="Limite total" valor={selecionado.limite_total} />
                <CardResumo titulo="Limite utilizado" valor={limiteUtilizado} tom="negativo" />
                <CardResumo
                  titulo="Limite disponível"
                  valor={Math.max(selecionado.limite_total - limiteUtilizado, 0)}
                  tom="positivo"
                />
                <CardResumo titulo="Parcelas futuras" valor={comprasParceladasFuturas} tom="alerta" />
              </div>

              <Painel
                titulo="Faturas"
                descricao={`Fechamento dia ${selecionado.dia_fechamento} · Vencimento dia ${selecionado.dia_vencimento}`}
              >
                {faturasDoCartao.length === 0 ? (
                  <Vazio texto="Nenhuma fatura gerada ainda. Registre uma compra para criar a primeira." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-black/5 text-left text-[11px] uppercase tracking-wide text-slate-dim">
                          <th className="py-2 pr-3 font-semibold">Período</th>
                          <th className="py-2 pr-3 font-semibold">Vencimento</th>
                          <th className="py-2 pr-3 text-right font-semibold">Total</th>
                          <th className="py-2 pr-3 font-semibold">Status</th>
                          <th className="py-2 font-semibold"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {faturasDoCartao.map((f) => (
                          <tr key={f.id} className="transition-colors hover:bg-white/60">
                            <td className="py-2.5 pr-3 font-semibold">
                              {String(f.mes_ref).padStart(2, "0")}/{f.ano_ref}
                            </td>
                            <td className="py-2.5 pr-3 text-slate-dim">{dataBR(f.data_vencimento)}</td>
                            <td className="num py-2.5 pr-3 text-right">{brl(totalFatura(f.id))}</td>
                            <td className="py-2.5 pr-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                  f.status === "paga"
                                    ? "bg-mint/15 text-mint"
                                    : f.status === "fechada"
                                      ? "bg-amber-glow/15 text-amber-glow"
                                      : "bg-black/5 text-slate-dim"
                                }`}
                              >
                                {f.status === "paga" ? "Paga" : f.status === "fechada" ? "Fechada" : "Aberta"}
                              </span>
                            </td>
                            <td className="py-2.5">
                              <div className="flex justify-end gap-2">
                                {f.status === "aberta" && (
                                  <Button variant="outline" size="sm" onClick={() => aoFecharFatura(f.id)}>
                                    Fechar fatura
                                  </Button>
                                )}
                                {f.status !== "paga" && (
                                  <Button size="sm" onClick={() => aoPagarFatura(f.id)}>
                                    Marcar como paga
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Painel>

              <Painel titulo="Compras recentes">
                {comprasDoCartao.length === 0 ? (
                  <Vazio texto="Nenhuma compra registrada." />
                ) : (
                  <ul className="divide-y divide-black/5 text-sm">
                    {comprasDoCartao.map((c: any) => (
                      <li key={c.id} className="flex items-center justify-between gap-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{c.descricao}</p>
                          <p className="text-xs text-slate-dim">
                            {dataBR(c.data_compra)} · {c.parcelas}x
                          </p>
                        </div>
                        <span className="num shrink-0 text-sm">{brl(c.valor_total)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Painel>
            </>
          )}
        </div>
      )}

      <CartaoDialog aberto={dialogoCartao} onOpenChange={setDialogoCartao} inicial={editandoCartao} />
      <CompraCartaoDialog aberto={dialogoCompra} onOpenChange={setDialogoCompra} cartao={selecionado} />
    </AppShell>
  );
}
