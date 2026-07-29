export default function PageHeader({ title }: { title: string }) {
  return (
    <h1 className="text-center text-base font-semibold tracking-tight text-stone-900">
      {title}
    </h1>
  );
}
