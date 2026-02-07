import { useState, useCallback, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileDropZone } from "@/components/processors/FileDropZone";
import { ProcessingPipeline } from "@/components/processors/ProcessingPipeline";
import { useHistory } from "@/contexts/HistoryContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export interface FileInputConfig {
  id: string;
  labelKey: string;
  accept?: string;
}

interface ProcessorCardProps {
  titleKey: string;
  descriptionKey: string;
  processorKey: string;
  fileInputs: FileInputConfig[];
  onProcess: (files: File[]) => Promise<Blob>;
  steps?: string[];
  output?: string;
  children?: ReactNode;
}

export function ProcessorCard({
  titleKey,
  descriptionKey,
  processorKey,
  fileInputs,
  onProcess,
  steps,
  output,
  children,
}: ProcessorCardProps) {
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const { addRecord, updateRecord } = useHistory();
  const { t } = useLanguage();

  const allFilesReady = fileInputs.every((fi) => files[fi.id] !== undefined && files[fi.id] !== null);

  const handleFileSelect = useCallback((inputId: string, file: File) => {
    setFiles((prev) => ({ ...prev, [inputId]: file }));
  }, []);

  const handleProcess = useCallback(async () => {
    if (!allFilesReady || isProcessing) return;

    setIsProcessing(true);

    const fileList = fileInputs.map((fi) => files[fi.id]!);
    const inputFileNames = fileList.map((f) => f.name);

    const recordId = addRecord({
      processorName: t(titleKey),
      processorKey,
      timestamp: new Date(),
      status: "processing",
      inputFiles: inputFileNames,
    });

    try {
      const blob = await onProcess(fileList);
      updateRecord(recordId, { status: "success", outputBlob: blob });
    } catch {
      updateRecord(recordId, { status: "error" });
    } finally {
      setIsProcessing(false);
      setFiles({});
    }
  }, [allFilesReady, isProcessing, fileInputs, files, addRecord, updateRecord, onProcess, t, titleKey, processorKey]);

  return (
    <Card className={cn(
      "animate-fade-in border-border/60 transition-shadow hover:shadow-lg hover:shadow-primary/5",
      isProcessing && "border-glow"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{t(titleKey)}</CardTitle>
        <CardDescription className="text-xs leading-relaxed">
          {t(descriptionKey)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fileInputs.map((fi) => (
          <FileDropZone
            key={fi.id}
            label={t(fi.labelKey)}
            accept={fi.accept}
            file={files[fi.id] ?? null}
            onFileSelect={(file) => handleFileSelect(fi.id, file)}
            disabled={isProcessing}
          />
        ))}

        {children}

        <Button
          onClick={handleProcess}
          disabled={!allFilesReady || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("processors.processing")}
            </>
          ) : (
            t("processors.process")
          )}
        </Button>

        {steps && steps.length > 0 && output && (
          <>
            <Separator className="my-2" />
            <ProcessingPipeline steps={steps} output={output} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
