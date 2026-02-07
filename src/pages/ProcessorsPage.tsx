import { useState } from "react";
import { ProcessorCard } from "@/components/processors/ProcessorCard";
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
        <TabsList className="mb-4">
          <TabsTrigger value="global-orders">
            {t("processors.globalOrders.title")}
          </TabsTrigger>
          <TabsTrigger value="mb52">
            {t("processors.mb52.title")}
          </TabsTrigger>
          <TabsTrigger value="mb51">
            {t("processors.mb51.title")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global-orders">
          <div className="max-w-lg">
            <ProcessorCard
              titleKey="processors.globalOrders.title"
              descriptionKey="processors.globalOrders.description"
              processorKey="global-orders"
              fileInputs={[
                { id: "me2n", labelKey: "processors.globalOrders.file1Label", accept: ".xlsx,.xls,.csv" },
                { id: "ebm", labelKey: "processors.globalOrders.file2Label", accept: ".xlsx,.xls,.csv" },
              ]}
              onProcess={(files) => processGlobalOrders(files[0], files[1])}
              steps={[
                "Parse ME2N purchase order export",
                "Parse All eBM Lotus data file",
                "Cross-reference & match order entries",
                "Consolidate into unified global orders",
                "Validate & deduplicate results",
              ]}
              output="Consolidated Global Orders (.csv)"
            />
          </div>
        </TabsContent>

        <TabsContent value="mb52">
          <div className="max-w-lg">
            <ProcessorCard
              titleKey="processors.mb52.title"
              descriptionKey="processors.mb52.description"
              processorKey="mb52"
              fileInputs={[
                { id: "mb52", labelKey: "processors.mb52.file1Label", accept: ".xlsx,.xls,.csv" },
              ]}
              onProcess={(files) => processMB52(files[0])}
              steps={[
                "Load MB52 warehouse stock data",
                "Filter by plant & storage location",
                "Remove zero-stock line items",
                "Aggregate quantities by material number",
              ]}
              output="Filtered Stock Report (.csv)"
            />
          </div>
        </TabsContent>

        <TabsContent value="mb51">
          <div className="max-w-lg">
            <ProcessorCard
              titleKey="processors.mb51.title"
              descriptionKey="processors.mb51.description"
              processorKey="mb51"
              fileInputs={[
                { id: "mb51", labelKey: "processors.mb51.file1Label", accept: ".xlsx,.xls,.csv" },
              ]}
              onProcess={(files) => processMB51(files[0], movementType)}
              steps={[
                `Load MB51 material documents`,
                `Filter by movement type (${movementType})`,
                "Extract relevant date-range entries",
                "Summarize quantities by material",
              ]}
              output="Filtered Movement Report (.csv)"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("processors.mb51.movementType")}
                </label>
                <Select value={movementType} onValueChange={setMovementType}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="102">102 — Goods Receipt Reversal</SelectItem>
                    <SelectItem value="202">202 — Goods Issue Reversal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </ProcessorCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
