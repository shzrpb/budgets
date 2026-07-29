import TrendChart from "@/components/TrendChart";
import AddGoalSheet from "@/components/AddGoalSheet";
import type { TrendPoint } from "@/lib/networth";
import type { Goal } from "@/lib/types";

function monthsUntil(target: Date, from: Date): number {
  const months = (target.getFullYear() - from.getFullYear()) * 12 + (target.getMonth() - from.getMonth());
  return Math.max(1, months);
}

function fmt(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default function NetWorthCard({
  netWorth,
  series,
  change30d,
  goal,
}: {
  netWorth: number;
  series: TrendPoint[];
  /** Net worth delta over the last 30 days, or null if there isn't enough history to compute one. */
  change30d: number | null;
  goal: Goal | null;
}) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-white to-sky-100 p-4 shadow-[0_2px_16px_-6px_rgba(0,0,0,0.08)] ring-1 ring-inset ring-white/60">
      <p className="text-sm text-stone-500">Net worth</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="font-mono text-3xl font-semibold tracking-tight">${fmt(netWorth)}</p>
        {change30d !== null && (
          <p className={`font-mono text-sm font-medium ${change30d >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {change30d >= 0 ? "+" : "-"}${fmt(Math.abs(change30d))}
          </p>
        )}
      </div>
      {change30d !== null && <p className="text-xs text-stone-400">Last 30 days</p>}
      <div className="mt-2">
        <TrendChart data={series} color="#57534e" height={72} />
      </div>

      <GoalSection netWorth={netWorth} goal={goal} series={series} />
    </div>
  );
}

function GoalSection({
  netWorth,
  goal,
  series,
}: {
  netWorth: number;
  goal: Goal | null;
  series: TrendPoint[];
}) {
  if (!goal) {
    return (
      <AddGoalSheet
        goal={null}
        title="Set your net worth goal"
        triggerClassName="mt-4 block w-full border-t border-stone-200/70 pt-4 text-left"
        trigger={
          <p className="text-sm text-stone-500">
            No overall net worth goal yet.{" "}
            <span className="font-medium text-stone-800">Tap to set one →</span>
          </p>
        }
      />
    );
  }

  const progress = goal.target_amount > 0 ? Math.min(netWorth / goal.target_amount, 1) : 0;
  const dateLabel = goal.target_date
    ? new Date(goal.target_date).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : null;

  const remaining = goal.target_amount - netWorth;
  const monthsLeft = goal.target_date ? monthsUntil(new Date(goal.target_date), new Date()) : null;
  const paceNeeded = monthsLeft && remaining > 0 ? remaining / monthsLeft : 0;

  // Compare the required monthly pace against actual recent growth from the trend series.
  const recent = series.filter((p) => p.value !== 0);
  const recentMonthlyChange =
    recent.length >= 2 ? recent[recent.length - 1].value - recent[recent.length - 2].value : null;
  const onTrack =
    progress >= 1 || (recentMonthlyChange !== null && paceNeeded > 0 && recentMonthlyChange >= paceNeeded);

  return (
    <AddGoalSheet
      goal={goal}
      title="Edit net worth goal"
      triggerClassName="mt-4 block w-full border-t border-stone-200/70 pt-4 text-left"
      trigger={
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500">
              Goal <span className="font-mono text-stone-700">${fmt(goal.target_amount)}</span>
              {dateLabel && <span> · {dateLabel}</span>}
            </p>
            {recentMonthlyChange !== null && (
              <p className={`text-xs font-medium ${onTrack ? "text-emerald-600" : "text-amber-600"}`}>
                {onTrack ? "On track" : "Behind pace"}
              </p>
            )}
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-stone-400">
            <span className="font-mono">{Math.round(progress * 100)}%</span> there
            {monthsLeft && paceNeeded > 0 && (
              <>
                {" · "}
                <span className="font-mono">${fmt(paceNeeded)}</span>/mo keeps you on pace
              </>
            )}
          </p>
        </div>
      }
    />
  );
}
