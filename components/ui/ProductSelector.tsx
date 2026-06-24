"use client";

import { normalize } from "@/lib/normalize";
import { Produto } from "@/types/produto";
import { useState, useRef, useEffect } from "react";

interface ProdutoSelecionado {
  produto: Produto;
  quantidade: number;
}

interface ProductSelectorProps {
  produtos: Produto[];
  onChange: (selecionados: ProdutoSelecionado[]) => void;
  resetarProdutosSelecionados: boolean;
  className?: string;
}

export function ProductSelector({
  produtos,
  onChange,
  resetarProdutosSelecionados,
  className,
}: ProductSelectorProps) {
  const [query, setQuery] = useState("");
  const [selecionados, setSelecionados] = useState<ProdutoSelecionado[]>([]);
  const quantidadeRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  useEffect(() => {
    if (resetarProdutosSelecionados) {
      setSelecionados([]);
    }
  }, [resetarProdutosSelecionados]);

  const filtered = produtos.filter(
    (p) =>
      !selecionados.some((s) => s.produto.ref === p.ref) &&
      (normalize(p.descricao).includes(normalize(query)) ||
        normalize(p.ref).includes(normalize(query))),
  );

  function handleSelect(produto: Produto) {
    const novo = { produto, quantidade: 1 };
    const atualizados = [...selecionados, novo];
    setSelecionados(atualizados);
    onChange(atualizados);
    setQuery("");

    setTimeout(() => {
      quantidadeRefs.current[produto.ref]?.focus();
      quantidadeRefs.current[produto.ref]?.select();
    }, 50);
  }

  function handleQuantidadeKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    produtoId: string,
  ) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      document.getElementById("product-search-input")?.focus();
    }

    if (e.key === "Tab") {
      e.stopPropagation();
    }
  }

  function handleQuantidadeChange(produtoId: string, valor: string) {
    const atualizados = selecionados.map((s) =>
      s.produto.ref === produtoId ? { ...s, quantidade: Number(valor) } : s,
    );
    setSelecionados(atualizados);
    onChange(atualizados);
  }

  function handleRemove(produtoId: string) {
    const atualizados = selecionados.filter((s) => s.produto.ref !== produtoId);
    setSelecionados(atualizados);
    onChange(atualizados);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col relative focus-within:[&>div]:visible focus-within:[&>div]:opacity-100">
        <label className="py-2 text-gray-600">Produtos</label>
        <input
          id="product-search-input"
          data-ignore-enter
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por REF ou Descrição..."
          autoComplete="off"
          className={`${className} border-2 border-gray-300 h-12 w-full px-3 rounded-lg focus:outline-none focus:border-blue-500`}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlightedIndex((prev) =>
                Math.min(prev + 1, filtered.length - 1),
              );
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlightedIndex((prev) => Math.max(prev - 1, 0));
            }
            if (e.key === "Enter" && highlightedIndex >= 0) {
              e.preventDefault();
              if (filtered.length === 0) return;
              handleSelect(filtered[highlightedIndex]);
            }
          }}
        />
        <div className="absolute top-full left-0 right-0 py-2 bg-white shadow-lg rounded-lg z-20 overflow-auto max-h-60 invisible opacity-0">
          <ul>
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-gray-500 text-sm">
                Nenhum produto encontrado para "{query}"
              </li>
            ) : (
              filtered.map((p) => (
                <li
                  key={p.ref}
                  className={`px-3 py-2 cursor-pointer ${
                    filtered.indexOf(p) === highlightedIndex
                      ? "bg-blue-50 text-blue-800"
                      : "hover:bg-gray-100"
                  }`}
                  onMouseDown={() => handleSelect(p)}
                >
                  <p className="font-medium">{p.descricao}</p>
                  <p className="text-sm text-gray-500">ref: {p.ref}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {selecionados.length > 0 && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          {selecionados.map((s) => (
            <div
              key={s.produto.ref}
              className="flex justify-between items-center px-3 py-1.5 shadow-md rounded-lg text-sm"
            >
              <div className="flex gap-1 mr-2">
                <span>REF:</span>
                <span className="text-black font-bold bg-gray-200 px-2 rounded-full">
                  {s.produto.ref.padStart(5, "0")}
                </span>
              </div>
              <div className="flex gap-1 mr-1">
                <span className="">Quant:</span>
                <input
                  ref={(el) => {
                    quantidadeRefs.current[s.produto.ref] = el;
                  }}
                  type="number"
                  min={1}
                  max={999}
                  value={s.quantidade}
                  onChange={(e) =>
                    handleQuantidadeChange(s.produto.ref, e.target.value)
                  }
                  onKeyDown={(e) => handleQuantidadeKeyDown(e, s.produto.ref)}
                  className="w-12 h-6 text-center text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={() => handleRemove(s.produto.ref)}
                className="text-gray-300 font-bold hover:text-red-400 transition-colors ml-1 cursor-pointer"
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
