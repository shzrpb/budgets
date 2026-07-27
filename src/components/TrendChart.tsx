"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TrendPoint } from "@/lib/networth";

export default function TrendChart({
  data,
  color = "#57534e",
  height = 120,
  formatValue = (v: number) => `$${v.toLocaleString()}`,
  showAxis = true,
}: {
  data: TrendPoint[];
  color?: string;
  height?: number;
  formatValue?: (value: number) => string;
  showAxis?: boolean;
}) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-stone-400"
        style={{ height }}
      >
        Not enough data yet
      </div>
    );
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 16, bottom: 0, left: 16 }}>
          {showAxis && (
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tickMargin={14}
              tick={{ fontSize: 11, fill: "#a8a29e" }}
            />
          )}
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs shadow-sm">
                  {formatValue(Number(payload[0].value))}
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
