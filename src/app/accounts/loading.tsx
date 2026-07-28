export default function Loading() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <div className="h-4 w-48 animate-pulse rounded bg-stone-200" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-200" />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-2xl bg-stone-200" />
    </div>
  );
}
