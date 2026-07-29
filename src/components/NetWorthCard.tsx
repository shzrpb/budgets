import TrendChart from "@/components/TrendChart";
import type { TrendPoint } from "@/lib/networth";

export default function NetWorthCard({
  netWorth,
  series,
}: {
  netWorth: number;
  series: TrendPoint[];
}) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-white to-sky-100 p-4 shadow-sm">
      <p className="text-sm text-stone-500">Net worth</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">
        ${netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </p>
      <div className="mt-2">
        <TrendChart data={series} color="#57534e" height={72} />
      </div>
    </div>
  );
}
