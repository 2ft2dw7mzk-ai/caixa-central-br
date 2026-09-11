export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          instituicao: string | null
          nome: string
          saldo_inicial: number
          tipo: Database["public"]["Enums"]["tipo_conta"]
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          instituicao?: string | null
          nome: string
          saldo_inicial?: number
          tipo?: Database["public"]["Enums"]["tipo_conta"]
          user_id?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          instituicao?: string | null
          nome?: string
          saldo_inicial?: number
          tipo?: Database["public"]["Enums"]["tipo_conta"]
          user_id?: string
        }
        Relationships: []
      }
      card_purchases: {
        Row: {
          cancelada: boolean
          card_id: string
          category_id: string | null
          created_at: string
          data_compra: string
          descricao: string
          id: string
          observacoes: string | null
          parcelas: number
          project_id: string | null
          user_id: string
          valor_total: number
        }
        Insert: {
          cancelada?: boolean
          card_id: string
          category_id?: string | null
          created_at?: string
          data_compra?: string
          descricao: string
          id?: string
          observacoes?: string | null
          parcelas?: number
          project_id?: string | null
          user_id?: string
          valor_total?: number
        }
        Update: {
          cancelada?: boolean
          card_id?: string
          category_id?: string | null
          created_at?: string
          data_compra?: string
          descricao?: string
          id?: string
          observacoes?: string | null
          parcelas?: number
          project_id?: string | null
          user_id?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "card_purchases_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_purchases_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_purchases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          ativo: boolean
          cor: string
          created_at: string
          dia_fechamento: number
          dia_vencimento: number
          emissor: string | null
          id: string
          limite_total: number
          nome: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          cor?: string
          created_at?: string
          dia_fechamento?: number
          dia_vencimento?: number
          emissor?: string | null
          id?: string
          limite_total?: number
          nome: string
          user_id?: string
        }
        Update: {
          ativo?: boolean
          cor?: string
          created_at?: string
          dia_fechamento?: number
          dia_vencimento?: number
          emissor?: string | null
          id?: string
          limite_total?: number
          nome?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          cor: string
          created_at: string
          id: string
          nome: string
          tipo: string
          user_id: string
        }
        Insert: {
          cor?: string
          created_at?: string
          id?: string
          nome: string
          tipo?: string
          user_id?: string
        }
        Update: {
          cor?: string
          created_at?: string
          id?: string
          nome?: string
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      entries: {
        Row: {
          account_id: string | null
          ano_ref: number
          card_id: string | null
          card_purchase_id: string | null
          category_id: string | null
          comprovante_url: string | null
          created_at: string
          data_gasto: string | null
          data_pagamento: string | null
          data_vencimento: string | null
          descricao: string
          fixed_bill_id: string | null
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento"]
          id: string
          invoice_id: string | null
          mes_ref: number
          observacoes: string | null
          origem: Database["public"]["Enums"]["origem_lancamento"]
          parcela_num: number | null
          parcela_total: number | null
          project_id: string | null
          status: Database["public"]["Enums"]["status_lancamento"]
          subcategory_id: string | null
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          account_id?: string | null
          ano_ref: number
          card_id?: string | null
          card_purchase_id?: string | null
          category_id?: string | null
          comprovante_url?: string | null
          created_at?: string
          data_gasto?: string | null
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao: string
          fixed_bill_id?: string | null
          forma_pagamento?: Database["public"]["Enums"]["forma_pagamento"]
          id?: string
          invoice_id?: string | null
          mes_ref: number
          observacoes?: string | null
          origem?: Database["public"]["Enums"]["origem_lancamento"]
          parcela_num?: number | null
          parcela_total?: number | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["status_lancamento"]
          subcategory_id?: string | null
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Update: {
          account_id?: string | null
          ano_ref?: number
          card_id?: string | null
          card_purchase_id?: string | null
          category_id?: string | null
          comprovante_url?: string | null
          created_at?: string
          data_gasto?: string | null
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao?: string
          fixed_bill_id?: string | null
          forma_pagamento?: Database["public"]["Enums"]["forma_pagamento"]
          id?: string
          invoice_id?: string | null
          mes_ref?: number
          observacoes?: string | null
          origem?: Database["public"]["Enums"]["origem_lancamento"]
          parcela_num?: number | null
          parcela_total?: number | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["status_lancamento"]
          subcategory_id?: string | null
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "entries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entries_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entries_card_purchase_id_fkey"
            columns: ["card_purchase_id"]
            isOneToOne: false
            referencedRelation: "card_purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entries_fixed_bill_id_fkey"
            columns: ["fixed_bill_id"]
            isOneToOne: false
            referencedRelation: "fixed_bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entries_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entries_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      fixed_bills: {
        Row: {
          account_id: string | null
          ano_fim: number | null
          ano_inicio: number
          ativo: boolean
          card_id: string | null
          category_id: string | null
          created_at: string
          dia_vencimento: number
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento"]
          frequencia: Database["public"]["Enums"]["frequencia"]
          id: string
          mes_fim: number | null
          mes_inicio: number
          nome: string
          observacoes: string | null
          parcelas_total: number | null
          updated_at: string
          user_id: string
          valor_previsto: number
        }
        Insert: {
          account_id?: string | null
          ano_fim?: number | null
          ano_inicio?: number
          ativo?: boolean
          card_id?: string | null
          category_id?: string | null
          created_at?: string
          dia_vencimento?: number
          forma_pagamento?: Database["public"]["Enums"]["forma_pagamento"]
          frequencia?: Database["public"]["Enums"]["frequencia"]
          id?: string
          mes_fim?: number | null
          mes_inicio?: number
          nome: string
          observacoes?: string | null
          parcelas_total?: number | null
          updated_at?: string
          user_id?: string
          valor_previsto?: number
        }
        Update: {
          account_id?: string | null
          ano_fim?: number | null
          ano_inicio?: number
          ativo?: boolean
          card_id?: string | null
          category_id?: string | null
          created_at?: string
          dia_vencimento?: number
          forma_pagamento?: Database["public"]["Enums"]["forma_pagamento"]
          frequencia?: Database["public"]["Enums"]["frequencia"]
          id?: string
          mes_fim?: number | null
          mes_inicio?: number
          nome?: string
          observacoes?: string | null
          parcelas_total?: number | null
          updated_at?: string
          user_id?: string
          valor_previsto?: number
        }
        Relationships: [
          {
            foreignKeyName: "fixed_bills_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixed_bills_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixed_bills_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      incomes: {
        Row: {
          account_id: string | null
          ano_ref: number
          categoria: string | null
          created_at: string
          data_recebimento: string | null
          descricao: string
          id: string
          mes_ref: number
          recebido: boolean
          user_id: string
          valor: number
        }
        Insert: {
          account_id?: string | null
          ano_ref: number
          categoria?: string | null
          created_at?: string
          data_recebimento?: string | null
          descricao: string
          id?: string
          mes_ref: number
          recebido?: boolean
          user_id?: string
          valor?: number
        }
        Update: {
          account_id?: string | null
          ano_ref?: number
          categoria?: string | null
          created_at?: string
          data_recebimento?: string | null
          descricao?: string
          id?: string
          mes_ref?: number
          recebido?: boolean
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "incomes_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          account_id: string | null
          ano_ref: number
          card_id: string
          created_at: string
          data_fechamento: string | null
          data_pagamento: string | null
          data_vencimento: string | null
          id: string
          mes_ref: number
          status: Database["public"]["Enums"]["status_fatura"]
          user_id: string
        }
        Insert: {
          account_id?: string | null
          ano_ref: number
          card_id: string
          created_at?: string
          data_fechamento?: string | null
          data_pagamento?: string | null
          data_vencimento?: string | null
          id?: string
          mes_ref: number
          status?: Database["public"]["Enums"]["status_fatura"]
          user_id?: string
        }
        Update: {
          account_id?: string | null
          ano_ref?: number
          card_id?: string
          created_at?: string
          data_fechamento?: string | null
          data_pagamento?: string | null
          data_vencimento?: string | null
          id?: string
          mes_ref?: number
          status?: Database["public"]["Enums"]["status_fatura"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          nome: string
          observacoes: string | null
          orcamento: number
          status: Database["public"]["Enums"]["status_projeto"]
          user_id: string
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          orcamento?: number
          status?: Database["public"]["Enums"]["status_projeto"]
          user_id?: string
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          orcamento?: number
          status?: Database["public"]["Enums"]["status_projeto"]
          user_id?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          nome: string
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          nome: string
          user_id?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          nome?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      seed_user_defaults: { Args: never; Returns: undefined }
    }
    Enums: {
      forma_pagamento:
        | "pix"
        | "debito"
        | "credito"
        | "dinheiro"
        | "boleto"
        | "transferencia"
      frequencia: "mensal" | "anual" | "parcelada" | "personalizada"
      origem_lancamento: "fixa" | "variavel" | "cartao"
      status_fatura: "aberta" | "fechada" | "paga"
      status_lancamento: "pago" | "pendente" | "atrasado"
      status_projeto: "planejando" | "em_andamento" | "concluido" | "cancelado"
      tipo_conta:
        | "conta_bancaria"
        | "carteira"
        | "pix"
        | "debito"
        | "credito"
        | "boleto"
        | "transferencia"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      forma_pagamento: [
        "pix",
        "debito",
        "credito",
        "dinheiro",
        "boleto",
        "transferencia",
      ],
      frequencia: ["mensal", "anual", "parcelada", "personalizada"],
      origem_lancamento: ["fixa", "variavel", "cartao"],
      status_fatura: ["aberta", "fechada", "paga"],
      status_lancamento: ["pago", "pendente", "atrasado"],
      status_projeto: ["planejando", "em_andamento", "concluido", "cancelado"],
      tipo_conta: [
        "conta_bancaria",
        "carteira",
        "pix",
        "debito",
        "credito",
        "boleto",
        "transferencia",
      ],
    },
  },
} as const
