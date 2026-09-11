import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
import { registrarCompraCartao } from "@/lib/finance";
import { hojeISO } from "@/lib/format";
import { useCategorias, useProjetos, type Cartao } from "@/lib/queries";

const NENHUM = "__nenhum__";

export function CompraCartaoDialog({
  aberto,
  onOpenChange,
  cartao,
}: {
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
  cartao: Cartao | null;
}) {
  const queryClient = useQueryClient();
  const { data: categorias = [] } = useCategorias();
  const { data: projetos = [] } = useProjetos();

  const vazio = {
    descricao: "",
    data_compra: hojeISO(),
    valor_total: "",
    parcelas: "1",
    category_id: NENHUM,
    project_id: NENHUM,
    observacoes: "",
  };
  const [form, setForm] = useState(vazio);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (aberto) setForm(vazio);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  async function salvar() {
    if (!cartao) return;
    if (!form.descricao.trim()) {
      toast.error("Informe a descrição.");
      return;
    }
    const valor = Number(form.valor_total) || 0;
    if (valor <= 0) {
      toast.error("Informe o valor da compra.");
      return;
    }
    setSalvando(true);
    try {
      await registrarCompraCartao({
        card: cartao,
        descricao: form.descricao.trim(),
        data_compra: form.data_compra,
        valor_total: valor,
        parcelas: Number(form.parcelas) || 1,
        category_id: form.category_id === NENHUM ? null : form.category_id,
        project_id: form.project_id === NENHUM ? null : form.project_id,
        observacoes: form.observacoes || null,
      });
      toast.success("Compra registrada.");
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["card_purchases"] });
      onOpenChange(false);
    } catch {
      toast.error("Não foi possível registrar a compra.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova compra — {cartao?.nome}</DialogTitle>
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
          <Campo label="Data da compra">
            <Input
              type="date"
              value={form.data_compra}
              onChange={(e) => setForm({ ...form, data_compra: e.target.value })}
            />
          </Campo>
          <Campo label="Valor total (R$)">
            <Input
              type="number"
              step="0.01"
              value={form.valor_total}
              onChange={(e) => setForm({ ...form, valor_total: e.target.value })}
            />
          </Campo>
          <Campo label="Número de parcelas">
            <Input
              type="number"
              min="1"
              max="48"
              value={form.parcelas}
              onChange={(e) => setForm({ ...form, parcelas: e.target.value })}
            />
          </Campo>
          <Campo label="Categoria">
            <Select
              value={form.category_id}
              onValueChange={(v) => setForm({ ...form, category_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NENHUM}>Sem categoria</SelectItem>
                {categorias
                  .filter((c) => c.tipo === "despesa")
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Campo>
          <Campo label="Viagem/projeto">
            <Select
              value={form.project_id}
              onValueChange={(v) => setForm({ ...form, project_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nenhum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NENHUM}>Nenhum</SelectItem>
                {projetos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome}
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
          <Button onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Registrar compra"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
