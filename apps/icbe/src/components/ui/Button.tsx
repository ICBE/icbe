import type { JSX, JSXElement } from "solid-js";
import { splitProps } from "solid-js";

type ButtonAttributes = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

type LabeledOrNot =
  | { label: string; children?: null }
  | { label?: null; children?: JSXElement };

const baseStyles = `px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`;

const colors = {
  default: `bg-gray-600 text-white enabled:hover:bg-gray-700 focus:ring-gray-500`,
  purple: `bg-indigo-600 text-white enabled:hover:bg-indigo-700 focus:ring-indigo-500`,
  red: `bg-red-500 text-white enabled:hover:bg-red-600`,
};

const variants = {
  default: "",
  bold: "font-medium",
};

type Color = keyof typeof colors;
type Variant = keyof typeof variants;

type ButtonProps = (ButtonAttributes & LabeledOrNot) & {
  color?: Color;
  variant?: Variant;
};

function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, [
    "label",
    "class",
    "color",
    "variant",
    "children",
  ]);

  return (
    <button
      class={`${baseStyles} ${colors[local.color ?? "default"]} ${variants[local.variant ?? "default"]} ${local.class ?? ""}`}
      {...rest}
    >
      {local.label ?? local.children}
    </button>
  );
}

export default Button;
