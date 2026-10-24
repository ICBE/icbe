interface Props {
  href?: boolean | string;
}

function Title(props: Props) {
  const href = () =>
    typeof props.href === "string" ? props.href : props.href ? "/" : undefined;

  return (
    <div>
      {href() ? (
        <a
          href={href()}
          class="text-2xl font-bold tracking-tight hover:underline"
        >
          Infinite Craft Base Elements
        </a>
      ) : (
        <span class="text-2xl font-bold tracking-tight">
          Infinite Craft Base Elements
        </span>
      )}
    </div>
  );
}

export default Title;
