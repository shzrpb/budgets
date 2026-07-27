export default function CategoryPill({
  name,
  color,
  amount,
  selected,
  onClick,
}: {
  name: string;
  color: string;
  amount?: number;
  selected?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-medium text-stone-700">{name}</span>
      {amount !== undefined && (
        <span className="text-stone-500">${amount.toLocaleString()}</span>
      )}
    </>
  );

  const classes =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors";

  const style = { backgroundColor: `${color}${selected ? "35" : "18"}` };

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes} style={style}>
        {content}
      </button>
    );
  }

  return (
    <span className={classes} style={style}>
      {content}
    </span>
  );
}
