import { useMemo, useState, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { useCurrentPng } from "recharts-to-png";
import { Table2, LineChart as LineChartIcon, Building2, Download, Image as ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { StockRuptureData } from "@/services/analyticsApi";

interface Props {
  data: StockRuptureData;
}

const COLORS = {
  Test: "hsl(185, 72%, 38%)",
  PDR: "hsl(38, 92%, 45%)",
  Other: "hsl(0, 72%, 55%)",
};

// --- HELPER: Process Data ---
function processSiteData(siteData: Record<string, { Test: number; PDR: number; Other: number }>) {
  return Object.entries(siteData || {})
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
}

export function StockRuptureResults({ data }: Props) {
  const [activeSite, setActiveSite] = useState<keyof StockRuptureData>("TAN_9999");
  const [dateFilter, setDateFilter] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Hook for chart capture
  const [getPng, {ref: chartRef }] = useCurrentPng({});

  const currentRows = useMemo(() => {
    const siteData = data[activeSite] || {};
    const processed = processSiteData(siteData);
    if (!dateFilter) return processed;
    return processed.filter(r => r.rawDate.includes(dateFilter.toLowerCase()));
  }, [data, activeSite, dateFilter]);

  // --- EXPORT 1: PNG Image Only ---
  const handleExportPng = useCallback(async () => {
    setIsExporting(true);
    try {
      // 1. Get the container from the working Ref
      const container = chartRef.current?.container;
      const svgElement = container?.querySelector('svg');

      if (!svgElement) throw new Error("SVG not found");

      // 2. CLONE the SVG so we don't mess up the UI while processing
      const clonedSvg = svgElement.cloneNode(true) as SVGElement;

      // 3. FIX COLORS: Copy computed styles to inline attributes
      // This ensures that 'hsl(...)' colors defined in CSS are hardcoded into the export
      const copyStyles = (source: Element, target: Element) => {
        const sourceStyles = window.getComputedStyle(source);
        
        // Copy essential visual properties
        const props = ['fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 'opacity'];
        props.forEach(prop => {
          const value = sourceStyles.getPropertyValue(prop);
          if (value) target.setAttribute(prop, value);
        });

        // Recurse through children (to fix lines, dots, and legend text)
        for (let i = 0; i < source.children.length; i++) {
          copyStyles(source.children[i], target.children[i]);
        }
      };

      copyStyles(svgElement, clonedSvg);

      // 4. Serialize the "Fixed" SVG
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(clonedSvg);

      // 5. Render to Canvas (Higher Quality)
      const canvas = document.createElement("canvas");
      const bbox = svgElement.getBoundingClientRect();
      const scale = 2; // High DPI
      canvas.width = bbox.width * scale;
      canvas.height = bbox.height * scale;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = async () => {
        // Background and Scaling
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        const pngData = canvas.toDataURL("image/png");
        const fileName = `Chart_${activeSite}_${new Date().toISOString().slice(0, 10)}.png`;
        
        await window.electronAPI.saveProcessedFile(pngData, fileName);
        
        URL.revokeObjectURL(url);
        setIsExporting(false);
      };

      img.src = url;
    } catch (e) {
      console.error("Export failed:", e);
      setIsExporting(false);
    }
  }, [activeSite, chartRef]);

  // --- EXPORT 2: Excel with 2 Sheets ---
  const handleExportExcel = useCallback(async () => {
    setIsExporting(true);
    try {
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      
      const sites = [
        { key: "TAN_9999" as const, label: "Site 9999 (TAN)" },
        { key: "BKN_8888" as const, label: "Site 8888 (BKN)" },
      ];

      sites.forEach(site => {
        const ws = workbook.addWorksheet(site.label);
        const rows = processSiteData(data[site.key]);

        // 1. Set Column Definitions (with better widths)
        ws.columns = [
          { key: "date", width: 22 },
          { key: "test", width: 15 },
          { key: "pdr", width: 15 },
          { key: "other", width: 15 },
          { key: "total", width: 18 },
        ];

        // 2. Add Aesthetic Header Title
        ws.mergeCells("A1:E1");
        const titleRow = ws.getCell("A1");
        titleRow.value = `STOCK RUPTURE: ${site.label}, YEAR: ${new Date().getFullYear()} MONTH: ${new Date().toLocaleString('default', { month: 'long' })}`;
        titleRow.font = { name: 'Arial Black', size: 14, color: { argb: 'FF1E293B' } };
        titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
        ws.getRow(1).height = 30;

        // 3. Add Table Headers (Row 3)
        const headerRow = ws.addRow(["DATE", "TEST", "PDR", "OTHER", "GRAND TOTAL"]);
        headerRow.height = 20;

        // Style the Header Row
        headerRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF334155' } // Slate-700
          };
          cell.font = {
            bold: true,
            color: { argb: 'FFFFFFFF' },
            size: 11
          };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = {
            bottom: { style: 'thin', color: { argb: 'FF000000' } }
          };
        });

        // 4. Add Data Rows with Zebra Striping
        rows.forEach((r, index) => {
          const row = ws.addRow([r.rawDate, r.Test, r.PDR, r.Other, r.total]);
          
          // Zebra Striping: Light blue-grey for even rows
          if (index % 2 === 0) {
            row.eachCell(cell => {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF1F5F9' } // Slate-50
              };
            });
          }

          // Cell Alignment & Font
          row.eachCell((cell, colNumber) => {
            cell.alignment = { horizontal: colNumber === 1 ? 'left' : 'center' };
            cell.font = { name: 'Segoe UI', size: 10 };
            
            // Bold the total column
            if (colNumber === 5) {
              cell.font = { bold: true };
            }
          });
        });

        // 5. Add a Border around the whole data set
        ws.getRow(rows.length + 3).border = {
          bottom: { style: 'medium', color: { argb: 'FF334155' } }
        };

      });

      const buffer = await workbook.xlsx.writeBuffer();
      const fileName = `Stock_Rupture_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      await window.electronAPI.saveProcessedFile(buffer, fileName);
      
    } catch (e) {
      console.error("Excel Export failed", e);
    } finally {
      setIsExporting(false);
    }
  }, [data]);

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border">
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" /> Site
            </span>
            <Select value={activeSite} onValueChange={(v: never) => setActiveSite(v)}>
              <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TAN_9999">Site 9999 (TAN)</SelectItem>
                <SelectItem value="BKN_8888">Site 8888 (BKN)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input 
            placeholder="Filter dates..." 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-9 w-40 mt-5"
          />
        </div>

        <Button onClick={handleExportExcel} disabled={isExporting} className="gap-2">
          <Download className="h-4 w-4" /> Export All (Excel)
        </Button>
      </div>

      <Tabs defaultValue="chart">
        <TabsList className="mb-4">
          <TabsTrigger value="chart" className="gap-2"><LineChartIcon className="h-4 w-4" /> Chart View</TabsTrigger>
          <TabsTrigger value="data" className="gap-2"><Table2 className="h-4 w-4" /> Data Table</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-4">
          <div className="p-6 bg-card border rounded-xl relative">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart ref={chartRef} data={currentRows} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="shortDate" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line isAnimationActive={false} type="monotone" dataKey="Test" stroke={COLORS.Test} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line isAnimationActive={false} type="monotone" dataKey="PDR" stroke={COLORS.PDR} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line isAnimationActive={false} type="monotone" dataKey="Other" stroke={COLORS.Other} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 pt-4 border-t flex justify-end">
              <Button variant="outline" size="sm" onClick={handleExportPng} disabled={isExporting} className="gap-2">
                <ImageIcon className="h-4 w-4" /> Save {activeSite === "TAN_9999" ? "9999" : "8888"} Chart as PNG
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="data">
          <div className="border rounded-xl overflow-hidden bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-right">Test</th>
                  <th className="p-3 text-right">PDR</th>
                  <th className="p-3 text-right">Other</th>
                  <th className="p-3 text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((row) => (
                  <tr key={row.rawDate} className="border-t hover:bg-muted/10">
                    <td className="p-3 font-mono">{row.date}</td>
                    <td className="p-3 text-right">{row.Test}</td>
                    <td className="p-3 text-right">{row.PDR}</td>
                    <td className="p-3 text-right">{row.Other}</td>
                    <td className="p-3 text-right font-bold">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
