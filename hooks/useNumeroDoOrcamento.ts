import { useEffect, useState } from "react";

export function useNumeroDoOrcamento() {
  const localStorageKey = "numero_do_orcamento";
  const [numeroDoOrcamento, setNumeroDoOrcamento] = useState<number>(0);

  useEffect(() => {
    const salvo = localStorage.getItem(localStorageKey);
    setNumeroDoOrcamento(salvo ? Number(salvo) : 1);
  }, []);

  function incrementarNumeroDoOrcamento() {
    const numeroIncrementado = numeroDoOrcamento ? numeroDoOrcamento + 1 : 1;
    atualizarNumeroDoOrcamento(numeroIncrementado);
  }

  function atualizarNumeroDoOrcamento(novoNumeroDoOrcamento: number | string) {
    setNumeroDoOrcamento(Number(novoNumeroDoOrcamento));
    localStorage.setItem(localStorageKey, String(novoNumeroDoOrcamento));
  }

  return {
    numeroDoOrcamento,
    incrementarNumeroDoOrcamento,
    atualizarNumeroDoOrcamento,
  };
}
