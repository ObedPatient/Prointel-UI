import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QUALITY_CHECKPOINTS } from "@/lib/quality-control";
import { cn } from "@/lib/utils";
import type {
  CreateQualityInspectionData,
  InspectionCheckKey,
  InspectionType,
} from "@/types/quality-control";

interface NewInspectionModalProps {
  open: boolean;
  onSubmit: (data: CreateQualityInspectionData) => void;
  onClose: () => void;
  isLoading: boolean;
  type?: InspectionType;
}

interface FieldProps {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

function buildInitialForm(type: InspectionType): CreateQualityInspectionData {
  return {
    job_number: "",
    customer_id: "",
    product_category_id: "",
    board_spec: "",
    inspector: "",
    inspected_at: "",
    remarks: "",
    type,
    dimensions: "Pass",
    print_colour: "Pass",
    fold_stitch: "Pass",
    glue: "Pass",
    appearance: "Pass",
  };
}

function Field({ label, required = false, className = "", children }: FieldProps) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-medium text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}

export default function NewInspectionModal({
  open,
  onSubmit,
  onClose,
  isLoading,
  type = "Production",
}: NewInspectionModalProps) {
  const [form, setForm] = useState<CreateQualityInspectionData>(() => buildInitialForm(type));

  useEffect(() => {
    if (open) {
      setForm(buildInitialForm(type));
    }
  }, [open, type]);

  const setField = <K extends keyof CreateQualityInspectionData>(
    key: K,
    value: CreateQualityInspectionData[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleCheck = (key: InspectionCheckKey) => {
    setField(key, form[key] === "Pass" ? "Fail" : "Pass");
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden border-border bg-card p-0 shadow-2xl [&>button]:hidden">
        <div className="max-h-[92vh] overflow-y-auto">
          <div className="sticky top-0 z-10 border-b border-border bg-card px-6 pb-4 pt-6">
            <div className="flex items-start justify-between gap-4">
              <DialogHeader className="space-y-0 text-left">
                <DialogTitle className="text-base font-semibold text-foreground">
                  New {type} Inspection
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                  Record QC results for a production job.
                </DialogDescription>
              </DialogHeader>
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close inspection modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit(form);
            }}
            className="space-y-4 p-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <Field label="Job Number" required>
                <Input
                  required
                  value={form.job_number}
                  onChange={(event) => setField("job_number", event.target.value)}
                  placeholder="PC-2026-0041"
                  className="bg-background"
                />
              </Field>
              <Field label="Customer" required>
                <Input
                  required
                  value={form.customer_id}
                  onChange={(event) => setField("customer_id", event.target.value)}
                  placeholder="INYANGE Industries"
                  className="bg-background"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Product / Category">
                <Input
                  value={form.product_category_id}
                  onChange={(event) => setField("product_category_id", event.target.value)}
                  placeholder="Milk Carton 1L Outer"
                  className="bg-background"
                />
              </Field>
              <Field label="Board Spec">
                <Input
                  value={form.board_spec}
                  onChange={(event) => setField("board_spec", event.target.value)}
                  placeholder="RSC 3ply Brown 600x400x350mm"
                  className="bg-background"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Inspector">
                <Input
                  value={form.inspector}
                  onChange={(event) => setField("inspector", event.target.value)}
                  placeholder="Aimee Ingabire"
                  className="bg-background"
                />
              </Field>
              <Field label="Inspection Date">
                <Input
                  type="date"
                  value={form.inspected_at}
                  onChange={(event) => setField("inspected_at", event.target.value)}
                  className="bg-background"
                />
              </Field>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-foreground">Quality Checks</p>
              <div className="grid grid-cols-5 gap-2">
                {QUALITY_CHECKPOINTS.map((checkpoint) => {
                  const passed = form[checkpoint.key] === "Pass";

                  return (
                    <button
                      key={checkpoint.key}
                      type="button"
                      onClick={() => toggleCheck(checkpoint.key)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-lg border py-3 text-xs font-medium transition-all",
                        passed
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-red-200 bg-red-50 text-red-600",
                      )}
                    >
                      <span className="text-base">{passed ? "✓" : "✗"}</span>
                      <span className="text-center text-[11px] leading-tight">
                        {checkpoint.shortLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Field label="Remarks">
              <Textarea
                value={form.remarks}
                onChange={(event) => setField("remarks", event.target.value)}
                placeholder="Any observations or defect notes..."
                rows={2}
                className="resize-none bg-background"
              />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Inspection"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
