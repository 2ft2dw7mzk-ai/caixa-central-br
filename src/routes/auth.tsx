import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Campo } from "@/components/Comuns";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — Realce Controle Financeiro" },
      {
        name: "description",
        content: "Acesse seu controle financeiro pessoal com e-mail e senha.",
      },
      { property: "og:title", content: "Entrar — Realce Controle Financeiro" },
      {
        property: "og:description",
        content: "Acesse seu controle financeiro pessoal.",
      },
    ],
  }),
  component: Autenticacao,
});

function Autenticacao() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    try {
      if (modo === "criar") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Conta criada! Confirme o e-mail para entrar.");
          return;
        }
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (erro) {
      toast.error((erro as Error).message ?? "Não foi possível continuar.");
    } finally {
      setCarregando(false);
    }
  }

  async function entrarComGoogle() {
    const resultado = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (resultado.error) {
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
    if (resultado.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="app-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 text-ink">
      <div className="glow-blob -left-16 -top-24 h-[420px] w-[420px] bg-sky-glow/40" />
      <div className="glow-blob -right-24 bottom-0 h-[420px] w-[420px] bg-violet-glow/30" />

      <div className="glass relative w-full max-w-sm rounded-2xl p-6">
        <div className="grid size-11 place-items-center rounded-xl bg-ink font-display text-lg font-bold text-white">
          R
        </div>
        <h1 className="mt-4 text-2xl font-bold">
          {modo === "entrar" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="text-sm text-slate-dim">Seu controle financeiro pessoal.</p>

        <form onSubmit={enviar} className="mt-6 space-y-4">
          <Campo label="E-mail">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
            />
          </Campo>
          <Campo label="Senha">
            <Input
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
            />
          </Campo>
          <Button type="submit" className="w-full" disabled={carregando}>
            {carregando ? "Aguarde..." : modo === "entrar" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <Button
          variant="outline"
          className="mt-3 w-full bg-white/70"
          onClick={entrarComGoogle}
        >
          Continuar com Google
        </Button>

        <button
          className="mt-4 w-full text-center text-xs font-semibold text-slate-dim hover:text-ink"
          onClick={() => setModo(modo === "entrar" ? "criar" : "entrar")}
        >
          {modo === "entrar"
            ? "Ainda não tenho conta — criar agora"
            : "Já tenho conta — entrar"}
        </button>
      </div>
    </div>
  );
}
