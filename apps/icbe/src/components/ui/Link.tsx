import type { JSX, JSXElement } from "solid-js";
import { splitProps } from "solid-js";

type AnchorAttributes = JSX.AnchorHTMLAttributes<HTMLAnchorElement>;

type LabeledOrNot =
  | { label: string; children?: null }
  | { label?: null; children?: JSXElement };

const baseStyles = `px-4 py-2 rounded-lg`;

const colors = {
  default: ``,
  blue: `bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600`,
};

const variants = {
  default: "",
};

type Color = keyof typeof colors;
type Variant = keyof typeof variants;

type LinkProps = (AnchorAttributes & LabeledOrNot) & {
  color?: Color;
  variant?: Variant;
};

function Link(props: LinkProps) {
  const [local, rest] = splitProps(props, [
    "label",
    "class",
    "color",
    "variant",
    "children",
  ]);

  return (
    <a
      class={`${baseStyles} ${colors[local.color ?? "default"]} ${variants[local.variant ?? "default"]} ${local.class ?? ""}`}
      {...rest}
    >
      {local.label ?? local.children}
    </a>
  );
}

export default Link;
