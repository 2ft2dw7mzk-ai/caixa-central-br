import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Periodo = { mes: number; ano: number };

type Ctx = Periodo & {
  setPeriodo: (p: Periodo) => void;
  anterior: () => void;
  proximo: () => void;
};

const PeriodoContext = createContext<Ctx | null>(null);

const PADRAO: Periodo = { mes: 9, ano: 2026 };
const CHAVE = "periodo-financeiro";

export function PeriodoProvider({ children }: { children: React.ReactNode }) {
  const [periodo, setPeriodo] = useState<Periodo>(PADRAO);

  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo) {
      try {
        setPeriodo(JSON.parse(salvo) as Periodo);
      } catch {
        /* ignora */
      }
    }
  }, []);

  const valor = useMemo<Ctx>(() => {
    const aplicar = (p: Periodo) => {
      setPeriodo(p);
      localStorage.setItem(CHAVE, JSON.stringify(p));
    };
    return {
      ...periodo,
      setPeriodo: aplicar,
      anterior: () =>
        aplicar(
          periodo.mes === 1
            ? { mes: 12, ano: periodo.ano - 1 }
            : { mes: periodo.mes - 1, ano: periodo.ano },
        ),
      proximo: () =>
        aplicar(
          periodo.mes === 12
            ? { mes: 1, ano: periodo.ano + 1 }
            : { mes: periodo.mes + 1, ano: periodo.ano },
        ),
    };
  }, [periodo]);

  return <PeriodoContext.Provider value={valor}>{children}</PeriodoContext.Provider>;
}

export function usePeriodo() {
  const ctx = useContext(PeriodoContext);
  if (!ctx) throw new Error("usePeriodo precisa estar dentro de PeriodoProvider");
  return ctx;
}
