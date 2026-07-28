export default function Loading() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <div className="h-10 animate-pulse rounded-full bg-stone-200" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-stone-200" />
        ))}
      </div>
    </div>
  );
}
