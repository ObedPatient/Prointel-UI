import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Plus,
  Search,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import InspectionCard from "@/components/quality-check/InspectionCard";
import InspectionDetailModal from "@/components/quality-check/InspectionDetailModal";
import NewInspectionModal from "@/components/quality-check/NewInspectionModal";
import QcAnalytics from "@/components/quality-check/QcAnalytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DataPagination from "@/components/ui/data-pagination";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  QUALITY_CONTROL_TABS,
  allChecksPassed,
  createQualityInspectionRecord,
  hasCheckFailure,
  loadAwaitingQualityJobs,
  loadQualityInspections,
  saveQualityInspections,
} from "@/lib/quality-control";
import { cn } from "@/lib/utils";
import type {
  AwaitingQualityJob,
  CreateQualityInspectionData,
  InspectionType,
  QualityControlTab,
  QualityInspection,
} from "@/types/quality-control";

type InspectionResultFilter = "All" | "Passed" | "Failed";

const RESULT_FILTERS: InspectionResultFilter[] = ["All", "Passed", "Failed"];
const PAGE_SIZE = 4;

const PRIORITY_TONES: Record<AwaitingQualityJob["priority"], string> = {
  High: "border-red-200 bg-red-50 text-red-600",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Normal: "border-slate-300 bg-slate-100 text-slate-700",
};

function formatDate(value: string): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-CA");
}

