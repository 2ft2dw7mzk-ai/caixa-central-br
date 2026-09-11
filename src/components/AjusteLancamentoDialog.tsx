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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Campo } from "@/components/Comuns";
import { hojeISO } from "@/lib/format";
import type { Entry } from "@/lib/finance";

/**
 * Ajusta um lançamento de conta fixa já gerado (valor/vencimento/situação
 * deste mês específico), sem alterar o valor padrão da conta fixa.
 */
export function AjusteLancamentoDialog({
  aberto,
  onOpenChange,
  entrada,
}: {
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
  entrada: Entry | null;
}) {
  const queryClient = useQueryClient();
  const [valor, setValor] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [status, setStatus] = useState<Entry["status"]>("pendente");
  const [dataPagamento, setDataPagamento] = useState("");

  useEffect(() => {
    if (!aberto || !entrada) return;
    setValor(String(entrada.valor));
    setDataVencimento(entrada.data_vencimento ?? "");
    setStatus(entrada.status);
    setDataPagamento(entrada.data_pagamento ?? hojeISO());
  }, [aberto, entrada]);

  async function salvar() {
    if (!entrada) return;
    const { error } = await supabase
      .from("entries")
      .update({
        valor: Number(valor) || 0,
        data_vencimento: dataVencimento || null,
        status,
        data_pagamento: status === "pago" ? dataPagamento || hojeISO() : null,
      })
      .eq("id", entrada.id);

    if (error) {
      toast.error("Não foi possível salvar.");
      return;
    }
    toast.success("Lançamento atualizado.");
    queryClient.invalidateQueries({ queryKey: ["entries"] });
    onOpenChange(false);
  }

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{entrada?.descricao}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <Campo label="Valor deste mês (R$)">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </Campo>

          <Campo label="Vencimento">
            <Input
              type="date"
              value={dataVencimento}
              onChange={(e) => setDataVencimento(e.target.value)}
            />
          </Campo>

          <Campo label="Situação">
            <Select value={status} onValueChange={(v) => setStatus(v as Entry["status"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </Campo>

          {status === "pago" && (
            <Campo label="Data do pagamento">
              <Input
                type="date"
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
              />
            </Campo>
          )}
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
