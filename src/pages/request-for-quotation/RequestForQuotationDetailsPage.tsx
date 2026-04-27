import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCheck, CircleX, Lock, Mail, Pencil } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import RequestForQuotationFormModal from "@/components/request-for-quotations/RequestForQuotationFormModal";
import RequestForQuotationRejectModal from "@/components/request-for-quotations/RequestForQuotationRejectModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  acceptQuotation,
  formatCurrency,
  formatDate,
  formatDateTime,
  getBillOfMaterialsLabel,
  getBillOfMaterialsOptions,
  getCustomerOptions,
  getGrossMarginPercent,
  getGrossMarginValue,
  getProductCategoryOptions,
  loadRequestForQuotations,
  lockQuotationCosts,
  rejectQuotation,
  saveRequestForQuotations,
  sendQuotation,
  updateRequestForQuotationRecord,
} from "@/lib/request-for-quotations";
import type {
  RequestForQuotation,
  RequestForQuotationFormData,
  RequestForQuotationStatus,
} from "@/types/request-for-quotation";

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

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}

export default function RequestForQuotationDetailsPage() {
  const { quotationNumber = "" } = useParams();
  const decodedQuotationNumber = decodeURIComponent(quotationNumber);
  const [quotations, setQuotations] = useState<RequestForQuotation[]>(() => loadRequestForQuotations());
  const [editing, setEditing] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const customerOptions = useMemo(() => getCustomerOptions(), []);
  const productOptions = useMemo(() => getProductCategoryOptions(), []);
  const billOfMaterialsOptions = useMemo(() => getBillOfMaterialsOptions(), []);

  useEffect(() => {
    saveRequestForQuotations(quotations);
  }, [quotations]);

  const quotation = useMemo(
    () => quotations.find((item) => item.quotation_number === decodedQuotationNumber),
    [decodedQuotationNumber, quotations],
  );

  const handleUpdate = (payload: RequestForQuotationFormData) => {
    if (!quotation) {
      return;
    }

    setQuotations((current) =>
      current.map((item) =>
        item.id === quotation.id ? updateRequestForQuotationRecord(item, payload) : item,
      ),
    );
    setEditing(false);
  };

  const handleLock = () => {
    if (!quotation) {
      return;
    }

    setQuotations((current) =>
      current.map((item) => (item.id === quotation.id ? lockQuotationCosts(item) : item)),
    );
  };

  const handleSend = () => {
    if (!quotation) {
      return;
    }

    setQuotations((current) =>
      current.map((item) => (item.id === quotation.id ? sendQuotation(item) : item)),
    );
  };

  const handleAccept = () => {
    if (!quotation) {
      return;
    }

    setQuotations((current) =>
      current.map((item) => (item.id === quotation.id ? acceptQuotation(item) : item)),
    );
  };

  const handleReject = (reason: string) => {
    if (!quotation) {
      return;
    }

    setQuotations((current) =>
      current.map((item) => (item.id === quotation.id ? rejectQuotation(item, reason) : item)),
    );
    setRejecting(false);
  };

  if (!quotation) {
    return (
      <section className="space-y-4">
        <Button asChild type="button" variant="ghost" className="w-fit gap-2 px-0">
          <Link to="/request-for-quotations">
            <ArrowLeft className="h-4 w-4" />
            Back to RFQs
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Request for quotation not found</CardTitle>
            <CardDescription>
              The requested RFQ could not be loaded from local storage.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Button asChild type="button" variant="ghost" className="mb-2 w-fit gap-2 px-0">
            <Link to="/request-for-quotations">
              <ArrowLeft className="h-4 w-4" />
              Back to RFQs
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {quotation.quotation_number}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Review customer quotation details, commercial value, and workflow timestamps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={quotation.status} />
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => setEditing(true)}
            disabled={quotation.status === "accepted"}
          >
            <Pencil className="h-4 w-4" />
            Update
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={handleLock}
            disabled={quotation.status === "accepted" || quotation.status === "rejected"}
          >
            <Lock className="h-4 w-4" />
            Lock Costs
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={handleSend}
            disabled={quotation.status === "accepted" || quotation.status === "rejected"}
          >
            <Mail className="h-4 w-4" />
            Send
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={handleAccept}
            disabled={quotation.status === "accepted" || quotation.status === "rejected"}
          >
            <CheckCheck className="h-4 w-4" />
            Accept
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => setRejecting(true)}
            disabled={quotation.status === "accepted" || quotation.status === "rejected"}
          >
            <CircleX className="h-4 w-4" />
            Reject
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {[
          {
            label: "Estimated Cost",
            value: formatCurrency(quotation.total_estimated_cost),
          },
          {
            label: "Selling Price",
            value: formatCurrency(quotation.selling_price),
          },
          {
            label: "Gross Margin",
            value: formatCurrency(getGrossMarginValue(quotation)),
          },
          {
            label: "Margin %",
            value: `${getGrossMarginPercent(quotation)}%`,
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">RFQ Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem label="ID" value={quotation.id} />
            <DetailItem label="Tenant ID" value={quotation.tenant_id} />
            <DetailItem label="Customer ID" value={quotation.customer_id} />
            <DetailItem label="Product Category ID" value={quotation.product_category_id} />
            <DetailItem
              label="Bill of Materials ID"
              value={getBillOfMaterialsLabel(quotation.bill_of_materials_id)}
            />
            <DetailItem label="Quantity" value={quotation.quantity.toLocaleString()} />
            <DetailItem label="Created By" value={quotation.created_by} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem
              label="Estimated Material Cost"
              value={formatCurrency(quotation.estimated_material_cost)}
            />
            <DetailItem
              label="Estimated Machine Cost"
              value={formatCurrency(quotation.estimated_machine_cost)}
            />
            <DetailItem
              label="Total Estimated Cost"
              value={formatCurrency(quotation.total_estimated_cost)}
            />
            <DetailItem label="Selling Price" value={formatCurrency(quotation.selling_price)} />
            <DetailItem
              label="Cost Locked At"
              value={formatDateTime(quotation.cost_locked_at)}
            />
            <DetailItem label="Expiry Date" value={formatDate(quotation.expiry_date)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Workflow Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem label="Status" value={quotation.status} />
            <DetailItem label="Created At" value={formatDateTime(quotation.created_at)} />
            <DetailItem label="Sent At" value={formatDateTime(quotation.sent_at)} />
            <DetailItem label="Accepted At" value={formatDateTime(quotation.accepted_at)} />
            <DetailItem label="Rejected At" value={formatDateTime(quotation.rejected_at)} />
            <DetailItem
              label="Rejection Reason"
              value={quotation.rejection_reason || "—"}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Commercial Snapshot</CardTitle>
          <CardDescription>
            A quick read on price coverage against estimated cost.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <p className="text-xs font-medium text-muted-foreground">Unit Estimate</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {quotation.quantity > 0
                ? formatCurrency(quotation.total_estimated_cost / quotation.quantity)
                : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <p className="text-xs font-medium text-muted-foreground">Unit Selling Price</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {quotation.quantity > 0
                ? formatCurrency(quotation.selling_price / quotation.quantity)
                : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <p className="text-xs font-medium text-muted-foreground">Margin Coverage</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {getGrossMarginPercent(quotation)}%
            </p>
          </div>
        </CardContent>
      </Card>

      {editing && (
        <RequestForQuotationFormModal
          open={editing}
          quotation={quotation}
          customerOptions={customerOptions}
          productOptions={productOptions}
          billOfMaterialsOptions={billOfMaterialsOptions}
          onClose={() => setEditing(false)}
          onSubmit={handleUpdate}
        />
      )}

      {rejecting && (
        <RequestForQuotationRejectModal
          quotation={quotation}
          onClose={() => setRejecting(false)}
          onSubmit={handleReject}
        />
      )}
    </div>
  );
}
