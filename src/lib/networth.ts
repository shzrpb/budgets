import type { AccountBalanceHistoryRow } from "@/lib/types";

export interface TrendPoint {
  label: string;
  value: number;
  date: string;
}

const MONTH_LABEL = new Intl.DateTimeFormat("en", { month: "short" });

/**
 * Builds a month-by-month net worth series by carrying forward each
 * account's latest known balance as of each month boundary. History is
 * sparse right after signup (one point per account) — the graph fills
 * in naturally as balances get edited over time.
 */
export function buildNetWorthSeries(
  history: AccountBalanceHistoryRow[],
  months = 6,
): TrendPoint[] {
  const byAccount = groupByAccount(history);
  const boundaries = monthEndBoundaries(months);

  return boundaries.map(({ date, label }) => {
    let total = 0;
    for (const rows of Object.values(byAccount)) {
      const latest = latestAtOrBefore(rows, date);
      if (latest) total += latest.balance;
    }
    return { label, value: total, date: date.toISOString() };
  });
}

/** Raw balance-over-time points for a single account, oldest first. */
export function accountTrendSeries(history: AccountBalanceHistoryRow[]): TrendPoint[] {
  return [...history]
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .map((row) => ({
      label: MONTH_LABEL.format(new Date(row.recorded_at)),
      value: row.balance,
      date: row.recorded_at,
    }));
}

/** Latest recorded balance in each of the last `months` calendar months. */
export function lastNMonthBalances(
  history: AccountBalanceHistoryRow[],
  months = 3,
): { label: string; value: number }[] {
  const boundaries = monthEndBoundaries(months);
  const sorted = [...history].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
  );
  return boundaries.map(({ date, label }) => {
    const latest = latestAtOrBefore(sorted, date);
    return { label, value: latest?.balance ?? 0 };
  });
}

function groupByAccount(history: AccountBalanceHistoryRow[]) {
  const map: Record<string, AccountBalanceHistoryRow[]> = {};
  for (const row of history) {
    (map[row.account_id] ??= []).push(row);
  }
  for (const rows of Object.values(map)) {
    rows.sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  }
  return map;
}

function latestAtOrBefore(rows: AccountBalanceHistoryRow[], date: Date) {
  let latest: AccountBalanceHistoryRow | undefined;
  for (const row of rows) {
    if (new Date(row.recorded_at) <= date) latest = row;
    else break;
  }
  return latest;
}

function monthEndBoundaries(months: number) {
  const now = new Date();
  const points: { date: Date; label: string }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const boundary = d > now ? now : d;
    points.push({ date: boundary, label: MONTH_LABEL.format(boundary) });
  }
  return points;
}
