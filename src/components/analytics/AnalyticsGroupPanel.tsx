import { useState } from "react";
import { FileSpreadsheet, Lock, ChevronRight, Play, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileDropZone } from "@/components/processors/FileDropZone";
import { toast } from "sonner";
import type { AnalyticsGroup, AnalyticModule } from "./types";

/* ─── Placeholder card ─── */

function PlaceholderCard({ module, t }: { module: AnalyticModule; t: (k: string) => string }) {
  const Icon = module.icon;
  return (
    <div className="group relative rounded-xl border border-border/60 bg-card p-5 transition-all hover:shadow-md hover:border-primary/20">
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
          <h3 className="text-sm font-semibold text-foreground">{t(module.titleKey)}</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t(module.descriptionKey)}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
        <ChevronRight className="h-3 w-3" />
        <span>{t("analytics.plannedFeature")}</span>
      </div>
    </div>
  );
}

/* ─── Group panel ─── */

interface Props {
  group: AnalyticsGroup;
  t: (key: string) => string;
}

export function AnalyticsGroupPanel({ group, t }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  // Store results keyed by module id
  const [results, setResults] = useState<Record<string, unknown>>({});

  const implementedModules = group.modules.filter((m) => m.implemented);
  const placeholderModules = group.modules.filter((m) => !m.implemented);

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    setResults({});
    try {
      // Run all implemented modules in parallel
      const entries = await Promise.all(
        implementedModules
          .filter((m) => m.fetchData)
          .map(async (m) => {
            const data = await m.fetchData!(file);
            return [m.id, data] as const;
          })
      );
      const newResults: Record<string, unknown> = {};
      for (const [id, data] of entries) {
        if (data && typeof data === "object" && Object.keys(data).length > 0) {
          newResults[id] = data;
        }
      }
      if (Object.keys(newResults).length === 0) {
        toast.error("No data found in the file.");
      } else {
        setResults(newResults);
        toast.success("Analysis complete.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process file.");
    } finally {
      setLoading(false);
    }
  };

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
            {group.modules.length} {group.modules.length === 1 ? "analytic" : "analytics"} share this input
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <FileDropZone
            label={group.inputFileLabel}
            accept={group.accept}
            file={file}
            onFileSelect={setFile}
          />
          {implementedModules.length > 0 && (
            <Button onClick={handleProcess} disabled={!file || loading} className="w-full h-11 gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("processors.processing")}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  {t("processors.process")}
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Implemented module results */}
      {implementedModules.map((mod) => {
        const data = results[mod.id];
        if (!data || !mod.ResultComponent) return null;
        const ResultComp = mod.ResultComponent;
        const Icon = mod.icon;
        return (
          <Card key={mod.id} className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                {t(mod.titleKey)}
              </CardTitle>
              <CardDescription className="text-xs">{t(mod.descriptionKey)}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResultComp data={data} />
            </CardContent>
          </Card>
        );
      })}

      {/* Placeholder cards */}
      {placeholderModules.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {placeholderModules.map((mod) => (
            <PlaceholderCard key={mod.id} module={mod} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
