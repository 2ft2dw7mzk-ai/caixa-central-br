import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  LayoutGrid,
  Repeat,
  Receipt,
  CreditCard,
  Landmark,
  Plane,
  Wallet,
  BarChart3,
  Tags,
  Settings,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { usePeriodo } from "@/hooks/usePeriodo";
import { MESES, MESES_CURTOS } from "@/lib/format";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const MENU = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid, grupo: "Principal" },
  { to: "/contas-fixas", label: "Contas fixas", icon: Repeat, grupo: "Principal" },
  {
    to: "/gastos-variaveis",
    label: "Gastos variáveis",
    icon: Receipt,
    grupo: "Principal",
  },
  { to: "/cartoes", label: "Cartões de crédito", icon: CreditCard, grupo: "Principal" },
  { to: "/contas", label: "Contas e pagamentos", icon: Landmark, grupo: "Principal" },
  { to: "/viagens", label: "Viagens e projetos", icon: Plane, grupo: "Gestão" },
  { to: "/receitas", label: "Receitas", icon: Wallet, grupo: "Gestão" },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3, grupo: "Gestão" },
  { to: "/categorias", label: "Categorias", icon: Tags, grupo: "Gestão" },
  { to: "/configuracoes", label: "Configurações", icon: Settings, grupo: "Gestão" },
] as const;

function Navegacao({ onNavigate }: { onNavigate?: () => void }) {
  let grupoAtual = "";
  return (
    <nav className="flex flex-col gap-1">
      {MENU.map((item) => {
        const mostrarGrupo = item.grupo !== grupoAtual;
        grupoAtual = item.grupo;
        const Icone = item.icon;
        return (
          <div key={item.to}>
            {mostrarGrupo && (
              <div className="mt-3 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-dim/70">
                {item.grupo}
              </div>
            )}
            <Link
              to={item.to}
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink/80 transition-colors hover:bg-white/60"
              activeProps={{ className: "bg-ink text-white hover:bg-ink" }}
            >
              <Icone className="size-4" />
              {item.label}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}

function Marca() {
  return (
    <div className="flex items-center gap-3 px-3 py-3">
      <div className="grid size-10 place-items-center rounded-xl bg-ink font-display text-lg font-bold text-white">
        R
      </div>
      <div>
        <p className="font-display font-bold leading-none">Realce</p>
        <p className="text-[11px] text-slate-dim">Controle financeiro</p>
      </div>
    </div>
  );
}

export function SeletorPeriodo() {
  const { mes, ano, setPeriodo, anterior, proximo } = usePeriodo();
  const anos = Array.from({ length: 9 }, (_, i) => 2022 + i);
  return (
    <div className="flex items-center gap-1 rounded-xl border border-white/70 bg-white/60 px-1.5 py-1 shadow-sm backdrop-blur-xl">
      <button
        onClick={anterior}
        aria-label="Mês anterior"
        className="rounded-lg p-1 text-ink/40 transition-colors hover:text-ink"
      >
        <ChevronLeft className="size-4" />
      </button>
      <Select
        value={String(mes)}
        onValueChange={(v) => setPeriodo({ mes: Number(v), ano })}
      >
        <SelectTrigger className="h-7 w-[76px] border-0 bg-transparent px-2 text-xs font-semibold shadow-none">
          <SelectValue>{MESES_CURTOS[mes - 1]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {MESES.map((m, i) => (
            <SelectItem key={m} value={String(i + 1)}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={String(ano)}
        onValueChange={(v) => setPeriodo({ mes, ano: Number(v) })}
      >
        <SelectTrigger className="h-7 w-[74px] border-0 bg-transparent px-2 text-xs text-slate-dim shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {anos.map((a) => (
            <SelectItem key={a} value={String(a)}>
              {a}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <button
        onClick={proximo}
        aria-label="Próximo mês"
        className="rounded-lg p-1 text-ink/40 transition-colors hover:text-ink"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

export function AppShell({
  titulo,
  subtitulo,
  acoes,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  acoes?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="app-bg relative min-h-screen overflow-hidden text-ink">
      <div className="glow-blob -left-16 -top-24 h-[420px] w-[420px] bg-sky-glow/40" />
      <div className="glow-blob -right-24 top-32 h-[460px] w-[460px] bg-violet-glow/30" />
      <div className="glow-blob -bottom-28 left-1/3 h-[380px] w-[380px] bg-mint/25" />

      <div className="relative flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-white/60 bg-white/45 p-4 backdrop-blur-2xl lg:flex">
          <Marca />
          <Navegacao />
          <button
            onClick={sair}
            className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-dim transition-colors hover:bg-white/60 hover:text-ink"
          >
            <LogOut className="size-4" /> Sair
          </button>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Sheet open={aberto} onOpenChange={setAberto}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 overflow-y-auto p-4">
                <Marca />
                <Navegacao onNavigate={() => setAberto(false)} />
                <button
                  onClick={sair}
                  className="mt-6 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-dim"
                >
                  <LogOut className="size-4" /> Sair
                </button>
              </SheetContent>
            </Sheet>

            <div className="min-w-0">
              <h1 className="text-2xl font-bold sm:text-3xl">{titulo}</h1>
              {subtitulo && <p className="text-sm text-slate-dim">{subtitulo}</p>}
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <SeletorPeriodo />
              {acoes}
            </div>
          </div>

          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function Painel({
  titulo,
  descricao,
  acao,
  className = "",
  children,
}: {
  titulo?: string;
  descricao?: string;
  acao?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`glass rounded-2xl p-5 ${className}`}>
      {(titulo || acao) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {titulo && <h2 className="font-display font-bold">{titulo}</h2>}
            {descricao && <p className="text-xs text-slate-dim">{descricao}</p>}
          </div>
          {acao}
        </div>
      )}
      {children}
    </section>
  );
}
