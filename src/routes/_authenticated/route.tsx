import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";
import { PeriodoProvider } from "@/hooks/usePeriodo";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Protegido,
});

function Protegido() {
  useEffect(() => {
    void supabase.rpc("seed_user_defaults");
  }, []);

  return (
    <PeriodoProvider>
      <Outlet />
    </PeriodoProvider>
  );
}
