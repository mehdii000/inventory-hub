import { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar, Filter, Table2, LineChart as LineChartIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { StockRuptureData } from "@/services/analyticsApi";

interface Props {
  data: StockRuptureData;
}

const COLORS = {
  Test: "hsl(185, 72%, 38%)",
  PDR: "hsl(38, 92%, 45%)",
  Other: "hsl(0, 72%, 55%)",
};

export function StockRuptureResults({ data }: Props) {
  const [dateFilter, setDateFilter] = useState("");

  const allRows = useMemo(() => {
    return Object.entries(data)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({
        rawDate: date,
        date: new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
        shortDate: new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        Test: counts.Test,
        PDR: counts.PDR,
        Other: counts.Other,
        total: counts.Test + counts.PDR + counts.Other,
      }));
  }, [data]);

  const filteredRows = useMemo(() => {
    if (!dateFilter) return allRows;
    const q = dateFilter.toLowerCase();
    return allRows.filter(
      (r) => r.rawDate.includes(q) || r.date.toLowerCase().includes(q)
    );
  }, [allRows, dateFilter]);

  const totals = useMemo(() => ({
    Test: filteredRows.reduce((s, d) => s + d.Test, 0),
    PDR: filteredRows.reduce((s, d) => s + d.PDR, 0),
    Other: filteredRows.reduce((s, d) => s + d.Other, 0),
    all: filteredRows.reduce((s, d) => s + d.total, 0),
  }), [filteredRows]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        {([
          { label: "Test", color: COLORS.Test, value: totals.Test },
          { label: "PDR", color: COLORS.PDR, value: totals.PDR },
          { label: "Other", color: COLORS.Other, value: totals.Other },
          { label: "Total", color: "hsl(215, 16%, 47%)", value: totals.all },
        ]).map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-xl font-bold font-mono mt-0.5" style={{ color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs: Chart / Data */}
      <Tabs defaultValue="chart" className="w-full">
        <div className="flex items-center justify-between gap-3 mb-3">
          <TabsList className="h-9 p-1 bg-muted/60">
            <TabsTrigger value="chart" className="gap-1.5 text-xs px-3">
              <LineChartIcon className="h-3.5 w-3.5" />
              Chart
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-1.5 text-xs px-3">
              <Table2 className="h-3.5 w-3.5" />
              Data
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter by date..."
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-8 w-44 text-xs"
            />
          </div>
        </div>

        {/* ── Chart tab ── */}
        <TabsContent value="chart">
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground">Daily Stock Ruptures</h4>
              <span className="text-xs text-muted-foreground font-mono">
                {filteredRows.length} days · {totals.all} ruptures
              </span>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={filteredRows}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                <XAxis
                  dataKey="shortDate"
                  tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(214, 20%, 88%)" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(214, 20%, 88%)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(214, 20%, 88%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Line type="monotone" dataKey="Test" stroke={COLORS.Test} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="PDR" stroke={COLORS.PDR} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Other" stroke={COLORS.Other} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* ── Data tab ── */}
        <TabsContent value="data">
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40">
                    <th className="px-4 py-2.5 text-left font-semibold text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" /> Date
                      </div>
                    </th>
                    <th className="px-4 py-2.5 text-right font-semibold text-xs" style={{ color: COLORS.Test }}>Test</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-xs" style={{ color: COLORS.PDR }}>PDR</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-xs" style={{ color: COLORS.Other }}>Other</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-xs text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-xs">
                        No data matches the filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr key={row.rawDate} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-2 font-mono text-xs">{row.date}</td>
                        <td className="px-4 py-2 text-right font-mono text-xs">{row.Test}</td>
                        <td className="px-4 py-2 text-right font-mono text-xs">{row.PDR}</td>
                        <td className="px-4 py-2 text-right font-mono text-xs">{row.Other}</td>
                        <td className="px-4 py-2 text-right font-mono text-xs font-semibold">{row.total}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {filteredRows.length > 0 && (
                  <tfoot>
                    <tr className="bg-muted/40 font-semibold">
                      <td className="px-4 py-2 text-xs">Totals</td>
                      <td className="px-4 py-2 text-right font-mono text-xs">{totals.Test}</td>
                      <td className="px-4 py-2 text-right font-mono text-xs">{totals.PDR}</td>
                      <td className="px-4 py-2 text-right font-mono text-xs">{totals.Other}</td>
                      <td className="px-4 py-2 text-right font-mono text-xs">{totals.all}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            <div className="px-4 py-2 border-t border-border/30 flex justify-end">
              <Badge variant="outline" className="text-[10px] font-mono">
                {filteredRows.length} / {allRows.length} rows
              </Badge>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
