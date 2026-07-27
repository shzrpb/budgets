export default function CategoryPill({
  emoji,
  name,
  color,
  amount,
  selected,
  onClick,
}: {
  emoji: string | null;
  name: string;
  color: string;
  amount?: number;
  selected?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full text-xs"
        style={{ backgroundColor: `${color}33` }}
      >
        {emoji}
      </span>
      <span className="font-medium">{name}</span>
      {amount !== undefined && (
        <span className="text-stone-500">${amount.toLocaleString()}</span>
      )}
    </>
  );

  const classes = `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
    selected
      ? "text-white"
      : "bg-white text-stone-700 ring-1 ring-inset ring-stone-200"
  }`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={classes}
        style={selected ? { backgroundColor: color } : undefined}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={classes} style={{ backgroundColor: `${color}1a` }}>
      {content}
    </span>
  );
}
