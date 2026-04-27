import { CheckCircle2, X, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  QUALITY_CHECKPOINTS,
  getInspectionMachineLogs,
  getInspectionOutputSummary,
} from "@/lib/quality-control";
import type { QualityInspection } from "@/types/quality-control";

interface InspectionDetailModalProps {
  inspection: QualityInspection | null;
  open: boolean;
  onClose: () => void;
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

export default function InspectionDetailModal({
  inspection,
  open,
  onClose,
}: InspectionDetailModalProps) {
  if (!inspection) {
    return null;
  }

  const output = getInspectionOutputSummary(inspection);
  const machineLogs = getInspectionMachineLogs(inspection.job_number);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden border-border bg-card p-0 shadow-2xl [&>button]:hidden">
        <div className="max-h-[92vh] overflow-y-auto">
          <div className="sticky top-0 z-10 border-b border-border bg-card px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <DialogHeader className="text-left">
                <DialogTitle className="text-base font-semibold text-foreground">
                  Inspection Details
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Review the selected quality inspection, checkpoint outcomes, and related
                  machine output data.
                </DialogDescription>
              </DialogHeader>
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close inspection details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <DetailBlock label="Client" value={inspection.customer_id} />
              <DetailBlock label="Job #" value={inspection.job_number} />
              <DetailBlock label="Product" value={inspection.product_category_id || "—"} />
              <DetailBlock label="Board Spec" value={inspection.board_spec || "—"} />
              <DetailBlock label="Inspector" value={inspection.inspector || "—"} />
              <DetailBlock label="Date" value={inspection.inspected_at || "—"} />
            </div>

            <div className="rounded-xl bg-secondary/40 p-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Daily Output Summary
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {output.produced.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Total produced</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-red-500">
                    {output.defective.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Defective</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-green-600">
                    {output.netGood.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Net Good</p>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Inspection Checkpoints
              </p>
              <div className="space-y-1.5">
                {QUALITY_CHECKPOINTS.map((checkpoint) => {
                  const passed = inspection[checkpoint.key] === "Pass";

                  return (
                    <div
                      key={checkpoint.key}
                      className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-4 font-mono text-[11px] text-muted-foreground">
                          {checkpoint.num}
                        </span>
                        <span className="text-sm text-foreground">{checkpoint.label}</span>
                      </div>
                      {passed ? (
                        <CheckCircle2
                          className="h-[18px] w-[18px] shrink-0 text-green-500"
                        />
                      ) : (
                        <XCircle className="h-[18px] w-[18px] shrink-0 text-red-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Machine Logs
              </p>
              <div className="space-y-2">
                {machineLogs.map((log, index) => (
                  <div
                    key={`${inspection.id}-${index}`}
                    className="rounded-lg border border-border bg-background px-4 py-3"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">{log.stage}</span>
                      <span className="text-[11px] text-muted-foreground">{log.date}</span>
                    </div>
                    <div className="mb-1 flex gap-4 text-xs text-muted-foreground">
                      <span>
                        Produced:{" "}
                        <span className="font-medium text-foreground">
                          {log.produced.toLocaleString()}
                        </span>
                      </span>
                      {log.setting > 0 && (
                        <span>
                          Setting: <span className="font-medium text-amber-500">{log.setting}</span>
                        </span>
                      )}
                      <span>
                        Defects:{" "}
                        <span
                          className={log.defects > 0 ? "font-medium text-red-500" : "font-medium text-green-600"}
                        >
                          {log.defects}
                        </span>
                      </span>
                    </div>
                    {log.note && (
                      <p className="text-[11px] italic text-muted-foreground">{log.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {inspection.remarks && (
              <div className="border-t border-border pt-4">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Inspector Remarks
                </p>
                <p className="text-sm text-foreground">{inspection.remarks}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
