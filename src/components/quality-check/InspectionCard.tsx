import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  QUALITY_CHECKPOINTS,
  allChecksPassed,
  countFailedChecks,
  countPassedChecks,
} from "@/lib/quality-control";
import type { QualityInspection } from "@/types/quality-control";

interface InspectionCardProps {
  inspection: QualityInspection;
  onView?: (inspection: QualityInspection) => void;
}

export default function InspectionCard({ inspection, onView }: InspectionCardProps) {
  const failCount = countFailedChecks(inspection);
  const passCount = countPassedChecks(inspection);
  const passed = allChecksPassed(inspection);
  const progress = Math.round((passCount / QUALITY_CHECKPOINTS.length) * 100);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-foreground">{inspection.customer_id}</span>
            {passed ? (
              <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-600">
                All Passed
              </span>
            ) : (
              <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                {failCount} {failCount === 1 ? "Issue" : "Issues"}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-blue-600">
            {inspection.job_number}
            {inspection.product_category_id ? ` · ${inspection.product_category_id}` : ""}
          </p>
          {inspection.board_spec && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">{inspection.board_spec}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2 text-right text-[11px] text-muted-foreground">
          <div>
            {inspection.inspector && <div>{inspection.inspector}</div>}
            {inspection.inspected_at && (
              <div className="text-muted-foreground/70">{inspection.inspected_at}</div>
            )}
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onView?.(inspection);
            }}
            className="transition-colors hover:text-primary"
            aria-label={`View inspection ${inspection.job_number}`}
          >
            <Eye className="h-4 w-4 text-muted-foreground/50 hover:text-primary" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 px-5 pb-3">
        {QUALITY_CHECKPOINTS.map((checkpoint) => {
          const checkpointPassed = inspection[checkpoint.key] === "Pass";

          return (
            <div
              key={checkpoint.key}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border py-2.5 text-xs font-medium",
                checkpointPassed
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-600",
              )}
            >
              <span className="text-sm">{checkpointPassed ? "✓" : "✗"}</span>
              <span className="text-[11px]">{checkpoint.shortLabel}</span>
            </div>
          );
        })}
      </div>

      <div className="relative mx-5 mb-3 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "absolute left-0 top-0 h-full rounded-full transition-all",
            passed ? "bg-green-500" : "bg-amber-400",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="px-5 pb-1 text-right text-[11px] text-muted-foreground">
        {passCount}/{QUALITY_CHECKPOINTS.length}
      </div>

      {inspection.remarks && (
        <div className="mt-1 border-t border-border px-5 pb-4 pt-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Remarks:</span> {inspection.remarks}
        </div>
      )}
    </div>
  );
}
