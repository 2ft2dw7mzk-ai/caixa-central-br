import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { AppShell, Painel } from "@/components/AppShell";
import { BotaoExcluir, Campo, Vazio } from "@/components/Comuns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MESES, brl, dataBR, hojeISO, periodoLabel } from "@/lib/format";
import { useContas, useReceitas, type Receita } from "@/lib/queries";
import { usePeriodo } from "@/hooks/usePeriodo";

export const Route = createFileRoute("/_authenticated/receitas")({
  head: () => ({
    meta: [
      { title: "Receitas — Realce" },
      { name: "description", content: "Cadastre suas receitas do mês." },
    ],
  }),
  component: Receitas,
});

const NENHUM = "__nenhum__";

function ReceitaDialog({
  aberto,
  onOpenChange,
  inicial,
  mes,
  ano,
}: {
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
  inicial?: Receita | null;
  mes: number;
  ano: number;
}) {
  const queryClient = useQueryClient();
  const { data: contas = [] } = useContas();
  const vazio = {
    descricao: "",
    valor: "",
    data_recebimento: hojeISO(),
    mes_ref: String(mes),
    ano_ref: String(ano),
    categoria: "",
    account_id: NENHUM,
    recebido: true,
  };
  const [form, setForm] = useState(vazio);

  useEffect(() => {
    if (!aberto) return;
    if (inicial) {
      setForm({
        descricao: inicial.descricao,
        valor: String(inicial.valor),
        data_recebimento: inicial.data_recebimento ?? hojeISO(),
        mes_ref: String(inicial.mes_ref),
        ano_ref: String(inicial.ano_ref),
        categoria: inicial.categoria ?? "",
        account_id: inicial.account_id ?? NENHUM,
        recebido: inicial.recebido,
      });
    } else {
      setForm({ ...vazio, mes_ref: String(mes), ano_ref: String(ano) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, inicial, mes, ano]);

  async function salvar() {
    if (!form.descricao.trim()) {
      toast.error("Informe a descrição.");
      return;
    }
    const registro = {
      descricao: form.descricao.trim(),
      valor: Number(form.valor) || 0,
      data_recebimento: form.data_recebimento || null,
      mes_ref: Number(form.mes_ref),
      ano_ref: Number(form.ano_ref),
      categoria: form.categoria || null,
      account_id: form.account_id === NENHUM ? null : form.account_id,
      recebido: form.recebido,
    };
    const { error } = inicial
      ? await supabase.from("incomes").update(registro).eq("id", inicial.id)
      : await supabase.from("incomes").insert(registro);
    if (error) {
      toast.error("Não foi possível salvar.");
      return;
    }
    toast.success(inicial ? "Receita atualizada." : "Receita cadastrada.");
    queryClient.invalidateQueries({ queryKey: ["incomes"] });
    onOpenChange(false);
  }

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{inicial ? "Editar receita" : "Nova receita"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Campo label="Descrição">
              <Input
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </Campo>
          </div>
          <Campo label="Valor (R$)">
            <Input
              type="number"
              step="0.01"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
            />
          </Campo>
          <Campo label="Data de recebimento">
            <Input
              type="date"
              value={form.data_recebimento}
              onChange={(e) => setForm({ ...form, data_recebimento: e.target.value })}
            />
          </Campo>
          <Campo label="Mês de referência">
            <Select value={form.mes_ref} onValueChange={(v) => setForm({ ...form, mes_ref: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MESES.map((m, i) => (
                  <SelectItem key={m} value={String(i + 1)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>
          <Campo label="Ano de referência">
            <Input
              type="number"
              value={form.ano_ref}
              onChange={(e) => setForm({ ...form, ano_ref: e.target.value })}
            />
          </Campo>
          <Campo label="Categoria da receita">
            <Input
              value={form.categoria}
              placeholder="Salário, extra..."
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            />
          </Campo>
          <Campo label="Conta de recebimento">
            <Select
              value={form.account_id}
              onValueChange={(v) => setForm({ ...form, account_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NENHUM}>Sem conta</SelectItem>
                {contas.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>
          <Campo label="Situação">
            <Select
              value={form.recebido ? "recebido" : "pendente"}
              onValueChange={(v) => setForm({ ...form, recebido: v === "recebido" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recebido">Recebido</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </Campo>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={salvar}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Receitas() {
  const { mes, ano } = usePeriodo();
  const queryClient = useQueryClient();
  const { data: receitas = [], isLoading } = useReceitas(mes, ano);
  const { data: contas = [] } = useContas();
  const [dialogo, setDialogo] = useState(false);
  const [editando, setEditando] = useState<Receita | null>(null);

  const total = receitas.reduce((s, r) => s + Number(r.valor), 0);

  async function excluir(id: string) {
    await supabase.from("incomes").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["incomes"] });
    toast.success("Receita excluída.");
  }

  return (
    <AppShell
      titulo="Receitas"
      subtitulo={`Receitas de ${periodoLabel(mes, ano)}`}
      acoes={
        <Button
          onClick={() => {
            setEditando(null);
            setDialogo(true);
          }}
        >
          <Plus className="size-4" /> Nova receita
        </Button>
      }
    >
      <Painel>
        <div className="mb-4 text-right text-sm">
          <span className="text-slate-dim">Total: </span>
          <span className="num">{brl(total)}</span>
        </div>
        {isLoading ? (
          <Vazio texto="Carregando..." />
        ) : receitas.length === 0 ? (
          <Vazio texto="Nenhuma receita cadastrada neste mês." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 text-left text-[11px] uppercase tracking-wide text-slate-dim">
                  <th className="py-2 pr-3 font-semibold">Descrição</th>
                  <th className="py-2 pr-3 font-semibold">Categoria</th>
                  <th className="py-2 pr-3 font-semibold">Recebimento</th>
                  <th className="py-2 pr-3 font-semibold">Conta</th>
                  <th className="py-2 pr-3 text-right font-semibold">Valor</th>
                  <th className="py-2 pr-3 font-semibold">Situação</th>
                  <th className="py-2 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {receitas.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-white/60">
                    <td className="py-2.5 pr-3 font-semibold">{r.descricao}</td>
                    <td className="py-2.5 pr-3 text-slate-dim">{r.categoria ?? "—"}</td>
                    <td className="py-2.5 pr-3 text-slate-dim">{dataBR(r.data_recebimento)}</td>
                    <td className="py-2.5 pr-3 text-slate-dim">
                      {contas.find((c) => c.id === r.account_id)?.nome ?? "—"}
                    </td>
                    <td className="num py-2.5 pr-3 text-right">{brl(r.valor)}</td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          r.recebido ? "bg-mint/15 text-mint" : "bg-amber-glow/15 text-amber-glow"
                        }`}
                      >
                        {r.recebido ? "Recebido" : "Pendente"}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Editar"
                          onClick={() => {
                            setEditando(r);
                            setDialogo(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <BotaoExcluir onConfirm={() => excluir(r.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Painel>

      <ReceitaDialog aberto={dialogo} onOpenChange={setDialogo} inicial={editando} mes={mes} ano={ano} />
    </AppShell>
  );
}
