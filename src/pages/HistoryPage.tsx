import { useState, useMemo } from "react";
import { Download, Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useHistory, HistoryRecord } from "@/contexts/HistoryContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "success" | "error" | "processing";

const statusVariantMap: Record<HistoryRecord["status"], string> = {
  success: "bg-status-success/15 text-status-success border-status-success/30",
  processing: "bg-status-processing/15 text-status-processing border-status-processing/30",
  error: "bg-status-error/15 text-status-error border-status-error/30",
};

export default function HistoryPage() {
  const { records } = useHistory();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchSearch = r.processorName.toLowerCase().includes(search.toLowerCase()) ||
        r.inputFiles.some((f) => f.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [records, search, statusFilter]);

  const handleDownload = (record: HistoryRecord) => {
    if (!record.outputBlob) return;
    const url = URL.createObjectURL(record.outputBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${record.processorKey}-${record.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filters: { key: StatusFilter; labelKey: string }[] = [
    { key: "all", labelKey: "history.filterAll" },
    { key: "success", labelKey: "history.filterSuccess" },
    { key: "error", labelKey: "history.filterError" },
    { key: "processing", labelKey: "history.filterProcessing" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("history.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("history.subtitle")}</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("history.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {filters.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={statusFilter === f.key ? "default" : "secondary"}
              onClick={() => setStatusFilter(f.key)}
              className="text-xs"
            >
              {t(f.labelKey)}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("history.columns.processor")}</TableHead>
              <TableHead>{t("history.columns.timestamp")}</TableHead>
              <TableHead>{t("history.columns.files")}</TableHead>
              <TableHead>{t("history.columns.status")}</TableHead>
              <TableHead className="text-right">{t("history.columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  {records.length === 0 ? t("history.noRecords") : t("history.noMatch")}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((record) => (
                <TableRow key={record.id} className="group">
                  <TableCell className="font-medium">{record.processorName}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {record.timestamp.toLocaleString()}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                      {record.inputFiles.map((f) => (
                        <span
                          key={f}
                          className="inline-block truncate rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground max-w-[120px]"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-medium uppercase tracking-wider border",
                        statusVariantMap[record.status],
                        record.status === "processing" && "animate-pulse-glow"
                      )}
                    >
                      {t(`status.${record.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {record.status === "success" && record.outputBlob && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(record)}
                          className="h-7 gap-1 text-xs"
                        >
                          <Download className="h-3 w-3" />
                          {t("history.download")}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs">
                        <Eye className="h-3 w-3" />
                        {t("history.viewDetails")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
