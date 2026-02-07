import { ProcessorCard } from "@/components/processors/ProcessorCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { processGlobalOrders, processMB52, processMB51 } from "@/services/api";

export default function ProcessorsPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("processors.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("processors.subtitle")}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ProcessorCard
          titleKey="processors.globalOrders.title"
          descriptionKey="processors.globalOrders.description"
          processorKey="global-orders"
          fileInputs={[
            { id: "me2n", labelKey: "processors.globalOrders.file1Label", accept: ".xlsx,.xls,.csv" },
            { id: "ebm", labelKey: "processors.globalOrders.file2Label", accept: ".xlsx,.xls,.csv" },
          ]}
          onProcess={(files) => processGlobalOrders(files[0], files[1])}
        />

        <ProcessorCard
          titleKey="processors.mb52.title"
          descriptionKey="processors.mb52.description"
          processorKey="mb52"
          fileInputs={[
            { id: "mb52", labelKey: "processors.mb52.file1Label", accept: ".xlsx,.xls,.csv" },
          ]}
          onProcess={(files) => processMB52(files[0])}
        />

        <ProcessorCard
          titleKey="processors.mb51.title"
          descriptionKey="processors.mb51.description"
          processorKey="mb51"
          fileInputs={[
            { id: "mb51", labelKey: "processors.mb51.file1Label", accept: ".xlsx,.xls,.csv" },
          ]}
          onProcess={(files) => processMB51(files[0])}
        />
      </div>
    </div>
  );
}
