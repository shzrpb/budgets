export default function Loading() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <div className="h-5 w-40 animate-pulse rounded bg-stone-200" />
      <div className="h-32 animate-pulse rounded-2xl bg-stone-200" />
      <div className="h-24 animate-pulse rounded-2xl bg-stone-200" />
      <div className="h-24 animate-pulse rounded-2xl bg-stone-200" />
      <div className="h-40 animate-pulse rounded-2xl bg-stone-200" />
    </div>
  );
}
