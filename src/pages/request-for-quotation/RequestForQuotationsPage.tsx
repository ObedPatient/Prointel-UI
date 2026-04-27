import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RequestForQuotationActionMenu from "@/components/request-for-quotations/RequestForQuotationActionMenu";
import RequestForQuotationFormModal from "@/components/request-for-quotations/RequestForQuotationFormModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DataPagination from "@/components/ui/data-pagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RFQ_STATUS_FILTER_OPTIONS,
  createRequestForQuotationRecord,
  formatCurrency,
  formatDate,
  getBillOfMaterialsLabel,
  getBillOfMaterialsOptions,
  getCustomerOptions,
  getGrossMarginPercent,
  getProductCategoryOptions,
  loadRequestForQuotations,
  lockQuotationCosts,
  saveRequestForQuotations,
  sendQuotation,
  updateRequestForQuotationRecord,
} from "@/lib/request-for-quotations";
import type {
  RequestForQuotation,
  RequestForQuotationFormData,
  RequestForQuotationStatus,
} from "@/types/request-for-quotation";

const PAGE_SIZE = 8;

function StatusBadge({ status }: { status: RequestForQuotationStatus }) {
  const tones: Record<RequestForQuotationStatus, string> = {
    draft: "border-slate-300 bg-slate-100 text-slate-700",
    sent: "border-blue-200 bg-blue-100 text-blue-700",
    accepted: "border-green-200 bg-green-100 text-green-700",
    rejected: "border-red-200 bg-red-100 text-red-700",
    expired: "border-zinc-300 bg-zinc-100 text-zinc-700",
    locked: "border-amber-200 bg-amber-100 text-amber-700",
  };

  return (
    <Badge variant="outline" className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tones[status]}`}>
      {status}
    </Badge>
  );
}

export default function RequestForQuotationsPage() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<RequestForQuotation[]>(() => loadRequestForQuotations());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestForQuotationStatus | "All Statuses">(
    "All Statuses",
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RequestForQuotation | null>(null);
  const [page, setPage] = useState(1);

  const customerOptions = useMemo(() => getCustomerOptions(), []);
  const productOptions = useMemo(() => getProductCategoryOptions(), []);
  const billOfMaterialsOptions = useMemo(() => getBillOfMaterialsOptions(), []);

  useEffect(() => {
    saveRequestForQuotations(quotations);
  }, [quotations]);

  const filteredQuotations = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return quotations.filter((quotation) => {
      const matchesSearch =
        needle.length === 0 ||
        quotation.quotation_number.toLowerCase().includes(needle) ||
        quotation.customer_id.toLowerCase().includes(needle) ||
        quotation.product_category_id.toLowerCase().includes(needle) ||
        quotation.created_by.toLowerCase().includes(needle);
      const matchesStatus =
        statusFilter === "All Statuses" || quotation.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [quotations, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredQuotations.length / PAGE_SIZE));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginatedQuotations = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredQuotations.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredQuotations, page]);

  const expiringSoonCount = useMemo(
    () =>
      quotations.filter((quotation) => {
        if (quotation.status === "accepted" || quotation.status === "rejected") {
          return false;
        }

        const remaining = new Date(quotation.expiry_date).getTime() - Date.now();
        const daysRemaining = remaining / (1000 * 60 * 60 * 24);
        return daysRemaining >= 0 && daysRemaining <= 7;
      }).length,
    [quotations],
  );

  const acceptedValue = useMemo(
    () =>
      quotations
        .filter((quotation) => quotation.status === "accepted")
        .reduce((sum, quotation) => sum + quotation.selling_price, 0),
    [quotations],
  );

  const handleSubmit = (payload: RequestForQuotationFormData) => {
    if (editing) {
      setQuotations((current) =>
        current.map((quotation) =>
          quotation.id === editing.id ? updateRequestForQuotationRecord(quotation, payload) : quotation,
        ),
      );
    } else {
      const nextQuotation = createRequestForQuotationRecord(payload, quotations);
      setQuotations((current) => [nextQuotation, ...current]);
    }

    setEditing(null);
    setModalOpen(false);
  };

  const handleEdit = (quotation: RequestForQuotation) => {
    setEditing(quotation);
    setModalOpen(true);
  };

  const handleLock = (quotation: RequestForQuotation) => {
    setQuotations((current) =>
      current.map((item) => (item.id === quotation.id ? lockQuotationCosts(item) : item)),
    );
  };

  const handleSend = (quotation: RequestForQuotation) => {
    setQuotations((current) =>
      current.map((item) => (item.id === quotation.id ? sendQuotation(item) : item)),
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Request for Quotations
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Build, lock, send, and track customer quotations from estimated cost through outcome.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New RFQ
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          {
            label: "Total RFQs",
            value: quotations.length.toString(),
          },
          {
            label: "Sent",
            value: quotations.filter((quotation) => quotation.status === "sent").length.toString(),
          },
          {
            label: "Accepted Value",
            value: formatCurrency(acceptedValue),
          },
          {
            label: "Expiring in 7 Days",
            value: expiringSoonCount.toString(),
          },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="space-y-1 p-4">
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Search by quotation number, customer, product, or creator and narrow by RFQ status.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search quotations..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-72 pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as RequestForQuotationStatus | "All Statuses")
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {RFQ_STATUS_FILTER_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {filteredQuotations.length} quotations
          </Badge>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <Table className="min-w-[1520px]">
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40">
              {[
                "RFQ NUMBER",
                "CUSTOMER",
                "PRODUCT",
                "BOM",
                "QTY",
                "EST. COST",
                "SELLING PRICE",
                "MARGIN",
                "STATUS",
                "EXPIRY",
                "CREATED BY",
                "ACTIONS",
              ].map((heading) => (
                <TableHead key={heading} className="px-4 py-3 text-[11px] font-semibold tracking-wide">
                  {heading}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedQuotations.map((quotation) => (
              <TableRow key={quotation.id}>
                <TableCell className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                  {quotation.quotation_number}
                </TableCell>
                <TableCell className="px-4 py-3 text-foreground">{quotation.customer_id}</TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">
                  {quotation.product_category_id}
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">
                  {getBillOfMaterialsLabel(quotation.bill_of_materials_id)}
                </TableCell>
                <TableCell className="px-4 py-3 text-right tabular-nums text-foreground">
                  {quotation.quantity.toLocaleString()}
                </TableCell>
                <TableCell className="px-4 py-3 text-right text-foreground">
                  {formatCurrency(quotation.total_estimated_cost)}
                </TableCell>
                <TableCell className="px-4 py-3 text-right text-foreground">
                  {formatCurrency(quotation.selling_price)}
                </TableCell>
                <TableCell className="px-4 py-3 text-right text-muted-foreground">
                  {getGrossMarginPercent(quotation)}%
                </TableCell>
                <TableCell className="px-4 py-3">
                  <StatusBadge status={quotation.status} />
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">
                  {formatDate(quotation.expiry_date)}
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">
                  {quotation.created_by}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <RequestForQuotationActionMenu
                    quotation={quotation}
                    onView={(selected) =>
                      navigate(
                        `/request-for-quotations/${encodeURIComponent(selected.quotation_number)}`,
                      )
                    }
                    onUpdate={handleEdit}
                    onLock={handleLock}
                    onSend={handleSend}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <DataPagination
          page={page}
          pageSize={PAGE_SIZE}
          totalItems={filteredQuotations.length}
          itemLabel="quotations"
          onPageChange={setPage}
        />
      </Card>

      {modalOpen && (
        <RequestForQuotationFormModal
          open={modalOpen}
          quotation={editing}
          customerOptions={customerOptions}
          productOptions={productOptions}
          billOfMaterialsOptions={billOfMaterialsOptions}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
