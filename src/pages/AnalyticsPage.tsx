import { useState } from "react";
import {
  Construction, FileSpreadsheet, Lock, TrendingDown, Package,
  BarChart3, Warehouse, Clock, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileDropZone } from "@/components/processors/FileDropZone";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

/* ─── Analytics group definitions ─── */

interface AnalyticItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ElementType;
}

interface AnalyticsGroup {
  id: string;
  labelKey: string;
  descriptionKey: string;
  inputFileLabel: string;
  accept: string;
  items: AnalyticItem[];
}

const analyticsGroups: AnalyticsGroup[] = [
  {
    id: "etat-journalier",
    labelKey: "analytics.groups.etatJournalier",
    descriptionKey: "analytics.groups.etatJournalierDesc",
    inputFileLabel: "Etat Journalier de Stock",
    accept: ".xlsx,.xls,.csv",
    items: [
      {
        id: "monthly-stock-rupture",
        titleKey: "analytics.placeholders.monthlyStockRupture.title",
        descriptionKey: "analytics.placeholders.monthlyStockRupture.description",
        icon: TrendingDown,
      },
      {
        id: "stock-coverage",
        titleKey: "analytics.placeholders.stockCoverage.title",
        descriptionKey: "analytics.placeholders.stockCoverage.description",
        icon: Package,
      },
      {
        id: "consumption-trend",
        titleKey: "analytics.placeholders.consumptionTrend.title",
        descriptionKey: "analytics.placeholders.consumptionTrend.description",
        icon: BarChart3,
      },
    ],
  },
  {
    id: "other",
    labelKey: "analytics.groups.otherAnalytics",
    descriptionKey: "analytics.groups.otherAnalyticsDesc",
    inputFileLabel: "Master Inventory Data",
    accept: ".xlsx,.xls,.csv",
    items: [
      {
        id: "slow-moving",
        titleKey: "analytics.placeholders.slowMoving.title",
        descriptionKey: "analytics.placeholders.slowMoving.description",
        icon: Clock,
      },
      {
        id: "warehouse-utilization",
        titleKey: "analytics.placeholders.warehouseUtilization.title",
        descriptionKey: "analytics.placeholders.warehouseUtilization.description",
        icon: Warehouse,
      },
    ],
  },
];

/* ─── Placeholder card for a single analytic ─── */

function AnalyticPlaceholderCard({ item, t }: { item: AnalyticItem; t: (key: string) => string }) {
  const Icon = item.icon;

  return (
    <div className="group relative rounded-xl border border-border/60 bg-card p-5 transition-all hover:shadow-md hover:border-primary/20">
      {/* Coming Soon ribbon */}
      <div className="absolute top-3 right-3">
        <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider gap-1 bg-muted text-muted-foreground">
          <Lock className="h-3 w-3" />
          {t("analytics.comingSoon")}
        </Badge>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 pr-20">
          <h3 className="text-sm font-semibold text-foreground">{t(item.titleKey)}</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t(item.descriptionKey)}</p>
        </div>
      </div>

      {/* Subtle bottom indicator */}
      <div className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
        <ChevronRight className="h-3 w-3" />
        <span>{t("analytics.plannedFeature")}</span>
      </div>
    </div>
  );
}

/* ─── Group panel: shared file input + analytics cards ─── */

function AnalyticsGroupPanel({ group, t }: { group: AnalyticsGroup; t: (key: string) => string }) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Group header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t(group.labelKey)}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{t(group.descriptionKey)}</p>
      </div>

      {/* Shared file input */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-primary" />
            {t("analytics.inputFile")}: {group.inputFileLabel}
          </CardTitle>
          <CardDescription className="text-xs">
            {group.items.length} {group.items.length === 1 ? "analytic" : "analytics"} share this input
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileDropZone
            label={group.inputFileLabel}
            accept={group.accept}
            file={file}
            onFileSelect={setFile}
          />
        </CardContent>
      </Card>

      {/* Analytics cards grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {group.items.map((item) => (
          <AnalyticPlaceholderCard key={item.id} item={item} t={t} />
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function AnalyticsPage() {
  const { t } = useLanguage();

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

      {/* Tabbed groups */}
      <Tabs defaultValue={analyticsGroups[0].id} className="w-full">
        <TabsList className="mb-6 h-auto p-1 gap-1 bg-muted/60">
          {analyticsGroups.map((group) => (
            <TabsTrigger
              key={group.id}
              value={group.id}
              className="gap-2 px-4 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>{t(group.labelKey)}</span>
              <Badge variant="outline" className="ml-1 text-[10px] h-5 px-1.5 font-mono">
                {group.items.length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {analyticsGroups.map((group) => (
          <TabsContent key={group.id} value={group.id}>
            <AnalyticsGroupPanel group={group} t={t} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
