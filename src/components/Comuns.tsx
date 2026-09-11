import { Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { STATUS_INFO, type StatusLancamento } from "@/lib/finance";
import { brl } from "@/lib/format";

export function Chip({ status }: { status: StatusLancamento }) {
  const info = STATUS_INFO[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${info.classe}`}
    >
      {info.label}
    </span>
  );
}

export function CardResumo({
  titulo,
  valor,
  nota,
  destaque,
  tom = "neutro",
  onClick,
}: {
  titulo: string;
  valor: number | string;
  nota?: string;
  destaque?: boolean;
  tom?: "neutro" | "positivo" | "negativo" | "alerta";
  onClick?: () => void;
}) {
  const tons: Record<string, string> = {
    neutro: "text-slate-dim",
    positivo: "text-mint",
    negativo: "text-coral",
    alerta: "text-amber-glow",
  };
  const Componente = onClick ? "button" : "div";
  return (
    <Componente
      onClick={onClick}
      className={`${
        destaque
          ? "bg-gradient-to-br from-ink to-slate-800 text-white shadow-lg"
          : "glass"
      } rounded-2xl p-4 text-left transition-transform ${onClick ? "hover:-translate-y-0.5" : ""}`}
    >
      <p
        className={`text-xs font-semibold ${destaque ? "text-white/60" : "text-slate-dim"}`}
      >
        {titulo}
      </p>
      <p className="num mt-1 text-2xl">
        {typeof valor === "number" ? brl(valor) : valor}
      </p>
      {nota && (
        <p
          className={`mt-1 text-xs font-semibold ${destaque ? "text-mint" : tons[tom]}`}
        >
          {nota}
        </p>
      )}
    </Componente>
  );
}

export function BotaoExcluir({
  onConfirm,
  descricao = "Este lançamento será removido definitivamente.",
}: {
  onConfirm: () => void;
  descricao?: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Excluir">
          <Trash2 className="size-4 text-coral" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>{descricao}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-slate-dim">{label}</Label>
      {children}
    </div>
  );
}

export function Vazio({ texto }: { texto: string }) {
  return <p className="py-8 text-center text-sm text-slate-dim">{texto}</p>;
}
