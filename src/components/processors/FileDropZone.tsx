import { useRef, useState, useCallback } from "react";
import { Upload, FileCheck, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  label: string;
  accept?: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  disabled?: boolean;
}

export function FileDropZone({ label, accept, file, onFileSelect, onClear, disabled }: FileDropZoneProps) {
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
    <div className="space-y-2">
      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "group relative flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-250",
          disabled && "pointer-events-none opacity-40",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : file
            ? "border-primary/30 bg-primary/[0.03]"
            : "border-border hover:border-primary/40 hover:bg-muted/50"
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
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileCheck className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground truncate max-w-[200px]">
                {file.name}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            {onClear && (
              <button
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Upload className="h-5 w-5" />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {t("processors.dropHint")}
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">.xlsx, .xls, .csv</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
