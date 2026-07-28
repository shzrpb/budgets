export default function AddMoreButton({
  onClick,
  label = "Add more",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onClick}
        className="-my-1 px-2 py-3 text-sm text-stone-300 transition-colors hover:text-stone-500"
      >
        {label}
      </button>
    </div>
  );
}
