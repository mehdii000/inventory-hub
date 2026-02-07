import { cn } from "@/lib/utils";
import { FileOutput } from "lucide-react";

interface ProcessingPipelineProps {
  steps: string[];
  output: string;
}

export function ProcessingPipeline({ steps, output }: ProcessingPipelineProps) {
  return (
    <div className="space-y-0 pt-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        Pipeline
      </p>
      <div className="relative pl-5">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />

        {steps.map((step, i) => (
          <div key={i} className="relative flex items-start gap-3 pb-3 last:pb-2">
            {/* Circle */}
            <div
              className={cn(
                "relative z-10 flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full text-[8px] font-bold -ml-5",
                "bg-primary/10 text-primary border border-primary/20"
              )}
            >
              {i + 1}
            </div>
            <span className="text-xs text-muted-foreground leading-[15px]">{step}</span>
          </div>
        ))}

        {/* Output */}
        <div className="relative flex items-start gap-3">
          <div className="relative z-10 flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full -ml-5 bg-status-success/15 text-status-success border border-status-success/25">
            <FileOutput className="h-2.5 w-2.5" />
          </div>
          <span className="text-xs font-medium text-foreground/80 leading-[15px]">{output}</span>
        </div>
      </div>
    </div>
  );
}
