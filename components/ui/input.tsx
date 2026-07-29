import { forwardRef, InputHTMLAttributes, useState } from "react";

type InputVariant = "text" | "number" | "currency" | "percentage";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  variant?: InputVariant;
}

const variantInputProps: Record<
  InputVariant,
  InputHTMLAttributes<HTMLInputElement>
> = {
  text: { type: "text" },
  number: { type: "number", min: 1 },
  currency: { type: "number", min: 0, step: 0.01 },
  percentage: { type: "number", min: 0, max: 100, step: 0.01 },
};

function formatBlur(value: string, variant: InputVariant): string {
  if (value === "") return "";
  if (variant === "currency") {
    return "R$ " + Number(value).toFixed(2).replace(".", ",");
  }
  if (variant === "percentage") {
    return value + "%";
  }
  return value;
}

function formatFocus(value: string, variant: InputVariant): string {
  if (value === "") return "";
  if (variant === "currency") {
    return String(parseFloat(value.replace("R$ ", "").replace(",", ".")));
  }
  if (variant === "percentage") {
    return value.replace("%", "").trim();
  }
  return value;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      variant = "text",
      className,
      onChange,
      onBlur,
      onFocus,
      value,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="flex flex-col">
        <label className="py-2 text-gray-600">{label}</label>
        <input
          ref={ref}
          {...variantInputProps[variant]}
          {...props}
          type="text"
          value={
            isFocused
              ? formatFocus(String(value ?? ""), variant)
              : formatBlur(String(value ?? ""), variant)
          }
          onChange={(e) => onChange?.(e)}
          onKeyDown={(e) => {
            if (variant === "text") return;
            const teclaPermitida =
              e.key.length > 1 || // teclas especiais: Enter, Tab, Backspace, setas, etc
              e.key === "." ||
              e.key === ",";
            if (!teclaPermitida && e.key.match(/[^0-9]/)) {
              e.preventDefault();
            }
          }}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          className={`border-2 border-gray-300 h-12 px-3 py-4 rounded-lg focus:outline-none focus:border-blue-500 ${className}`}
        />
      </div>
    );
  },
);

Input.displayName = "Input";