export default function QualityControlPage() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<QualityInspection[]>(() => loadQualityInspections());
  const [awaitingJobs] = useState<AwaitingQualityJob[]>(() => loadAwaitingQualityJobs());
  const [tab, setTab] = useState<QualityControlTab>("Inspections");
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<InspectionResultFilter>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<InspectionType>("Production");
  const [viewInspection, setViewInspection] = useState<QualityInspection | null>(null);
  const [inspectionPage, setInspectionPage] = useState(1);
  const [awaitingPage, setAwaitingPage] = useState(1);

  useEffect(() => {
    saveQualityInspections(inspections);
  }, [inspections]);

  const totalPassed = useMemo(
    () => inspections.filter((inspection) => allChecksPassed(inspection)).length,
    [inspections],
  );
  const totalFailed = useMemo(
    () => inspections.filter((inspection) => hasCheckFailure(inspection)).length,
    [inspections],
  );
  const passRate = inspections.length > 0 ? Math.round((totalPassed / inspections.length) * 100) : 0;

  const filteredInspections = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return inspections.filter((inspection) => {
      const matchesSearch =
        needle.length === 0 ||
        inspection.customer_id.toLowerCase().includes(needle) ||
        inspection.job_number.toLowerCase().includes(needle) ||
        inspection.product_category_id.toLowerCase().includes(needle) ||
        inspection.inspector.toLowerCase().includes(needle);
      const matchesResult =
        resultFilter === "All" ||
        (resultFilter === "Passed" && allChecksPassed(inspection)) ||
        (resultFilter === "Failed" && hasCheckFailure(inspection));

      return matchesSearch && matchesResult;
    });
  }, [inspections, resultFilter, search]);

  useEffect(() => {
    setInspectionPage(1);
  }, [search, resultFilter]);

  const totalInspectionPages = Math.max(1, Math.ceil(filteredInspections.length / PAGE_SIZE));

  useEffect(() => {
    setInspectionPage((current) => Math.min(current, totalInspectionPages));
  }, [totalInspectionPages]);

  const paginatedInspections = useMemo(() => {
    const startIndex = (inspectionPage - 1) * PAGE_SIZE;
    return filteredInspections.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredInspections, inspectionPage]);

  const totalAwaitingPages = Math.max(1, Math.ceil(awaitingJobs.length / PAGE_SIZE));

  useEffect(() => {
    setAwaitingPage((current) => Math.min(current, totalAwaitingPages));
  }, [totalAwaitingPages]);

  const paginatedAwaitingJobs = useMemo(() => {
    const startIndex = (awaitingPage - 1) * PAGE_SIZE;
    return awaitingJobs.slice(startIndex, startIndex + PAGE_SIZE);
  }, [awaitingJobs, awaitingPage]);

  const handleCreateInspection = (data: CreateQualityInspectionData) => {
    const record = createQualityInspectionRecord(data);
    setInspections((current) => [record, ...current]);
    setModalOpen(false);
  };

  const canNavigateBack = typeof window !== "undefined" && window.history.length > 1;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              if (canNavigateBack) {
                navigate(-1);
                return;
              }

              navigate("/production-cards");
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Quality Control</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Inspection checklists, incoming QC, and defect tracking
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setModalType("Incoming");
              setModalOpen(true);
            }}
          >
            <ClipboardCheck className="h-4 w-4" />
            Incoming Inspection
          </Button>
          <Button
            type="button"
            onClick={() => {
              setModalType("Production");
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New Inspection
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            icon: <ClipboardCheck className="h-5 w-5 text-blue-500" />,
            value: inspections.length,
            label: "Total Inspections",
            valueClass: "text-foreground",
          },
          {
            icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
            value: totalPassed,
            label: "Fully Passed",
            valueClass: "text-green-600",
          },
          {
            icon: <XCircle className="h-5 w-5 text-red-400" />,
            value: totalFailed,
            label: "Issues Found",
            valueClass: "text-red-500",
          },
          {
            icon: <TrendingUp className="h-5 w-5 text-teal-500" />,
            value: `${passRate}%`,
            label: "Pass Rate",
            valueClass: "text-foreground",
          },
        ].map((kpi) => (
          <Card key={kpi.label} className="rounded-xl border-border">
            <CardContent className="space-y-2 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                {kpi.icon}
              </div>
              <p className={cn("text-2xl font-bold", kpi.valueClass)}>{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-0 border-b border-border">
        {QUALITY_CONTROL_TABS.map((currentTab) => (
          <button
            key={currentTab}
            type="button"
            onClick={() => setTab(currentTab)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors -mb-px",
              tab === currentTab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {currentTab}
          </button>
        ))}
      </div>

      {tab === "Inspections" && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-md min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by client, card number, product, or inspector..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1.5">
              {RESULT_FILTERS.map((filter) => (
                <Button
                  key={filter}
                  type="button"
                  size="sm"
                  variant={resultFilter === filter ? "default" : "outline"}
                  onClick={() => setResultFilter(filter)}
                  className={cn(
                    "rounded-full px-3",
                    resultFilter !== filter && "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {filter}
                </Button>
              ))}
            </div>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {filteredInspections.length} inspections
            </Badge>
          </div>

          <div className="space-y-4">
            {paginatedInspections.map((inspection) => (
              <InspectionCard
                key={inspection.id}
                inspection={inspection}
                onView={setViewInspection}
              />
            ))}
            {paginatedInspections.length === 0 && (
              <div className="py-16 text-center text-sm text-muted-foreground">
                No inspections found.
              </div>
            )}
          </div>

          <Card className="overflow-hidden border-border">
            <DataPagination
              page={inspectionPage}
              pageSize={PAGE_SIZE}
              totalItems={filteredInspections.length}
              itemLabel="inspections"
              onPageChange={setInspectionPage}
            />
          </Card>
        </>
      )}

      {tab === "Awaiting QC" && (
        <Card className="overflow-hidden border-border">
          <Table className="min-w-[1120px]">
            <TableHeader>
              <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                {[
                  "QUEUE DATE",
                  "JOB NUMBER",
                  "CUSTOMER",
                  "PRODUCT CATEGORY",
                  "TARGET QTY",
                  "ACTUAL OUTPUT",
                  "PENDING CHECKS",
                  "PRIORITY",
                  "NOTES",
                ].map((heading) => (
                  <TableHead
                    key={heading}
                    className="px-4 py-3 text-[11px] font-semibold tracking-wide"
                  >
                    {heading}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAwaitingJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {formatDate(job.queued_at)}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-foreground">
                    {job.job_number}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-foreground">{job.customer_id}</TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {job.product_category_id}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right tabular-nums text-foreground">
                    {job.target_quantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right tabular-nums text-foreground">
                    {job.actual_output_quantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-xs">
                      {job.pending_checks} pending
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        PRIORITY_TONES[job.priority],
                      )}
                    >
                      {job.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[320px] px-4 py-3 text-muted-foreground">
                    <span className="block truncate">{job.notes}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <DataPagination
            page={awaitingPage}
            pageSize={PAGE_SIZE}
            totalItems={awaitingJobs.length}
            itemLabel="awaiting QC jobs"
            onPageChange={setAwaitingPage}
          />
        </Card>
      )}

      {tab === "Analytics" && <QcAnalytics inspections={inspections} />}

      <InspectionDetailModal
        inspection={viewInspection}
        open={viewInspection != null}
        onClose={() => setViewInspection(null)}
      />

      <NewInspectionModal
        open={modalOpen}
        type={modalType}
        onSubmit={handleCreateInspection}
        onClose={() => setModalOpen(false)}
        isLoading={false}
      />
    </div>
  );
}
