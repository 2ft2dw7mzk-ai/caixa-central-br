import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { AppShell, Painel } from "@/components/AppShell";
import { BotaoExcluir, Campo, Vazio } from "@/components/Comuns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCategorias, useSubcategorias, type Categoria, type Subcategoria } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias — Realce" },
      { name: "description", content: "Organize categorias e subcategorias dos seus gastos." },
    ],
  }),
  component: Categorias,
});

const CORES: string[] = ["#38bdf8", "#a78bfa", "#34d399", "#fbbf24", "#fb7185", "#f472b6", "#60a5fa", "#22d3ee", "#818cf8", "#f59e0b", "#94a3b8"];
const COR_PADRAO = CORES[0]!;

function CategoriaDialog({
  aberto,
  onOpenChange,
  inicial,
}: {
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
  inicial?: Categoria | null;
}) {
  const queryClient = useQueryClient();
  const vazio = { nome: "", tipo: "despesa", cor: COR_PADRAO };
  const [form, setForm] = useState(vazio);

  useEffect(() => {
    if (!aberto) return;
    setForm(inicial ? { nome: inicial.nome, tipo: inicial.tipo, cor: inicial.cor } : vazio);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, inicial]);

  async function salvar() {
    if (!form.nome.trim()) {
      toast.error("Informe o nome.");
      return;
    }
    const registro = { nome: form.nome.trim(), tipo: form.tipo, cor: form.cor };
    const { error } = inicial
      ? await supabase.from("categories").update(registro).eq("id", inicial.id)
      : await supabase.from("categories").insert(registro);
    if (error) {
      toast.error("Não foi possível salvar.");
      return;
    }
    toast.success(inicial ? "Categoria atualizada." : "Categoria criada.");
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    onOpenChange(false);
  }

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{inicial ? "Editar categoria" : "Nova categoria"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Campo label="Nome">
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Campo>
          <Campo label="Tipo">
            <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="despesa">Despesa</SelectItem>
                <SelectItem value="receita">Receita</SelectItem>
              </SelectContent>
            </Select>
          </Campo>
          <Campo label="Cor">
            <div className="flex flex-wrap gap-2">
              {CORES.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setForm({ ...form, cor })}
                  className={`size-7 rounded-full ${form.cor === cor ? "ring-2 ring-offset-2 ring-ink" : ""}`}
                  style={{ background: cor }}
                  aria-label={cor}
                />
              ))}
            </div>
          </Campo>
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

function SubcategoriaDialog({
  aberto,
  onOpenChange,
  categorias,
  inicial,
}: {
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
  categorias: Categoria[];
  inicial?: Subcategoria | null;
}) {
  const queryClient = useQueryClient();
  const vazio = { nome: "", category_id: categorias[0]?.id ?? "" };
  const [form, setForm] = useState(vazio);

  useEffect(() => {
    if (!aberto) return;
    setForm(
      inicial
        ? { nome: inicial.nome, category_id: inicial.category_id }
        : { nome: "", category_id: categorias[0]?.id ?? "" },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, inicial]);

  async function salvar() {
    if (!form.nome.trim() || !form.category_id) {
      toast.error("Informe o nome e a categoria.");
      return;
    }
    const registro = { nome: form.nome.trim(), category_id: form.category_id };
    const { error } = inicial
      ? await supabase.from("subcategories").update(registro).eq("id", inicial.id)
      : await supabase.from("subcategories").insert(registro);
    if (error) {
      toast.error("Não foi possível salvar.");
      return;
    }
    toast.success(inicial ? "Subcategoria atualizada." : "Subcategoria criada.");
    queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    onOpenChange(false);
  }

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{inicial ? "Editar subcategoria" : "Nova subcategoria"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Campo label="Categoria">
            <Select
              value={form.category_id}
              onValueChange={(v) => setForm({ ...form, category_id: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>
          <Campo label="Nome">
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Campo>
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

function Categorias() {
  const queryClient = useQueryClient();
  const { data: categorias = [], isLoading } = useCategorias();
  const { data: subcategorias = [] } = useSubcategorias();

  const [dialogoCat, setDialogoCat] = useState(false);
  const [editandoCat, setEditandoCat] = useState<Categoria | null>(null);
  const [dialogoSub, setDialogoSub] = useState(false);
  const [editandoSub, setEditandoSub] = useState<Subcategoria | null>(null);

  async function excluirCategoria(id: string) {
    await supabase.from("categories").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    toast.success("Categoria excluída.");
  }

  async function excluirSubcategoria(id: string) {
    await supabase.from("subcategories").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    toast.success("Subcategoria excluída.");
  }

  return (
    <AppShell
      titulo="Categorias"
      subtitulo="Organize categorias e subcategorias"
      acoes={
        <>
          <Button
            variant="outline"
            onClick={() => {
              setEditandoSub(null);
              setDialogoSub(true);
            }}
          >
            <Plus className="size-4" /> Subcategoria
          </Button>
          <Button
            onClick={() => {
              setEditandoCat(null);
              setDialogoCat(true);
            }}
          >
            <Plus className="size-4" /> Categoria
          </Button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Painel titulo="Categorias">
          {isLoading ? (
            <Vazio texto="Carregando..." />
          ) : categorias.length === 0 ? (
            <Vazio texto="Nenhuma categoria cadastrada." />
          ) : (
            <ul className="divide-y divide-black/5 text-sm">
              {categorias.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ background: c.cor }} />
                    <span className="font-semibold">{c.nome}</span>
                    <span className="text-xs capitalize text-slate-dim">({c.tipo})</span>
                  </div>
                  <div className="flex shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Editar"
                      onClick={() => {
                        setEditandoCat(c);
                        setDialogoCat(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <BotaoExcluir
                      onConfirm={() => excluirCategoria(c.id)}
                      descricao="Lançamentos com esta categoria ficarão sem categoria."
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Painel>

        <Painel titulo="Subcategorias">
          {subcategorias.length === 0 ? (
            <Vazio texto="Nenhuma subcategoria cadastrada." />
          ) : (
            <ul className="divide-y divide-black/5 text-sm">
              {subcategorias.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-2">
                  <div>
                    <span className="font-semibold">{s.nome}</span>
                    <span className="ml-2 text-xs text-slate-dim">
                      {categorias.find((c) => c.id === s.category_id)?.nome ?? "—"}
                    </span>
                  </div>
                  <div className="flex shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Editar"
                      onClick={() => {
                        setEditandoSub(s);
                        setDialogoSub(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <BotaoExcluir onConfirm={() => excluirSubcategoria(s.id)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Painel>
      </div>

      <CategoriaDialog aberto={dialogoCat} onOpenChange={setDialogoCat} inicial={editandoCat} />
      <SubcategoriaDialog
        aberto={dialogoSub}
        onOpenChange={setDialogoSub}
        categorias={categorias}
        inicial={editandoSub}
      />
    </AppShell>
  );
}
