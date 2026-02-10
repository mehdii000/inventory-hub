import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import type { StockRuptureData } from "@/services/analyticsApi";

interface Props {
  data: StockRuptureData;
}

export function StockRuptureChart({ data }: Props) {
  const chartData = useMemo(() => {
    return Object.entries(data)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({
        date: new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        Test: counts.Test,
        PDR: counts.PDR,
        Other: counts.Other,
      }));
  }, [data]);

  const total = useMemo(() => {
    return chartData.reduce((acc, d) => acc + d.Test + d.PDR + d.Other, 0);
  }, [chartData]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Test", color: "hsl(185 72% 38%)", value: chartData.reduce((s, d) => s + d.Test, 0) },
          { label: "PDR", color: "hsl(38 92% 45%)", value: chartData.reduce((s, d) => s + d.PDR, 0) },
          { label: "Other", color: "hsl(0 72% 55%)", value: chartData.reduce((s, d) => s + d.Other, 0) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-xl font-bold font-mono mt-0.5" style={{ color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground">Daily Stock Ruptures</h4>
          <span className="text-xs text-muted-foreground font-mono">
            {chartData.length} days · {total} total ruptures
          </span>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 88%)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(214 20% 88%)" }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(214 20% 88%)" }}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(0 0% 100%)",
                border: "1px solid hsl(214 20% 88%)",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
            />
            <Bar dataKey="Test" stackId="a" fill="hsl(185 72% 38%)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="PDR" stackId="a" fill="hsl(38 92% 45%)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Other" stackId="a" fill="hsl(0 72% 55%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
