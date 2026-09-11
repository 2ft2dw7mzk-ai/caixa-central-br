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
import { FORMAS, type Entry } from "@/lib/finance";
import { MESES, hojeISO } from "@/lib/format";
import {
  useCartoes,
  useCategorias,
  useContas,
  useProjetos,
  useSubcategorias,
} from "@/lib/queries";

const NENHUM = "__nenhum__";

export function LancamentoDialog({
  aberto,
  onOpenChange,
  inicial,
  mes,
  ano,
  projetoFixo,
}: {
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
  inicial?: Entry | null;
  mes: number;
  ano: number;
  projetoFixo?: string;
}) {
  const queryClient = useQueryClient();
  const { data: categorias = [] } = useCategorias();
  const { data: subcategorias = [] } = useSubcategorias();
  const { data: contas = [] } = useContas();
  const { data: cartoes = [] } = useCartoes();
  const { data: projetos = [] } = useProjetos();

  const vazio = {
    descricao: "",
    category_id: NENHUM,
    subcategory_id: NENHUM,
    valor: "",
    data_gasto: hojeISO(),
    mes_ref: String(mes),
    ano_ref: String(ano),
    forma_pagamento: "pix",
    account_id: NENHUM,
    card_id: NENHUM,
    project_id: projetoFixo ?? NENHUM,
    status: "pago",
    observacoes: "",
    comprovante_url: "",
  };
  const [form, setForm] = useState(vazio);

  useEffect(() => {
    if (!aberto) return;
    if (inicial) {
      setForm({
        descricao: inicial.descricao,
        category_id: inicial.category_id ?? NENHUM,
        subcategory_id: inicial.subcategory_id ?? NENHUM,
        valor: String(inicial.valor),
        data_gasto: inicial.data_gasto ?? hojeISO(),
        mes_ref: String(inicial.mes_ref),
        ano_ref: String(inicial.ano_ref),
        forma_pagamento: inicial.forma_pagamento,
        account_id: inicial.account_id ?? NENHUM,
        card_id: inicial.card_id ?? NENHUM,
        project_id: inicial.project_id ?? projetoFixo ?? NENHUM,
        status: inicial.status,
        observacoes: inicial.observacoes ?? "",
        comprovante_url: inicial.comprovante_url ?? "",
      });
    } else {
      setForm({ ...vazio, mes_ref: String(mes), ano_ref: String(ano) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, inicial, mes, ano]);

  const limpo = (v: string) => (v === NENHUM ? null : v);

  async function salvar() {
    if (!form.descricao.trim()) {
      toast.error("Informe a descrição.");
      return;
    }
    const registro = {
      descricao: form.descricao.trim(),
      origem: "variavel" as const,
      category_id: limpo(form.category_id),
      subcategory_id: limpo(form.subcategory_id),
      valor: Number(form.valor) || 0,
      data_gasto: form.data_gasto || null,
      mes_ref: Number(form.mes_ref),
      ano_ref: Number(form.ano_ref),
      forma_pagamento: form.forma_pagamento as Entry["forma_pagamento"],
      account_id: limpo(form.account_id),
      card_id: limpo(form.card_id),
      project_id: limpo(form.project_id),
      status: form.status as Entry["status"],
      data_pagamento: form.status === "pago" ? form.data_gasto || hojeISO() : null,
      observacoes: form.observacoes || null,
      comprovante_url: form.comprovante_url || null,
    };

    const { error } = inicial
      ? await supabase.from("entries").update(registro).eq("id", inicial.id)
      : await supabase.from("entries").insert(registro);

    if (error) {
      toast.error("Não foi possível salvar.");
      return;
    }
    toast.success(inicial ? "Lançamento atualizado." : "Gasto adicionado.");
    queryClient.invalidateQueries({ queryKey: ["entries"] });
    onOpenChange(false);
  }

  const subsDaCategoria = subcategorias.filter(
    (s) => s.category_id === form.category_id,
  );

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{inicial ? "Editar gasto" : "Adicionar gasto"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Campo label="Descrição">
              <Input
                value={form.descricao}
                maxLength={120}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </Campo>
          </div>

          <Campo label="Categoria">
            <Select
              value={form.category_id}
              onValueChange={(v) =>
                setForm({ ...form, category_id: v, subcategory_id: NENHUM })
              }
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

          <Campo label="Subcategoria">
            <Select
              value={form.subcategory_id}
              onValueChange={(v) => setForm({ ...form, subcategory_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NENHUM}>Sem subcategoria</SelectItem>
                {subsDaCategoria.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          <Campo label="Valor (R$)">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
            />
          </Campo>

          <Campo label="Data do gasto">
            <Input
              type="date"
              value={form.data_gasto}
              onChange={(e) => setForm({ ...form, data_gasto: e.target.value })}
            />
          </Campo>

          <Campo label="Mês de referência">
            <Select
              value={form.mes_ref}
              onValueChange={(v) => setForm({ ...form, mes_ref: v })}
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

          <Campo label="Ano de referência">
            <Input
              type="number"
              value={form.ano_ref}
              onChange={(e) => setForm({ ...form, ano_ref: e.target.value })}
            />
          </Campo>

          <Campo label="Forma de pagamento">
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
            <Campo label="Cartão">
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
            <Campo label="Conta">
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

          <Campo label="Situação">
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </Campo>

          {!projetoFixo && (
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
          )}

          <div className="sm:col-span-2">
            <Campo label="Comprovante (link opcional)">
              <Input
                value={form.comprovante_url}
                placeholder="https://..."
                onChange={(e) =>
                  setForm({ ...form, comprovante_url: e.target.value })
                }
              />
            </Campo>
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
