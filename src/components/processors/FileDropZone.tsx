import { useRef, useState, useCallback } from "react";
import { Upload, FileCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  label: string;
  accept?: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function FileDropZone({ label, accept, file, onFileSelect, disabled }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) onFileSelect(droppedFile);
    },
    [disabled, onFileSelect]
  );

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) onFileSelect(selectedFile);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex min-h-[80px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200",
          disabled && "pointer-events-none opacity-50",
          isDragging
            ? "border-primary bg-primary/5"
            : file
            ? "border-status-success/40 bg-status-success/5"
            : "border-border hover:border-primary/40 hover:bg-primary/5"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {file ? (
          <div className="flex items-center gap-2 px-3 py-2">
            <FileCheck className="h-4 w-4 text-status-success" />
            <span className="text-xs text-foreground font-mono truncate max-w-[180px]">
              {file.name}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-2">
            <Upload className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{t("processors.dropHint")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
