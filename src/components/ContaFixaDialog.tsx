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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Campo } from "@/components/Comuns";
import { FORMAS } from "@/lib/finance";
import { MESES } from "@/lib/format";
import { useCartoes, useCategorias, useContas, type ContaFixa } from "@/lib/queries";

const NENHUM = "__nenhum__";

export function ContaFixaDialog({
  aberto,
  onOpenChange,
  inicial,
}: {
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
  inicial?: ContaFixa | null;
}) {
  const queryClient = useQueryClient();
  const { data: categorias = [] } = useCategorias();
  const { data: contas = [] } = useContas();
  const { data: cartoes = [] } = useCartoes();

  const hoje = new Date();
  const vazio = {
    nome: "",
    category_id: NENHUM,
    valor_previsto: "",
    dia_vencimento: "10",
    frequencia: "mensal" as ContaFixa["frequencia"],
    mes_inicio: String(hoje.getMonth() + 1),
    ano_inicio: String(hoje.getFullYear()),
    mes_fim: "",
    ano_fim: "",
    parcelas_total: "",
    forma_pagamento: "pix",
    account_id: NENHUM,
    card_id: NENHUM,
    observacoes: "",
    ativo: true,
  };
  const [form, setForm] = useState(vazio);

  useEffect(() => {
    if (!aberto) return;
    if (inicial) {
      setForm({
        nome: inicial.nome,
        category_id: inicial.category_id ?? NENHUM,
        valor_previsto: String(inicial.valor_previsto),
        dia_vencimento: String(inicial.dia_vencimento),
        frequencia: inicial.frequencia,
        mes_inicio: String(inicial.mes_inicio),
        ano_inicio: String(inicial.ano_inicio),
        mes_fim: inicial.mes_fim ? String(inicial.mes_fim) : "",
        ano_fim: inicial.ano_fim ? String(inicial.ano_fim) : "",
        parcelas_total: inicial.parcelas_total ? String(inicial.parcelas_total) : "",
        forma_pagamento: inicial.forma_pagamento,
        account_id: inicial.account_id ?? NENHUM,
        card_id: inicial.card_id ?? NENHUM,
        observacoes: inicial.observacoes ?? "",
        ativo: inicial.ativo,
      });
    } else {
      setForm(vazio);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, inicial]);

  const limpo = (v: string) => (v === NENHUM ? null : v);

  async function salvar() {
    if (!form.nome.trim()) {
      toast.error("Informe o nome da conta.");
      return;
    }
    const registro = {
      nome: form.nome.trim(),
      category_id: limpo(form.category_id),
      valor_previsto: Number(form.valor_previsto) || 0,
      dia_vencimento: Number(form.dia_vencimento) || 1,
      frequencia: form.frequencia,
      mes_inicio: Number(form.mes_inicio),
      ano_inicio: Number(form.ano_inicio),
      mes_fim: form.mes_fim ? Number(form.mes_fim) : null,
      ano_fim: form.ano_fim ? Number(form.ano_fim) : null,
      parcelas_total: form.parcelas_total ? Number(form.parcelas_total) : null,
      forma_pagamento: form.forma_pagamento as ContaFixa["forma_pagamento"],
      account_id: limpo(form.account_id),
      card_id: limpo(form.card_id),
      observacoes: form.observacoes || null,
      ativo: form.ativo,
    };

    const { error } = inicial
      ? await supabase.from("fixed_bills").update(registro).eq("id", inicial.id)
      : await supabase.from("fixed_bills").insert(registro);

    if (error) {
      toast.error("Não foi possível salvar.");
      return;
    }
    toast.success(inicial ? "Conta fixa atualizada." : "Conta fixa cadastrada.");
    queryClient.invalidateQueries({ queryKey: ["fixed_bills"] });
    onOpenChange(false);
  }

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{inicial ? "Editar conta fixa" : "Nova conta fixa"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Campo label="Nome da conta">
              <Input
                value={form.nome}
                maxLength={80}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </Campo>
          </div>

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

          <Campo label="Valor previsto (R$)">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.valor_previsto}
              onChange={(e) => setForm({ ...form, valor_previsto: e.target.value })}
            />
          </Campo>

          <Campo label="Dia do vencimento">
            <Input
              type="number"
              min="1"
              max="31"
              value={form.dia_vencimento}
              onChange={(e) => setForm({ ...form, dia_vencimento: e.target.value })}
            />
          </Campo>

          <Campo label="Frequência">
            <Select
              value={form.frequencia}
              onValueChange={(v) =>
                setForm({ ...form, frequencia: v as ContaFixa["frequencia"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
                <SelectItem value="parcelada">Parcelada</SelectItem>
                <SelectItem value="personalizada">Personalizada</SelectItem>
              </SelectContent>
            </Select>
          </Campo>

          <Campo label="Mês de início">
            <Select
              value={form.mes_inicio}
              onValueChange={(v) => setForm({ ...form, mes_inicio: v })}
            >
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

          <Campo label="Ano de início">
            <Input
              type="number"
              value={form.ano_inicio}
              onChange={(e) => setForm({ ...form, ano_inicio: e.target.value })}
            />
          </Campo>

          {form.frequencia === "parcelada" && (
            <Campo label="Total de parcelas">
              <Input
                type="number"
                min="1"
                value={form.parcelas_total}
                onChange={(e) => setForm({ ...form, parcelas_total: e.target.value })}
              />
            </Campo>
          )}

          <Campo label="Mês de término (opcional)">
            <Select
              value={form.mes_fim || NENHUM}
              onValueChange={(v) => setForm({ ...form, mes_fim: v === NENHUM ? "" : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem término" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NENHUM}>Sem término</SelectItem>
                {MESES.map((m, i) => (
                  <SelectItem key={m} value={String(i + 1)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          <Campo label="Ano de término (opcional)">
            <Input
              type="number"
              value={form.ano_fim}
              onChange={(e) => setForm({ ...form, ano_fim: e.target.value })}
            />
          </Campo>

          <Campo label="Forma de pagamento padrão">
            <Select
              value={form.forma_pagamento}
              onValueChange={(v) => setForm({ ...form, forma_pagamento: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          {form.forma_pagamento === "credito" ? (
            <Campo label="Cartão padrão">
              <Select
                value={form.card_id}
                onValueChange={(v) => setForm({ ...form, card_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NENHUM}>Sem cartão</SelectItem>
                  {cartoes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>
          ) : (
            <Campo label="Conta padrão">
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
          )}

          <div className="flex items-center gap-3 sm:col-span-2">
            <Switch
              checked={form.ativo}
              onCheckedChange={(v) => setForm({ ...form, ativo: v })}
            />
            <span className="text-sm font-medium">Conta ativa</span>
          </div>

          <div className="sm:col-span-2">
            <Campo label="Observações">
              <Textarea
                value={form.observacoes}
                maxLength={500}
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
