import { useState, useCallback, ReactNode } from "react";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileDropZone } from "@/components/processors/FileDropZone";
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
  icon: React.ElementType;
  fileInputs: FileInputConfig[];
  onProcess: (files: File[]) => Promise<Blob>;
  children?: ReactNode;
}

export function ProcessorCard({
  titleKey,
  descriptionKey,
  processorKey,
  icon: Icon,
  fileInputs,
  onProcess,
  children,
}: ProcessorCardProps) {
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const { addRecord, updateRecord } = useHistory();
  const { t } = useLanguage();

  const allFilesReady = fileInputs.every(
    (fi) => files[fi.id] !== undefined && files[fi.id] !== null
  );

  const handleFileSelect = useCallback((inputId: string, file: File) => {
    setFiles((prev) => ({ ...prev, [inputId]: file }));
  }, []);

  const handleClearFile = useCallback((inputId: string) => {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[inputId];
      return next;
    });
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
  }, [
    allFilesReady, isProcessing, fileInputs, files,
    addRecord, updateRecord, onProcess, t, titleKey, processorKey,
  ]);

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card p-6 animate-fade-in transition-all duration-300",
        "hover:shadow-md hover:shadow-primary/5",
        isProcessing && "border-glow ring-1 ring-primary/10"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{t(titleKey)}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {t(descriptionKey)}
          </p>
        </div>
      </div>

      {/* File Inputs */}
      <div className="space-y-3">
        {fileInputs.map((fi) => (
          <FileDropZone
            key={fi.id}
            label={t(fi.labelKey)}
            accept={fi.accept}
            file={files[fi.id] ?? null}
            onFileSelect={(file) => handleFileSelect(fi.id, file)}
            onClear={() => handleClearFile(fi.id)}
            disabled={isProcessing}
          />
        ))}
      </div>

      {/* Extra controls (e.g., movement type select) */}
      {children && <div className="mt-4">{children}</div>}

      {/* Process Button */}
      <Button
        onClick={handleProcess}
        disabled={!allFilesReady || isProcessing}
        className="w-full mt-5 h-11 text-sm font-medium gap-2"
        size="lg"
      >
        {isProcessing ? (
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
    </div>
  );
}
