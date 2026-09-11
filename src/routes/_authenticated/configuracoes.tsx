import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { AppShell, Painel } from "@/components/AppShell";
import { Campo } from "@/components/Comuns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Realce" },
      { name: "description", content: "Dados da conta e preferências." },
    ],
  }),
  component: Configuracoes,
});

function Configuracoes() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  async function alterarSenha() {
    if (novaSenha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setSalvando(true);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setSalvando(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Senha atualizada.");
    setNovaSenha("");
    setConfirmarSenha("");
  }

  async function sair() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <AppShell titulo="Configurações" subtitulo="Dados da sua conta">
      <div className="grid gap-4 lg:grid-cols-2">
        <Painel titulo="Conta">
          <div className="space-y-4">
            <Campo label="E-mail">
              <Input value={email} disabled />
            </Campo>
            <Button variant="outline" onClick={sair}>
              Sair da conta
            </Button>
          </div>
        </Painel>

        <Painel titulo="Alterar senha">
          <div className="space-y-4">
            <Campo label="Nova senha">
              <Input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
              />
            </Campo>
            <Campo label="Confirmar nova senha">
              <Input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
            </Campo>
            <Button onClick={alterarSenha} disabled={salvando}>
              {salvando ? "Salvando..." : "Atualizar senha"}
            </Button>
          </div>
        </Painel>
      </div>
    </AppShell>
  );
}
