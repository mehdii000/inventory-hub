import { cn } from "@/lib/utils";
import { FileOutput, ArrowDown } from "lucide-react";

interface PipelineStep {
  label: string;
  icon: React.ElementType;
}

interface ProcessingPipelineProps {
  steps: PipelineStep[];
  output: string;
}

export function ProcessingPipeline({ steps, output }: ProcessingPipelineProps) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70 mb-4">
        Processing Pipeline
      </p>

      <div className="space-y-0">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="relative">
              {/* Step row */}
              <div className="flex items-center gap-3 group">
                {/* Numbered circle */}
                <div
                  className={cn(
                    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                    "bg-primary/8 text-primary border border-primary/15",
                    "group-hover:bg-primary/15 group-hover:border-primary/25"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary/50 font-mono">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xs text-foreground/80 group-hover:text-foreground transition-colors">
                      {step.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="flex items-center pl-[15px] py-0.5">
                  <div className="w-px h-4 bg-border" />
                </div>
              )}
            </div>
          );
        })}

        {/* Arrow to output */}
        <div className="flex items-center pl-[15px] py-0.5">
          <div className="w-px h-3 bg-border" />
        </div>
        <div className="flex items-center pl-[11px] py-0.5">
          <ArrowDown className="h-3 w-3 text-primary/40" />
        </div>

        {/* Output */}
        <div className="flex items-center gap-3 mt-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-status-success/10 text-status-success border border-status-success/20">
            <FileOutput className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-status-success/60 font-mono uppercase tracking-wider">
              Output
            </span>
            <p className="text-xs font-medium text-foreground/80">{output}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
