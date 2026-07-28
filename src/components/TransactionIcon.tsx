const ICONS: Record<string, React.ReactNode> = {
  income: (
    <path d="M12 19V5M5 12l7-7 7 7" />
  ),
  food: (
    <>
      <path d="M7 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3M9 12v9M17 3c-1.5 0-3 2-3 5v2h3m0-7v18" />
    </>
  ),
  shopping: (
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4M3 6h18M8 10a4 4 0 0 0 8 0" />
  ),
  gifts: (
    <path d="M20 12v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9M2 7h20v5H2zM12 22V7M12 7C10 7 8 5.5 8 4a2.5 2.5 0 0 1 4 0c0-1.5-2-3-4-3M12 7c2 0 4-1.5 4-3a2.5 2.5 0 0 0-4 0c0-1.5 2-3 4-3" />
  ),
  taxi: (
    <path d="M5 17h14M5 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm14 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM5 17V9l2-4h10l2 4v8M5 9h14" />
  ),
  pt: (
    <path d="M8 3h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM6 15l-2 4M18 15l2 4M9 18h.01M15 18h.01M6 9h12" />
  ),
  drinks: (
    <path d="M5 3h14l-1.5 8.5a5 5 0 0 1-4.93 4.15h-1.14A5 5 0 0 1 6.5 11.5L5 3ZM12 15.65V21M8 21h8" />
  ),
  groceries: (
    <path d="M6 6h15l-1.5 9h-12L5 3H2M8.5 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
  ),
  bills: (
    <path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Zm3 6h6m-6 4h6" />
  ),
  default: (
    <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24L3.24 9.59A2 2 0 0 0 3.83 11l9.58 9.59a2 2 0 0 0 2.82 0l4.36-4.36a2 2 0 0 0 0-2.82ZM7 7h.01" />
  ),
};

export default function TransactionIcon({
  name,
  isIncome,
  className = "h-4 w-4",
}: {
  name?: string;
  isIncome?: boolean;
  className?: string;
}) {
  const key = isIncome ? "income" : name?.toLowerCase() ?? "default";
  const path = ICONS[key] ?? ICONS.default;

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {path}
    </svg>
  );
}
