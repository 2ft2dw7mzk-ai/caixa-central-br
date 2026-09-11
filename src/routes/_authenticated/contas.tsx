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
import { TIPOS_CONTA } from "@/lib/finance";
import { brl } from "@/lib/format";
import { useContas, type Conta } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/contas")({
  head: () => ({
    meta: [
      { title: "Contas e formas de pagamento — Realce" },
      { name: "description", content: "Cadastre suas contas bancárias e meios de pagamento." },
    ],
  }),
  component: Contas,
});

function ContaDialog({
  aberto,
  onOpenChange,
  inicial,
}: {
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
  inicial?: Conta | null;
}) {
  const queryClient = useQueryClient();
  const vazio = { nome: "", tipo: "conta_bancaria", instituicao: "", saldo_inicial: "0", ativo: true };
  const [form, setForm] = useState(vazio);

  useEffect(() => {
    if (!aberto) return;
    if (inicial) {
      setForm({
        nome: inicial.nome,
        tipo: inicial.tipo,
        instituicao: inicial.instituicao ?? "",
        saldo_inicial: String(inicial.saldo_inicial),
        ativo: inicial.ativo,
      });
    } else {
      setForm(vazio);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, inicial]);

  async function salvar() {
    if (!form.nome.trim()) {
      toast.error("Informe o nome.");
      return;
    }
    const registro = {
      nome: form.nome.trim(),
      tipo: form.tipo as
        | "conta_bancaria"
        | "carteira"
        | "pix"
        | "debito"
        | "credito"
        | "boleto"
        | "transferencia",
      instituicao: form.instituicao || null,
      saldo_inicial: Number(form.saldo_inicial) || 0,
      ativo: form.ativo,
    };
    const { error } = inicial
      ? await supabase.from("accounts").update(registro).eq("id", inicial.id)
      : await supabase.from("accounts").insert(registro);
    if (error) {
      toast.error("Não foi possível salvar.");
      return;
    }
    toast.success(inicial ? "Conta atualizada." : "Conta cadastrada.");
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
    onOpenChange(false);
  }

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{inicial ? "Editar conta" : "Nova conta"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Campo label="Nome">
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Campo>
          <Campo label="Tipo">
            <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_CONTA.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>
          <Campo label="Banco ou instituição">
            <Input
              value={form.instituicao}
              onChange={(e) => setForm({ ...form, instituicao: e.target.value })}
            />
          </Campo>
          <Campo label="Saldo inicial (opcional)">
            <Input
              type="number"
              step="0.01"
              value={form.saldo_inicial}
              onChange={(e) => setForm({ ...form, saldo_inicial: e.target.value })}
            />
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

function Contas() {
  const queryClient = useQueryClient();
  const { data: contas = [], isLoading } = useContas();
  const [dialogo, setDialogo] = useState(false);
  const [editando, setEditando] = useState<Conta | null>(null);

  async function excluir(id: string) {
    await supabase.from("accounts").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
    toast.success("Conta excluída.");
  }

  return (
    <AppShell
      titulo="Contas e formas de pagamento"
      subtitulo="Suas contas bancárias, carteiras e meios de pagamento"
      acoes={
        <Button
          onClick={() => {
            setEditando(null);
            setDialogo(true);
          }}
        >
          <Plus className="size-4" /> Nova conta
        </Button>
      }
    >
      <Painel>
        {isLoading ? (
          <Vazio texto="Carregando..." />
        ) : contas.length === 0 ? (
          <Vazio texto="Nenhuma conta cadastrada." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 text-left text-[11px] uppercase tracking-wide text-slate-dim">
                  <th className="py-2 pr-3 font-semibold">Nome</th>
                  <th className="py-2 pr-3 font-semibold">Tipo</th>
                  <th className="py-2 pr-3 font-semibold">Instituição</th>
                  <th className="py-2 pr-3 text-right font-semibold">Saldo inicial</th>
                  <th className="py-2 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {contas.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-white/60">
                    <td className="py-2.5 pr-3 font-semibold">{c.nome}</td>
                    <td className="py-2.5 pr-3 text-slate-dim">
                      {TIPOS_CONTA.find((t) => t.value === c.tipo)?.label ?? c.tipo}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-dim">{c.instituicao ?? "—"}</td>
                    <td className="num py-2.5 pr-3 text-right">{brl(c.saldo_inicial)}</td>
                    <td className="py-2.5">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Editar"
                          onClick={() => {
                            setEditando(c);
                            setDialogo(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <BotaoExcluir onConfirm={() => excluir(c.id)} descricao="Esta conta será removida." />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Painel>

      <ContaDialog aberto={dialogo} onOpenChange={setDialogo} inicial={editando} />
    </AppShell>
  );
}
