"use client";

import { useEffect, useState } from "react";
import { FilteredInput } from "@/components/ui/FilteredInput";
import { Cliente, DadosDoOrcamentoNoSistema, Representante } from "@/types";
import { useNumeroDoOrcamento } from "@/hooks/useNumeroDoOrcamento";
import { Input } from "../ui/input";
import { SelectOrTextInput } from "../ui/selectOrTextInput";
import { ProductSelector } from "../ui/ProductSelector";
import { Produto } from "@/types/produto";
import { ProdutoSelecionado, salvarOrcamentoNaPlanilha } from "@/lib/sheets";
interface PedidoFormProps {
  clientes: Cliente[];
  representantes: Representante[];
  produtos: Produto[];
}

type DadosDoOrcamentoForm = Omit<
  DadosDoOrcamentoNoSistema,
  "cliente" | "representante" | "produtos"
> & {
  cliente: Cliente | null;
  representante: Representante | null;
  produtos: ProdutoSelecionado[];
};

export function PedidoForm({
  clientes,
  representantes,
  produtos,
}: PedidoFormProps) {
  const {
    atualizarNumeroDoOrcamento,
    incrementarNumeroDoOrcamento,
    numeroDoOrcamento,
  } = useNumeroDoOrcamento();
  const initialState: DadosDoOrcamentoForm = {
    numeroDoOrcamento: 0,
    data: new Date().toLocaleDateString("pt-BR"),
    cliente: null,
    representante: null,
    taxaDeFrente: 0,
    outrasDespesas: 0,
    numeroDeParcelas: 0,
    formaDePagamento: "",
    prazos: "",
    vencimentos: "",
    produtos: [],
  };
  const [form, setForm] = useState<DadosDoOrcamentoForm>(initialState);
  const [refs, setRefs] = useState<HTMLElement[]>([]);

  useEffect(() => {
    const refs = Array.from<HTMLElement>(
      document.querySelectorAll(".el-focus"),
    );
    setRefs(refs);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" && e.key !== "Tab") return;
    if (
      e.key === "Enter" &&
      (e.target as HTMLElement).closest("[data-ignore-enter]")
    )
      return;
    e.preventDefault();

    const currentIndex = refs.indexOf(document.activeElement as any);
    if (currentIndex === -1) return;
    if (currentIndex === refs.length - 1) return refs[currentIndex].click();
    const ref = refs[currentIndex + 1];
    ref.focus({ preventScroll: true });
    ref.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function setField<K extends keyof DadosDoOrcamentoForm>(
    key: K,
    value: DadosDoOrcamentoForm[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    setField("numeroDoOrcamento", numeroDoOrcamento);
  }, [numeroDoOrcamento]);

  const handleSubmit = async () => {
    const response = await fetch("/api/sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (response.ok) {
      resetForm();
      incrementarNumeroDoOrcamento();
    }
  };

  function resetForm() {
    setForm({
      ...initialState,
      numeroDoOrcamento: form.numeroDoOrcamento,
    });
  }

  function gerarPrazo(parcelas: number, intervalo: number) {
    if (!parcelas) return intervalo === 30 ? "30 Dias" : "À Vista";
    let prazo = "";
    for (let i = 1; i <= parcelas; i++) {
      const dia = intervalo * i;
      prazo += i === parcelas ? `${dia}` : `${dia}/`;
    }
    return prazo;
  }

  const prazoOptions = [
    gerarPrazo(form.numeroDeParcelas, 30),
    gerarPrazo(form.numeroDeParcelas, 15),
  ];

  function gerarVencimentos(prazosString: string): string {
    // 1. Divide a string de prazos em um array de números
    const prazos = prazosString.split("/").map(Number);

    // 2. Mapeia cada prazo para sua respectiva data de vencimento
    const vencimentos = prazos.map((prazo) => {
      // Sempre criamos uma nova instância baseada na data atual
      const dataVencimento = new Date();

      if (prazo % 30 === 0) {
        // Se for múltiplo de 30, adiciona a quantidade correspondente em meses
        const mesesAdicionais = prazo / 30;
        dataVencimento.setMonth(dataVencimento.getMonth() + mesesAdicionais);
      } else {
        // Se não for múltiplo de 30, adiciona a quantidade exata em dias
        dataVencimento.setDate(dataVencimento.getDate() + prazo);
      }

      // 3. Retorna a data formatada no padrão brasileiro
      return dataVencimento.toLocaleDateString("pt-BR");
    });

    return vencimentos.join(" - ");
  }

  return (
    <div
      className="flex flex-col max-w-lg mx-auto gap-2 py-12"
      onKeyDown={handleKeyDown}
    >
      <FilteredInput<Cliente>
        items={clientes}
        value={form.cliente?.nome}
        filterKey="nome"
        label="Nome do Cliente"
        placeholder="Buscar Cliente..."
        onSelect={(c) => setField("cliente", c)}
        className="el-focus"
      >
        {(c) => (
          <>
            <p className="uppercase font-medium">{c.nome}</p>
            <p className="text-sm text-gray-600">{c.cnpj}</p>
          </>
        )}
      </FilteredInput>

      <FilteredInput<Representante>
        items={representantes}
        value={form.representante?.nome}
        filterKey="nome"
        label="Nome do Representante"
        placeholder="Buscar Representante..."
        onSelect={(c) => setField("representante", c)}
        className="el-focus"
      >
        {(c) => (
          <>
            <p className="uppercase font-medium">{c.nome}</p>
            <p className="text-sm text-gray-600">{c.cnpj}</p>
          </>
        )}
      </FilteredInput>

      <ProductSelector
        resetarProdutosSelecionados={form.produtos.length === 0}
        className="el-focus"
        produtos={produtos}
        onChange={(selecionados) =>
          setField(
            "produtos",
            selecionados.map((s) => ({
              ...s.produto,
              quantidade: s.quantidade,
            })),
          )
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Número do Orçamento"
          variant="number"
          value={form.numeroDoOrcamento !== 0 ? form.numeroDoOrcamento : ""}
          onChange={(e) => atualizarNumeroDoOrcamento(e.target.value)}
          className="el-focus"
        />
        <Input
          label="Número de Parcelas"
          variant="number"
          value={form.numeroDeParcelas !== 0 ? form.numeroDeParcelas : ""}
          onChange={(e) => {
            setField("numeroDeParcelas", Number(e.target.value));
          }}
          className="el-focus"
        />
      </div>
      <SelectOrTextInput
        label="Prazos"
        options={prazoOptions}
        value={form.prazos}
        onSelect={(value) => {
          setField("prazos", value);
          setField("vencimentos", gerarVencimentos(value));
        }}
        className="el-focus"
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Taxa de Frente"
          variant="currency"
          value={form.taxaDeFrente !== 0 ? form.taxaDeFrente : ""}
          onChange={(e) => {
            setField("taxaDeFrente", Number(e.target.value));
          }}
          className="el-focus"
        />
        <Input
          label="Outras Despesas"
          variant="currency"
          value={form.outrasDespesas !== 0 ? form.outrasDespesas : ""}
          onChange={(e) => {
            setField("outrasDespesas", Number(e.target.value));
          }}
          className="el-focus"
        />
      </div>

      <SelectOrTextInput
        label="Forma de Pagamento"
        options={["PIX", "Dinheiro", "Crédito", "Débito", "Cheque"]}
        value={form.formaDePagamento}
        onSelect={(value) => {
          setField("formaDePagamento", value);
        }}
        className="el-focus"
      />

      <p
        className="text-md my-4 w-fit mx-auto text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
        onClick={resetForm}
      >
        Limpar Formulario
      </p>
      <button
        onClick={handleSubmit}
        className="el-focus w-full h-12 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
      >
        Enviar Pedido
      </button>
    </div>
  );
}
