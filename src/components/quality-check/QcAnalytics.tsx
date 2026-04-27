import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  QUALITY_CHECKPOINTS,
  allChecksPassed,
  buildQualityOutputRows,
  countPassedChecks,
} from "@/lib/quality-control";
import { cn } from "@/lib/utils";
import type { QualityInspection } from "@/types/quality-control";

interface QcAnalyticsProps {
  inspections: QualityInspection[];
}

export default function QcAnalytics({ inspections }: QcAnalyticsProps) {
  const outputRows = buildQualityOutputRows(inspections);
  const failureCounts = QUALITY_CHECKPOINTS.map((checkpoint) => ({
    key: checkpoint.key,
    label: checkpoint.label,
    count: inspections.filter((inspection) => inspection[checkpoint.key] === "Fail").length,
  }));
  const maxFail = Math.max(...failureCounts.map((item) => item.count), 1);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card className="rounded-xl border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-foreground">
              Checkpoint Failure Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {failureCounts.map((failure) => (
              <div key={failure.key}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-foreground">{failure.label}</span>
                  <span className="text-muted-foreground">
                    {failure.count} {failure.count === 1 ? "failure" : "failures"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      failure.count > 0 ? "bg-red-400" : "bg-green-400",
                    )}
                    style={{ width: `${(failure.count / maxFail) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold text-foreground">
              Inspection History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inspections.map((inspection) => {
              const passCount = countPassedChecks(inspection);
              const passed = allChecksPassed(inspection);

              return (
                <div
                  key={inspection.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {inspection.customer_id}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {inspection.job_number} · {inspection.inspector || "Unassigned"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {passCount}/{QUALITY_CHECKPOINTS.length}
                    </span>
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        passed ? "bg-green-500" : "bg-red-400",
                      )}
                    />
                  </div>
                </div>
              );
            })}
            {inspections.length === 0 && (
              <p className="text-xs text-muted-foreground">No inspection data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-xl border-border">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-sm font-semibold text-foreground">
            Production Output vs QC Results
          </CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40">
              {["Job", "Client", "Produced", "Defective", "Net Good", "Defect %", "QC"].map(
                (heading) => (
                  <TableHead
                    key={heading}
                    className={cn(
                      "px-4 py-3 text-[11px] font-semibold tracking-wide",
                      heading === "Job" || heading === "Client" ? "text-left" : "text-right",
                    )}
                  >
                    {heading}
                  </TableHead>
                ),
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {outputRows.map((row, index) => (
              <TableRow
                key={`${row.job}-${index}`}
                className={cn(index % 2 === 1 && "bg-secondary/10")}
              >
                <TableCell className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                  {row.job}
                </TableCell>
                <TableCell className="px-4 py-3 text-xs text-blue-600">{row.client}</TableCell>
                <TableCell className="px-4 py-3 text-right font-medium text-foreground">
                  {row.produced.toLocaleString()}
                </TableCell>
                <TableCell className="px-4 py-3 text-right font-medium text-red-500">
                  {row.defective.toLocaleString()}
                </TableCell>
                <TableCell className="px-4 py-3 text-right font-medium text-green-600">
                  {row.netGood.toLocaleString()}
                </TableCell>
                <TableCell className="px-4 py-3 text-right text-muted-foreground">
                  {row.defectPct}%
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                      row.qcPass
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-red-200 bg-red-50 text-red-600",
                    )}
                  >
                    {row.qcPass ? "Pass" : "Fail"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
