import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Entry } from "./finance";

async function listar<T>(tabela: string, ordem = "nome") {
  const { data, error } = await supabase.from(tabela).select("*").order(ordem);
  if (error) throw error;
  return (data ?? []) as T[];
}

export type Categoria = {
  id: string;
  nome: string;
  tipo: string;
  cor: string;
};
export type Subcategoria = { id: string; nome: string; category_id: string };
export type Conta = {
  id: string;
  nome: string;
  tipo: string;
  instituicao: string | null;
  saldo_inicial: number;
  ativo: boolean;
};
export type Cartao = {
  id: string;
  nome: string;
  emissor: string | null;
  limite_total: number;
  dia_fechamento: number;
  dia_vencimento: number;
  cor: string;
  ativo: boolean;
};
export type Projeto = {
  id: string;
  nome: string;
  descricao: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  orcamento: number;
  status: "planejando" | "em_andamento" | "concluido" | "cancelado";
  observacoes: string | null;
};
export type ContaFixa = {
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
  forma_pagamento: Entry["forma_pagamento"];
  account_id: string | null;
  card_id: string | null;
  observacoes: string | null;
  ativo: boolean;
};
export type Fatura = {
  id: string;
  card_id: string;
  mes_ref: number;
  ano_ref: number;
  data_fechamento: string | null;
  data_vencimento: string | null;
  status: "aberta" | "fechada" | "paga";
  data_pagamento: string | null;
};
export type Receita = {
  id: string;
  descricao: string;
  valor: number;
  data_recebimento: string | null;
  mes_ref: number;
  ano_ref: number;
  categoria: string | null;
  account_id: string | null;
  recebido: boolean;
};

export const useCategorias = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: () => listar<Categoria>("categories"),
  });

export const useSubcategorias = () =>
  useQuery({
    queryKey: ["subcategories"],
    queryFn: () => listar<Subcategoria>("subcategories"),
  });

export const useContas = () =>
  useQuery({ queryKey: ["accounts"], queryFn: () => listar<Conta>("accounts") });

export const useCartoes = () =>
  useQuery({ queryKey: ["cards"], queryFn: () => listar<Cartao>("cards") });

export const useProjetos = () =>
  useQuery({ queryKey: ["projects"], queryFn: () => listar<Projeto>("projects") });

export const useContasFixas = () =>
  useQuery({
    queryKey: ["fixed_bills"],
    queryFn: () => listar<ContaFixa>("fixed_bills"),
  });

export const useFaturas = () =>
  useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("ano_ref")
        .order("mes_ref");
      if (error) throw error;
      return (data ?? []) as Fatura[];
    },
  });

export const useLancamentos = (mes?: number, ano?: number) =>
  useQuery({
    queryKey: ["entries", mes ?? "todos", ano ?? "todos"],
    queryFn: async () => {
      let q = supabase.from("entries").select("*");
      if (mes) q = q.eq("mes_ref", mes);
      if (ano) q = q.eq("ano_ref", ano);
      const { data, error } = await q
        .order("data_vencimento", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Entry[];
    },
  });

export const useReceitas = (mes?: number, ano?: number) =>
  useQuery({
    queryKey: ["incomes", mes ?? "todos", ano ?? "todos"],
    queryFn: async () => {
      let q = supabase.from("incomes").select("*");
      if (mes) q = q.eq("mes_ref", mes);
      if (ano) q = q.eq("ano_ref", ano);
      const { data, error } = await q.order("data_recebimento", {
        ascending: false,
      });
      if (error) throw error;
      return (data ?? []) as Receita[];
    },
  });

export const useCompras = () =>
  useQuery({
    queryKey: ["card_purchases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_purchases")
        .select("*")
        .order("data_compra", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
