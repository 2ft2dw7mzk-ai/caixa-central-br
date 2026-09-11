import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Campo } from "@/components/Comuns";
import type { Cartao } from "@/lib/queries";

const CORES: string[] = ["#0b1220", "#38bdf8", "#a78bfa", "#34d399", "#fbbf24", "#fb7185", "#f472b6", "#818cf8"];
const COR_PADRAO = CORES[0]!;

export function CartaoDialog({
  aberto,
  onOpenChange,
  inicial,
}: {
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
  inicial?: Cartao | null;
}) {
  const queryClient = useQueryClient();
  const vazio = {
    nome: "",
    emissor: "",
    limite_total: "",
    dia_fechamento: "28",
    dia_vencimento: "10",
    cor: COR_PADRAO,
  };
  const [form, setForm] = useState(vazio);

  useEffect(() => {
    if (!aberto) return;
    if (inicial) {
      setForm({
        nome: inicial.nome,
        emissor: inicial.emissor ?? "",
        limite_total: String(inicial.limite_total),
        dia_fechamento: String(inicial.dia_fechamento),
        dia_vencimento: String(inicial.dia_vencimento),
        cor: inicial.cor,
      });
    } else {
      setForm(vazio);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, inicial]);

  async function salvar() {
    if (!form.nome.trim()) {
      toast.error("Informe o nome do cartão.");
      return;
    }
    const registro = {
      nome: form.nome.trim(),
      emissor: form.emissor || null,
      limite_total: Number(form.limite_total) || 0,
      dia_fechamento: Number(form.dia_fechamento) || 1,
      dia_vencimento: Number(form.dia_vencimento) || 1,
      cor: form.cor,
    };
    const { error } = inicial
      ? await supabase.from("cards").update(registro).eq("id", inicial.id)
      : await supabase.from("cards").insert(registro);
    if (error) {
      toast.error("Não foi possível salvar.");
      return;
    }
    toast.success(inicial ? "Cartão atualizado." : "Cartão cadastrado.");
    queryClient.invalidateQueries({ queryKey: ["cards"] });
    onOpenChange(false);
  }

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{inicial ? "Editar cartão" : "Novo cartão"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Campo label="Nome do cartão">
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Campo>
          <Campo label="Banco/emissor">
            <Input
              value={form.emissor}
              onChange={(e) => setForm({ ...form, emissor: e.target.value })}
            />
          </Campo>
          <Campo label="Limite total (R$)">
            <Input
              type="number"
              step="0.01"
              value={form.limite_total}
              onChange={(e) => setForm({ ...form, limite_total: e.target.value })}
            />
          </Campo>
          <div className="grid grid-cols-2 gap-4">
            <Campo label="Dia de fechamento">
              <Input
                type="number"
                min="1"
                max="31"
                value={form.dia_fechamento}
                onChange={(e) => setForm({ ...form, dia_fechamento: e.target.value })}
              />
            </Campo>
            <Campo label="Dia de vencimento">
              <Input
                type="number"
                min="1"
                max="31"
                value={form.dia_vencimento}
                onChange={(e) => setForm({ ...form, dia_vencimento: e.target.value })}
              />
            </Campo>
          </div>
          <Campo label="Cor">
            <div className="flex flex-wrap gap-2">
              {CORES.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setForm({ ...form, cor })}
                  className={`size-7 rounded-full ${form.cor === cor ? "ring-2 ring-offset-2 ring-ink" : ""}`}
                  style={{ background: cor }}
                  aria-label={cor}
                />
              ))}
            </div>
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
