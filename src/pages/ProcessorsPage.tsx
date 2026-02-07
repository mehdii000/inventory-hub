import { useState } from "react";
import {
  Globe, Database, ClipboardList,
  FileSpreadsheet, GitMerge, Layers, CheckCircle,
  Filter, XCircle, ArrowRightLeft, Calendar, Calculator,
} from "lucide-react";
import { ProcessorCard } from "@/components/processors/ProcessorCard";
import { ProcessingPipeline } from "@/components/processors/ProcessingPipeline";
import { useLanguage } from "@/contexts/LanguageContext";
import { processGlobalOrders, processMB52, processMB51 } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const processors = {
  "global-orders": {
    icon: Globe,
    steps: [
      { label: "Parse ME2N purchase order export", icon: FileSpreadsheet },
      { label: "Parse All eBM Lotus data file", icon: FileSpreadsheet },
      { label: "Cross-reference & match order entries", icon: GitMerge },
      { label: "Consolidate into unified global orders", icon: Layers },
      { label: "Validate & deduplicate results", icon: CheckCircle },
    ],
    output: "Consolidated Global Orders (.csv)",
  },
  mb52: {
    icon: Database,
    steps: [
      { label: "Load MB52 warehouse stock data", icon: FileSpreadsheet },
      { label: "Filter by plant & storage location", icon: Filter },
      { label: "Remove zero-stock line items", icon: XCircle },
      { label: "Aggregate quantities by material number", icon: Layers },
    ],
    output: "Filtered Stock Report (.csv)",
  },
  mb51: {
    icon: ClipboardList,
    getSteps: (mvt: string) => [
      { label: "Load MB51 material documents", icon: FileSpreadsheet },
      { label: `Filter by movement type (${mvt})`, icon: ArrowRightLeft },
      { label: "Extract relevant date-range entries", icon: Calendar },
      { label: "Summarize quantities by material", icon: Calculator },
    ],
    output: "Filtered Movement Report (.csv)",
  },
};

export default function ProcessorsPage() {
  const { t } = useLanguage();
  const [movementType, setMovementType] = useState<string>("102");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("processors.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("processors.subtitle")}</p>
      </div>

      <Tabs defaultValue="global-orders" className="w-full">
        <TabsList className="mb-6 h-auto p-1 gap-1 bg-muted/60">
          <TabsTrigger
            value="global-orders"
            className="gap-2 px-4 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <Globe className="h-4 w-4" />
            <span>{t("processors.globalOrders.title")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="mb52"
            className="gap-2 px-4 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <Database className="h-4 w-4" />
            <span>{t("processors.mb52.title")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="mb51"
            className="gap-2 px-4 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <ClipboardList className="h-4 w-4" />
            <span>{t("processors.mb51.title")}</span>
          </TabsTrigger>
        </TabsList>

        {/* ── Global Orders ──────────────────────── */}
        <TabsContent value="global-orders">
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <ProcessorCard
                titleKey="processors.globalOrders.title"
                descriptionKey="processors.globalOrders.description"
                processorKey="global-orders"
                icon={processors["global-orders"].icon}
                fileInputs={[
                  { id: "me2n", labelKey: "processors.globalOrders.file1Label", accept: ".xlsx,.xls,.csv" },
                  { id: "ebm", labelKey: "processors.globalOrders.file2Label", accept: ".xlsx,.xls,.csv" },
                ]}
                onProcess={(files) => processGlobalOrders(files[0], files[1])}
              />
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-border/60 bg-card p-6 h-full">
                <ProcessingPipeline
                  steps={processors["global-orders"].steps}
                  output={processors["global-orders"].output}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── MB52 Filter ────────────────────────── */}
        <TabsContent value="mb52">
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <ProcessorCard
                titleKey="processors.mb52.title"
                descriptionKey="processors.mb52.description"
                processorKey="mb52"
                icon={processors.mb52.icon}
                fileInputs={[
                  { id: "mb52", labelKey: "processors.mb52.file1Label", accept: ".xlsx,.xls,.csv" },
                ]}
                onProcess={(files) => processMB52(files[0])}
              />
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-border/60 bg-card p-6 h-full">
                <ProcessingPipeline
                  steps={processors.mb52.steps}
                  output={processors.mb52.output}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── MB51 Filter ────────────────────────── */}
        <TabsContent value="mb51">
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <ProcessorCard
                titleKey="processors.mb51.title"
                descriptionKey="processors.mb51.description"
                processorKey="mb51"
                icon={processors.mb51.icon}
                fileInputs={[
                  { id: "mb51", labelKey: "processors.mb51.file1Label", accept: ".xlsx,.xls,.csv" },
                ]}
                onProcess={(files) => processMB51(files[0], movementType)}
              >
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("processors.mb51.movementType")}
                  </label>
                  <Select value={movementType} onValueChange={setMovementType}>
                    <SelectTrigger className="w-full h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="102">102 — Goods Receipt Reversal</SelectItem>
                      <SelectItem value="202">202 — Goods Issue Reversal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </ProcessorCard>
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-border/60 bg-card p-6 h-full">
                <ProcessingPipeline
                  steps={processors.mb51.getSteps(movementType)}
                  output={processors.mb51.output}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
