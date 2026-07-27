export default function CategoryPill({
  name,
  amount,
  selected,
  onClick,
}: {
  name: string;
  amount?: number;
  selected?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="font-medium">{name}</span>
      {amount !== undefined && (
        <span className={selected ? "text-stone-300" : "text-stone-500"}>
          ${amount.toLocaleString()}
        </span>
      )}
    </>
  );

  const classes = `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
    selected ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700"
  }`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {content}
      </button>
    );
  }

  return <span className={classes}>{content}</span>;
}
