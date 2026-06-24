"use client";

import { normalize } from "@/lib/normalize";
import { useState, useEffect } from "react";

interface FilteredInputProps<T extends { id: string }> {
  items: T[];
  filterKey: keyof T;
  onSelect: (item: T) => void;
  children: (item: T) => React.ReactNode;
  label: string;
  placeholder?: string;
  value?: string;
  className?: string;
}

export function FilteredInput<T extends { id: string }>({
  items,
  filterKey,
  onSelect,
  children,
  label,
  placeholder = "Buscar...",
  value,
  className,
}: FilteredInputProps<T>) {
  const [query, setQuery] = useState(value ?? "");

  const [highlightedIndex, setHighlightedIndex] = useState(0);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  useEffect(() => {
    setQuery(value ?? "");
  }, [value]);

  const filtered = items.filter((item) =>
    normalize(String(item[filterKey])).includes(normalize(query)),
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
  }

  function handleSelect(item: T) {
    setQuery(String(item[filterKey]));
    onSelect(item);
  }

  return (
    <div className="flex flex-col relative focus-within:[&>div]:visible focus-within:[&>div]:opacity-100">
      <label className="py-2 text-gray-600">{label}</label>
      <input
        value={query}
        onChange={handleInputChange}
        type="text"
        placeholder={placeholder}
        className={`${className} border-2 border-gray-300 h-12 w-full px-3 py-4 rounded-lg focus:outline-none focus:border-blue-500`}
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
            handleSelect(filtered[highlightedIndex]);
          }
        }}
      />
      <div className="absolute top-full left-0 right-0 py-2 bg-white shadow-lg rounded-lg z-20 overflow-auto max-h-60 invisible opacity-0">
        <ul>
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-gray-500">
              Nenhum resultado para "{query}"
            </li>
          ) : (
            filtered.map((item) => (
              <li
                key={item.id}
                className={`px-3 py-2 cursor-pointer ${
                  filtered.indexOf(item) === highlightedIndex
                    ? "bg-blue-50 text-blue-800"
                    : "hover:bg-gray-100"
                }`}
                onMouseDown={() => handleSelect(item)}
              >
                {children(item)}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
