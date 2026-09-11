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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Campo } from "@/components/Comuns";
import { STATUS_PROJETO } from "@/lib/finance";
import type { Projeto } from "@/lib/queries";

export function ProjetoDialog({
  aberto,
  onOpenChange,
  inicial,
}: {
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
  inicial?: Projeto | null;
}) {
  const queryClient = useQueryClient();
  const vazio = {
    nome: "",
    descricao: "",
    data_inicio: "",
    data_fim: "",
    orcamento: "",
    status: "planejando" as Projeto["status"],
    observacoes: "",
  };
  const [form, setForm] = useState(vazio);

  useEffect(() => {
    if (!aberto) return;
    if (inicial) {
      setForm({
        nome: inicial.nome,
        descricao: inicial.descricao ?? "",
        data_inicio: inicial.data_inicio ?? "",
        data_fim: inicial.data_fim ?? "",
        orcamento: String(inicial.orcamento),
        status: inicial.status,
        observacoes: inicial.observacoes ?? "",
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
      descricao: form.descricao || null,
      data_inicio: form.data_inicio || null,
      data_fim: form.data_fim || null,
      orcamento: Number(form.orcamento) || 0,
      status: form.status,
      observacoes: form.observacoes || null,
    };
    const { error } = inicial
      ? await supabase.from("projects").update(registro).eq("id", inicial.id)
      : await supabase.from("projects").insert(registro);
    if (error) {
      toast.error("Não foi possível salvar.");
      return;
    }
    toast.success(inicial ? "Projeto atualizado." : "Projeto criado.");
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    onOpenChange(false);
  }

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{inicial ? "Editar viagem/projeto" : "Nova viagem/projeto"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Campo label="Nome">
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </Campo>
          </div>
          <div className="sm:col-span-2">
            <Campo label="Destino ou descrição">
              <Input
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </Campo>
          </div>
          <Campo label="Data inicial">
            <Input
              type="date"
              value={form.data_inicio}
              onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
            />
          </Campo>
          <Campo label="Data final">
            <Input
              type="date"
              value={form.data_fim}
              onChange={(e) => setForm({ ...form, data_fim: e.target.value })}
            />
          </Campo>
          <Campo label="Orçamento planejado (R$)">
            <Input
              type="number"
              step="0.01"
              value={form.orcamento}
              onChange={(e) => setForm({ ...form, orcamento: e.target.value })}
            />
          </Campo>
          <Campo label="Status">
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as Projeto["status"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_PROJETO.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>
          <div className="sm:col-span-2">
            <Campo label="Observações">
              <Textarea
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              />
            </Campo>
          </div>
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
