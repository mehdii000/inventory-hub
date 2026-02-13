import { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar, Filter, Table2, LineChart as LineChartIcon, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Updated Type to match the new JSON format
interface StockRuptureData {
  TAN_9999: Record<string, { Test: number; PDR: number; Other: number }>;
  BKN_8888: Record<string, { Test: number; PDR: number; Other: number }>;
}

interface Props {
  data: StockRuptureData;
}

const COLORS = {
  Test: "hsl(185, 72%, 38%)",
  PDR: "hsl(38, 92%, 45%)",
  Other: "hsl(0, 72%, 55%)",
};

export function StockRuptureResults({ data }: Props) {
  const [activeSite, setActiveSite] = useState<keyof StockRuptureData>("TAN_9999");
  const [dateFilter, setDateFilter] = useState("");

  // Process data based on selected site
  const allRows = useMemo(() => {
    const siteData = data[activeSite] || {};
    return Object.entries(siteData)
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
  }, [data, activeSite]);

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
      {/* Site Selector & Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20 p-4 rounded-xl border border-border/40">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1">
            <Building2 className="h-3 w-3" /> Select Site
          </label>
          <Select value={activeSite} onValueChange={(v) => setActiveSite(v as keyof StockRuptureData)}>
            <SelectTrigger className="w-[180px] h-9 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TAN_9999">Site 9999 (TAN)</SelectItem>
              <SelectItem value="BKN_8888">Site 8888 (BKN)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 gap-2 flex-1 max-w-2xl">
          {[
            { label: "Test", color: COLORS.Test, value: totals.Test },
            { label: "PDR", color: COLORS.PDR, value: totals.PDR },
            { label: "Other", color: COLORS.Other, value: totals.Other },
            { label: "Total", color: "hsl(215, 16%, 47%)", value: totals.all },
          ].map((stat) => (
            <div key={stat.label} className="bg-background rounded-lg border border-border/60 p-2 text-center shadow-sm">
              <div className="text-[10px] text-muted-foreground font-medium uppercase">{stat.label}</div>
              <div className="text-lg font-bold font-mono" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="chart" className="w-full">
        <div className="flex items-center justify-between gap-3 mb-3">
          <TabsList className="h-9 p-1 bg-muted/60">
            <TabsTrigger value="chart" className="gap-1.5 text-xs px-3">
              <LineChartIcon className="h-3.5 w-3.5" /> Chart
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-1.5 text-xs px-3">
              <Table2 className="h-3.5 w-3.5" /> Data
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

        <TabsContent value="chart">
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Stock Ruptures Trend</h4>
                <p className="text-[11px] text-muted-foreground italic">Current View: {activeSite}</p>
              </div>
              <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                {filteredRows.length} Days
              </span>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={filteredRows}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214, 20%, 92%)" />
                <XAxis
                  dataKey="shortDate"
                  tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid hsl(214, 20%, 88%)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} iconType="circle" />
                <Line type="monotone" dataKey="Test" stroke={COLORS.Test} strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "white" }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="PDR" stroke={COLORS.PDR} strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "white" }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Other" stroke={COLORS.Other} strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "white" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="data">
          {/* Table logic remains similar, but data is now derived from the 'allRows' memo which respects the activeSite */}
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40">
                    <th className="px-4 py-2.5 text-left font-semibold text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Date</div>
                    </th>
                    <th className="px-4 py-2.5 text-right font-semibold text-xs" style={{ color: COLORS.Test }}>Test</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-xs" style={{ color: COLORS.PDR }}>PDR</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-xs" style={{ color: COLORS.Other }}>Other</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-xs text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={row.rawDate} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2 font-mono text-xs">{row.date}</td>
                      <td className="px-4 py-2 text-right font-mono text-xs">{row.Test}</td>
                      <td className="px-4 py-2 text-right font-mono text-xs">{row.PDR}</td>
                      <td className="px-4 py-2 text-right font-mono text-xs">{row.Other}</td>
                      <td className="px-4 py-2 text-right font-mono text-xs font-semibold">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
