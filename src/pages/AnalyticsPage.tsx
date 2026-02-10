import { Construction, FileSpreadsheet } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { analyticsGroups } from "@/components/analytics/modules/registry";
import { AnalyticsGroupPanel } from "@/components/analytics/AnalyticsGroupPanel";

export default function AnalyticsPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("analytics.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("analytics.subtitle")}</p>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-status-processing/30 bg-status-processing/5 px-4 py-3">
        <Construction className="h-5 w-5 text-status-processing shrink-0" />
        <div>
          <p className="text-sm font-medium text-status-processing">{t("analytics.wip")}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t("analytics.wipDescription")}</p>
        </div>
      </div>

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
                {group.modules.length}
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
