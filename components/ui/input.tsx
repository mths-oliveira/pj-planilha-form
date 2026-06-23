import { InputHTMLAttributes } from "react";

type InputVariant = "text" | "number" | "currency";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  variant?: InputVariant;
}

const variantProps: Record<
  InputVariant,
  InputHTMLAttributes<HTMLInputElement>
> = {
  text: { type: "text" },
  number: { type: "number", min: 1 },
  currency: { type: "number", min: 0, step: 0.01 },
};

export function Input({
  label,
  variant = "text",
  className,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col">
      <label className="py-2 text-gray-600">{label}</label>
      <input
        className={`border-2 border-gray-300  h-12 px-3 py-4 rounded-lg focus:outline-none focus:border-blue-500 ${className}`}
        {...variantProps[variant]}
        {...props}
      />
    </div>
  );
}
