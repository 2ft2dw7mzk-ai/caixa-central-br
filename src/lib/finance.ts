import { supabase } from "@/integrations/supabase/client";
import { dataDeVencimento, hojeISO, indiceMes, somarMeses } from "./format";

export type FormaPagamento =
  | "pix"
  | "debito"
  | "credito"
  | "dinheiro"
  | "boleto"
  | "transferencia";

export const FORMAS: { value: FormaPagamento; label: string }[] = [
  { value: "pix", label: "Pix" },
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "boleto", label: "Boleto" },
  { value: "transferencia", label: "Transferência" },
];

export const TIPOS_CONTA = [
  { value: "conta_bancaria", label: "Conta bancária" },
  { value: "carteira", label: "Carteira/dinheiro" },
  { value: "pix", label: "Pix" },
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
  { value: "boleto", label: "Boleto" },
  { value: "transferencia", label: "Transferência" },
];

export const STATUS_PROJETO = [
  { value: "planejando", label: "Planejando" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
];

export type StatusLancamento = "pago" | "pendente" | "atrasado";

export type Entry = {
  id: string;
  descricao: string;
  origem: "fixa" | "variavel" | "cartao";
  category_id: string | null;
  subcategory_id: string | null;
  valor: number;
  data_gasto: string | null;
  data_vencimento: string | null;
  data_pagamento: string | null;
  mes_ref: number;
  ano_ref: number;
  forma_pagamento: FormaPagamento;
  account_id: string | null;
  card_id: string | null;
  invoice_id: string | null;
  fixed_bill_id: string | null;
  card_purchase_id: string | null;
  project_id: string | null;
  parcela_num: number | null;
  parcela_total: number | null;
  status: StatusLancamento;
  observacoes: string | null;
  comprovante_url: string | null;
};

/** Situação exibida: pendente com vencimento no passado vira "atrasado". */
export function statusReal(e: {
  status: string;
  data_vencimento?: string | null;
}): StatusLancamento {
  if (e.status === "pago") return "pago";
  if (e.data_vencimento && e.data_vencimento < hojeISO()) return "atrasado";
  return e.status === "atrasado" ? "atrasado" : "pendente";
}

export const STATUS_INFO: Record<
  StatusLancamento,
  { label: string; classe: string }
> = {
  pago: { label: "Pago", classe: "bg-mint/15 text-mint" },
  pendente: { label: "Pendente", classe: "bg-amber-glow/15 text-amber-glow" },
  atrasado: { label: "Atrasado", classe: "bg-coral/15 text-coral" },
};

type FixedBill = {
  id: string;
  nome: string;
  category_id: string | null;
  valor_previsto: number;
  dia_vencimento: number;
  frequencia: "mensal" | "anual" | "parcelada" | "personalizada";
  mes_inicio: number;
  ano_inicio: number;
  mes_fim: number | null;
  ano_fim: number | null;
  parcelas_total: number | null;
  forma_pagamento: FormaPagamento;
  account_id: string | null;
  card_id: string | null;
  ativo: boolean;
};

/** A conta fixa vale para o mês informado? */
export function contaFixaValeNoMes(b: FixedBill, mes: number, ano: number) {
  if (!b.ativo) return false;
  const alvo = indiceMes(mes, ano);
  const inicio = indiceMes(b.mes_inicio, b.ano_inicio);
  if (alvo < inicio) return false;
  if (b.mes_fim && b.ano_fim && alvo > indiceMes(b.mes_fim, b.ano_fim)) return false;

  if (b.frequencia === "anual") return mes === b.mes_inicio;
  if (b.frequencia === "parcelada") {
    const total = b.parcelas_total ?? 1;
    return alvo - inicio < total;
  }
  return true;
}

/** Cria os lançamentos das contas fixas do mês (sem duplicar). */
export async function gerarLancamentosFixos(mes: number, ano: number) {
  const { data: bills } = await supabase
    .from("fixed_bills")
    .select("*")
    .eq("ativo", true);
  if (!bills?.length) return 0;

  const validos = (bills as unknown as FixedBill[]).filter((b) =>
    contaFixaValeNoMes(b, mes, ano),
  );
  if (!validos.length) return 0;

  const { data: existentes } = await supabase
    .from("entries")
    .select("fixed_bill_id")
    .eq("mes_ref", mes)
    .eq("ano_ref", ano)
    .not("fixed_bill_id", "is", null);

  const jaTem = new Set((existentes ?? []).map((e) => e.fixed_bill_id));
  const novos = validos
    .filter((b) => !jaTem.has(b.id))
    .map((b) => ({
      descricao: b.nome,
      origem: "fixa" as const,
      category_id: b.category_id,
      valor: b.valor_previsto,
      data_vencimento: dataDeVencimento(b.dia_vencimento, mes, ano),
      mes_ref: mes,
      ano_ref: ano,
      forma_pagamento: b.forma_pagamento,
      account_id: b.account_id,
      card_id: b.card_id,
      fixed_bill_id: b.id,
      status: "pendente" as const,
    }));

  if (!novos.length) return 0;
  await supabase.from("entries").insert(novos);
  return novos.length;
}

type Card = {
  id: string;
  dia_fechamento: number;
  dia_vencimento: number;
};

/** Em qual fatura cai uma compra feita nesta data. */
export function faturaDaCompra(card: Card, dataCompra: string) {
  const partes = dataCompra.slice(0, 10).split("-").map(Number);
  const ano = partes[0] ?? 0;
  const mes = partes[1] ?? 1;
  const dia = partes[2] ?? 1;
  const desloca = dia > card.dia_fechamento ? 1 : 0;
  return somarMeses(mes, ano, desloca);
}

/** Busca (ou cria) a fatura de um cartão para o mês. */
export async function obterFatura(
  card: Card,
  mes: number,
  ano: number,
): Promise<string> {
  const { data: existente } = await supabase
    .from("invoices")
    .select("id")
    .eq("card_id", card.id)
    .eq("mes_ref", mes)
    .eq("ano_ref", ano)
    .maybeSingle();
  if (existente) return existente.id;

  const fecha = somarMeses(mes, ano, -1);
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      card_id: card.id,
      mes_ref: mes,
      ano_ref: ano,
      data_fechamento: dataDeVencimento(card.dia_fechamento, fecha.mes, fecha.ano),
      data_vencimento: dataDeVencimento(card.dia_vencimento, mes, ano),
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

/** Cria a compra e uma parcela em cada fatura futura. */
export async function registrarCompraCartao(input: {
  card: Card;
  descricao: string;
  data_compra: string;
  valor_total: number;
  parcelas: number;
  category_id: string | null;
  project_id: string | null;
  observacoes: string | null;
}) {
  const { data: compra, error } = await supabase
    .from("card_purchases")
    .insert({
      card_id: input.card.id,
      descricao: input.descricao,
      data_compra: input.data_compra,
      valor_total: input.valor_total,
      parcelas: input.parcelas,
      category_id: input.category_id,
      project_id: input.project_id,
      observacoes: input.observacoes,
    })
    .select("id")
    .single();
  if (error) throw error;

  const base = faturaDaCompra(input.card, input.data_compra);
  const valorParcela = Math.round((input.valor_total / input.parcelas) * 100) / 100;

  for (let i = 0; i < input.parcelas; i++) {
    const p = somarMeses(base.mes, base.ano, i);
    const invoiceId = await obterFatura(input.card, p.mes, p.ano);
    await supabase.from("entries").insert({
      descricao:
        input.parcelas > 1
          ? `${input.descricao} (${i + 1}/${input.parcelas})`
          : input.descricao,
      origem: "cartao",
      category_id: input.category_id,
      project_id: input.project_id,
      valor: valorParcela,
      data_gasto: input.data_compra,
      data_vencimento: dataDeVencimento(
        input.card.dia_vencimento,
        p.mes,
        p.ano,
      ),
      mes_ref: p.mes,
      ano_ref: p.ano,
      forma_pagamento: "credito",
      card_id: input.card.id,
      invoice_id: invoiceId,
      card_purchase_id: compra.id,
      parcela_num: i + 1,
      parcela_total: input.parcelas,
      status: "pendente",
    });
  }
  return compra.id;
}

/**
 * Pagar a fatura NÃO cria despesa nova: apenas marca a fatura e as parcelas
 * que já estão lançadas como pagas.
 */
export async function pagarFatura(invoiceId: string, dataPagamento: string) {
  await supabase
    .from("invoices")
    .update({ status: "paga", data_pagamento: dataPagamento })
    .eq("id", invoiceId);
  await supabase
    .from("entries")
    .update({ status: "pago", data_pagamento: dataPagamento })
    .eq("invoice_id", invoiceId);
}

export async function fecharFatura(invoiceId: string) {
  await supabase.from("invoices").update({ status: "fechada" }).eq("id", invoiceId);
}
