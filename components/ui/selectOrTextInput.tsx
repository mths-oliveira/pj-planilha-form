"use client";

import { useEffect, useState } from "react";

interface SelectOrTextInputProps {
  options: string[];
  onSelect: (value: string) => void;
  label: string;
  placeholder?: string;
  value?: string;
  className?: string;
}

export function SelectOrTextInput({
  options,
  onSelect,
  label,
  placeholder = "Selecione ou digite...",
  value,
  className,
}: SelectOrTextInputProps) {
  const [query, setQuery] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  const [highlightedIndex, setHighlightedIndex] = useState(0);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  useEffect(() => {
    setQuery(value ?? "");
  }, [value]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    onSelect(e.target.value);
    setShowOptions(true);
  }

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col relative focus-within:[&>div]:visible focus-within:[&>div]:opacity-100">
      <label className="py-2 text-gray-600">{label}</label>
      <input
        value={value}
        onChange={handleInputChange}
        autoComplete="new-password"
        onFocus={() => setShowOptions(true)}
        onBlur={() => setShowOptions(false)}
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
            onSelect(filtered[highlightedIndex]);
          }
        }}
      />

      {showOptions && (
        <div className="absolute top-full left-0 right-0 py-2 bg-white shadow-lg rounded-lg z-20 overflow-auto max-h-60">
          <ul>
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-gray-500 text-sm">
                {label} será salvo Como "{query}"
              </li>
            ) : (
              filtered.map((option) => (
                <li
                  key={option}
                  className={`px-3 py-2 cursor-pointer ${
                    filtered.indexOf(option) === highlightedIndex
                      ? "bg-blue-50 text-blue-800"
                      : "hover:bg-gray-100"
                  }`}
                  onMouseDown={() => onSelect(option)}
                >
                  {option}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
