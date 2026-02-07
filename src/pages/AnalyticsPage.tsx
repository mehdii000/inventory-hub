import { useState } from "react";
import { Construction, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDropZone } from "@/components/processors/FileDropZone";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const barData = [
  { category: "Raw Materials", current: 4200, projected: 3800 },
  { category: "Components", current: 3100, projected: 2900 },
  { category: "Finished Goods", current: 2800, projected: 3200 },
  { category: "Packaging", current: 1800, projected: 1600 },
  { category: "Spare Parts", current: 950, projected: 1100 },
];

const pieData = [
  { name: "Matched", value: 68 },
  { name: "Partial", value: 22 },
  { name: "Unmatched", value: 10 },
];

const PIE_COLORS = [
  "hsl(185, 72%, 38%)",
  "hsl(38, 92%, 45%)",
  "hsl(0, 72%, 55%)",
];

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const [masterFile, setMasterFile] = useState<File | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("analytics.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("analytics.subtitle")}</p>
      </div>

      {/* Under Construction Banner */}
      <div className="flex items-center gap-3 rounded-lg border border-status-processing/30 bg-status-processing/5 px-4 py-3">
        <Construction className="h-5 w-5 text-status-processing shrink-0" />
        <div>
          <p className="text-sm font-medium text-status-processing">{t("analytics.wip")}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t("analytics.wipDescription")}</p>
        </div>
      </div>

      {/* File Upload */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            {t("analytics.uploadLabel")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileDropZone
            label={t("analytics.uploadLabel")}
            accept=".xlsx,.xls,.csv"
            file={masterFile}
            onFileSelect={setMasterFile}
          />
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar Chart */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">{t("analytics.projectedStock")}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 10, fill: "hsl(215, 16%, 47%)" }}
                    axisLine={{ stroke: "hsl(214, 20%, 88%)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(215, 16%, 47%)" }}
                    axisLine={{ stroke: "hsl(214, 20%, 88%)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(214, 20%, 88%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "hsl(222, 47%, 11%)",
                    }}
                  />
                  <Bar dataKey="current" fill="hsl(214, 20%, 80%)" radius={[4, 4, 0, 0]} name="Current" />
                  <Bar dataKey="projected" fill="hsl(185, 72%, 38%)" radius={[4, 4, 0, 0]} name="Projected" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">{t("analytics.filterEfficiency")}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(214, 20%, 88%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "hsl(222, 47%, 11%)",
                    }}
                    formatter={(value: number) => `${value}%`}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px", color: "hsl(215, 16%, 47%)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
