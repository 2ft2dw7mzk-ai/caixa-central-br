export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const MESES_CURTOS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function brl(valor: number | null | undefined) {
  return (Number(valor) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function brlCurto(valor: number | null | undefined) {
  const n = Number(valor) || 0;
  if (Math.abs(n) >= 1000) return `R$ ${(n / 1000).toFixed(1).replace(".", ",")}k`;
  return brl(n);
}

export function dataBR(iso: string | null | undefined) {
  if (!iso) return "—";
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

export function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function diasNoMes(mes: number, ano: number) {
  return new Date(ano, mes, 0).getDate();
}

export function dataDeVencimento(dia: number, mes: number, ano: number) {
  const d = Math.min(Math.max(dia || 1, 1), diasNoMes(mes, ano));
  return `${ano}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function somarMeses(mes: number, ano: number, n: number) {
  const total = (ano * 12 + (mes - 1)) + n;
  return { mes: (total % 12) + 1, ano: Math.floor(total / 12) };
}

export function indiceMes(mes: number, ano: number) {
  return ano * 12 + (mes - 1);
}

export function periodoLabel(mes: number, ano: number) {
  return `${MESES[mes - 1]} de ${ano}`;
}

export function parseValor(texto: string) {
  const limpo = texto.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const n = Number(limpo);
  return Number.isFinite(n) ? n : 0;
}
