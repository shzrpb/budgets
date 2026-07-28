import AddGoalSheet from "@/components/AddGoalSheet";
import type { Goal } from "@/lib/types";

export default function NetWorthGoalCard({ goal, netWorth }: { goal: Goal | null; netWorth: number }) {
  if (!goal) {
    return (
      <AddGoalSheet
        goal={null}
        title="Set your net worth goal"
        trigger={
          <div className="rounded-3xl bg-white p-4 text-sm text-stone-500 shadow-sm">
            No overall net worth goal yet.{" "}
            <span className="font-medium text-stone-800">Tap to set one →</span>
          </div>
        }
      />
    );
  }

  const progress = goal.target_amount > 0 ? Math.min(netWorth / goal.target_amount, 1) : 0;
  const dateLabel = goal.target_date
    ? new Date(goal.target_date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <AddGoalSheet
      goal={goal}
      title="Edit net worth goal"
      trigger={
        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500">Net worth goal</p>
            {dateLabel && <p className="text-xs text-stone-400">by {dateLabel}</p>}
          </div>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            ${goal.target_amount.toLocaleString()}
          </p>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-sky-400 transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-stone-400">{Math.round(progress * 100)}% there</p>
        </div>
      }
    />
  );
}
