import { useState } from "react";
import {
  Globe, Database, ClipboardList,
  FileSpreadsheet, GitMerge, Layers, CheckCircle,
  Filter, XCircle, ArrowRightLeft, Calendar, Calculator,
  Search,
  Clock,
  Archive,
  Edit3,
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
      { label: "Filter ME2N for open delivery quantities", icon: Filter },
      { label: "Parse LOTUS data and map 18 standard columns", icon: FileSpreadsheet },
      { label: "Filter LOTUS for CC 47000 and unassigned POs", icon: Search },
      { label: "Align column schemas and concatenate datasets", icon: GitMerge },
      { label: "Aggregate total quantity by SAP article number", icon: Calculator },
    ],
    output: "Consolidated Global Orders (.xlsx)",
  },
  "mb52": {
    icon: Database,
    steps: [
      { label: "Load MB52 warehouse stock data", icon: FileSpreadsheet },
      { label: "Merge and sum Storage Locations 1000 & 8888", icon: Layers },
      { label: "Isolate Storage Location 9999 entries", icon: Filter },
      { label: "Generate timestamped files for each group", icon: Clock },
      { label: "Package multiple reports into ZIP archive", icon: Archive },
    ],
    output: "Split Stock Reports (.zip / .xlsx)",
  },
  "mb51": {
    icon: ClipboardList,
    getSteps: (mvt: string) => [
      { label: "Load MB51 documents and clean header text", icon: FileSpreadsheet },
      { label: `Split data into ${mvt} and reversal (${Number(mvt) + 1}) groups`, icon: ArrowRightLeft },
      { label: "Reconcile reversals with matching receipts", icon: CheckCircle },
      { label: "Adjust partial quantities and local currency prices", icon: Calculator },
      { label: "Relabel Storage Location 1000 to 8888", icon: Edit3 },
    ],
    output: "Reconciled Movement Report (.xlsx)",
  }
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
                onProcess={async (files) => {
                  // 1. Call your Python API function (files[0] = me2n, files[1] = ebm)
                  const blob = await processGlobalOrders(files[0], files[1]);

                  // 2. Prepare the naming logic
                  const timestamp = new Date().toISOString().split('T')[0];
                  const defaultName = `GlobalOrders_${timestamp}.xlsx`;

                  // 3. Convert Blob to ArrayBuffer for the Electron bridge
                  const arrayBuffer = await blob.arrayBuffer();

                  // 4. Trigger the native Save Dialog via the preload API we set up
                  const success = await window.electronAPI.saveProcessedFile(arrayBuffer, defaultName);

                  if (success) {
                    console.log("Global Orders file saved successfully!");
                  }

                  // Return blob to satisfy the onProcess signature
                  return blob;
                }}
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
                onProcess={async (files) => {
                  // 1. Call your existing Python API function
                  const blob = await processMB52(files[0]);

                  // 2. Prepare for Electron
                  const extension = blob.type === 'application/zip' ? 'zip' : 'xlsx';
                  const defaultName = `MB52_Filtered_${new Date().toISOString().split('T')[0]}.${extension}`;
                  
                  // 3. Convert Blob to ArrayBuffer (required for IPC transfer)
                  const arrayBuffer = await blob.arrayBuffer();

                  // 4. Send to Electron Main Process
                  const success = await window.electronAPI.saveProcessedFile(arrayBuffer, defaultName);

                  if (success) {
                    console.log("File saved to disk!");
                  }

                  // Return the blob back to the card if it needs it for internal state/UI
                  return blob;
                }}
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
                onProcess={async (files) => { 
                  const blob = await processMB51(files[0], Number(movementType));
                  
                  const arrayBuffer = await blob.arrayBuffer();
                  // only year and month
                  const timestamp = new Date().toISOString().split('T')[0].slice(0, 7).replace('-', '');
                  const defaultName = `MB51-Filtered-${timestamp}.xlsx`;

                  // Native Electron Save
                  await window.electronAPI.saveProcessedFile(arrayBuffer, defaultName);
                  
                  return blob;
                }}
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
                      <SelectItem value="102">102</SelectItem>
                      <SelectItem value="202">202</SelectItem>
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
