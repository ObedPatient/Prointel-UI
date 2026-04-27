import { useEffect, useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import StockCardDetailsSheet from "@/components/stock-cards/StockCardDetailsSheet";
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
  STOCK_CARD_REFERENCE_FILTER_OPTIONS,
  STOCK_CARD_TRANSACTION_FILTER_OPTIONS,
  loadStockCards,
  saveStockCards,
} from "@/lib/stock-cards";
import type {
  StockCard,
  StockCardReferenceType,
  StockCardTransactionType,
} from "@/types/stock-card";

const PAGE_SIZE = 8;

const TRANSACTION_STYLES: Record<StockCardTransactionType, string> = {
  "Opening Balance": "border-slate-300 bg-slate-100 text-slate-700",
  Receipt: "border-green-200 bg-green-100 text-green-700",
  Issue: "border-blue-200 bg-blue-100 text-blue-700",
  Transfer: "border-violet-200 bg-violet-100 text-violet-700",
  Adjustment: "border-amber-200 bg-amber-100 text-amber-700",
  Return: "border-cyan-200 bg-cyan-100 text-cyan-700",
};

const REFERENCE_STYLES: Record<StockCardReferenceType, string> = {
  "Manual Entry": "border-slate-300 bg-slate-100 text-slate-700",
  "Goods Received Note": "border-emerald-200 bg-emerald-100 text-emerald-700",
  "Production Card": "border-blue-200 bg-blue-100 text-blue-700",
  "Stock Transfer": "border-violet-200 bg-violet-100 text-violet-700",
  "Stock Adjustment": "border-amber-200 bg-amber-100 text-amber-700",
  "Return Note": "border-cyan-200 bg-cyan-100 text-cyan-700",
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

function formatNumber(value: number): string {
  return value.toLocaleString();
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function StockCardsPage() {
  const [cards, setCards] = useState<StockCard[]>(() => loadStockCards());
  const [search, setSearch] = useState("");
  const [transactionFilter, setTransactionFilter] = useState<
    StockCardTransactionType | "All Transactions"
  >("All Transactions");
  const [referenceFilter, setReferenceFilter] = useState<
    StockCardReferenceType | "All References"
  >("All References");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    saveStockCards(cards);
  }, [cards]);

  const filteredCards = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return cards.filter((card) => {
      const matchesSearch =
        needle.length === 0 ||
        card.id.toLowerCase().includes(needle) ||
        card.tenant_id.toLowerCase().includes(needle) ||
        card.raw_material_id.toLowerCase().includes(needle) ||
        card.transaction_type.toLowerCase().includes(needle) ||
        card.reference_type.toLowerCase().includes(needle) ||
        card.reference_id.toLowerCase().includes(needle) ||
        card.reference_number.toLowerCase().includes(needle) ||
        card.warehouse_location_id.toLowerCase().includes(needle) ||
        card.created_by.toLowerCase().includes(needle) ||
        card.waste_reason_id.toLowerCase().includes(needle);
      const matchesTransaction =
        transactionFilter === "All Transactions" || card.transaction_type === transactionFilter;
      const matchesReference =
        referenceFilter === "All References" || card.reference_type === referenceFilter;

      return matchesSearch && matchesTransaction && matchesReference;
    });
  }, [cards, referenceFilter, search, transactionFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, transactionFilter, referenceFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCards.length / PAGE_SIZE));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginatedCards = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredCards.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredCards, page]);

  const selectedCard = useMemo(
    () => cards.find((card) => card.id === selectedCardId) ?? null,
    [cards, selectedCardId],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Stock Cards</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Browse raw material movement history in a table and inspect any single stock card in a
            right-side panel.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Search by material, reference, warehouse, waste reason, or creator and narrow
            movements by transaction and reference type.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search stock cards..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-72 pl-9"
            />
          </div>

          <Select
            value={transactionFilter}
            onValueChange={(value) =>
              setTransactionFilter(value as StockCardTransactionType | "All Transactions")
            }
          >
            <SelectTrigger className="w-[210px]">
              <SelectValue placeholder="Filter by transaction" />
            </SelectTrigger>
            <SelectContent>
              {STOCK_CARD_TRANSACTION_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={referenceFilter}
            onValueChange={(value) =>
              setReferenceFilter(value as StockCardReferenceType | "All References")
            }
          >
            <SelectTrigger className="w-[210px]">
              <SelectValue placeholder="Filter by reference" />
            </SelectTrigger>
            <SelectContent>
              {STOCK_CARD_REFERENCE_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {filteredCards.length} stock cards
          </Badge>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <Table className="min-w-[2360px]">
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40">
              {[
                "NO.",
                "RAW MATERIAL ID",
                "TRANSACTION DATE",
                "TRANSACTION TYPE",
                "REFERENCE TYPE",
                "REFERENCE ID",
                "REFERENCE NUMBER",
                "OPENING BALANCE",
                "QUANTITY IN",
                "QUANTITY OUT",
                "CLOSING BALANCE",
                "WASTE QUANTITY",
                "WASTE REASON ID",
                "WEIGHTED AVERAGE UNIT COST",
                "STOCK VALUE RWF",
                "WAREHOUSE LOCATION ID",
                "CREATED BY",
                "CREATED AT",
                "ACTIONS",
              ].map((heading) => (
                <TableHead key={heading} className="px-4 py-3 text-[11px] font-semibold tracking-wide">
                  {heading}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedCards.map((card, index) => (
              <TableRow
                key={card.id}
                onClick={() => setSelectedCardId(card.id)}
                className={`cursor-pointer ${selectedCardId === card.id ? "bg-primary/5" : ""}`}
              >
                <TableCell className="px-4 py-3 font-medium text-foreground">
                  {(page - 1) * PAGE_SIZE + index + 1}
                </TableCell>
                <TableCell className="px-4 py-3 font-medium text-foreground">
                  {card.raw_material_id}
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">
                  {formatDate(card.transaction_date)}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${TRANSACTION_STYLES[card.transaction_type]}`}
                  >
                    {card.transaction_type}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${REFERENCE_STYLES[card.reference_type]}`}
                  >
                    {card.reference_type}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">{card.reference_id}</TableCell>
                <TableCell className="px-4 py-3 font-medium text-foreground">
                  {card.reference_number}
                </TableCell>
                <TableCell className="px-4 py-3 text-right tabular-nums">
                  {formatNumber(card.opening_balance)}
                </TableCell>
                <TableCell className="px-4 py-3 text-right tabular-nums text-green-700">
                  {formatNumber(card.quantity_in)}
                </TableCell>
                <TableCell className="px-4 py-3 text-right tabular-nums text-blue-700">
                  {formatNumber(card.quantity_out)}
                </TableCell>
                <TableCell className="px-4 py-3 text-right font-medium tabular-nums text-foreground">
                  {formatNumber(card.closing_balance)}
                </TableCell>
                <TableCell className="px-4 py-3 text-right tabular-nums">
                  {formatNumber(card.waste_quantity)}
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">
                  {card.waste_reason_id || "-"}
                </TableCell>
                <TableCell className="px-4 py-3 text-right tabular-nums">
                  {formatCurrency(card.weighted_average_unit_cost)}
                </TableCell>
                <TableCell className="px-4 py-3 text-right tabular-nums font-medium text-foreground">
                  {formatCurrency(card.stock_value_rwf)}
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">
                  {card.warehouse_location_id}
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">{card.created_by}</TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">
                  {formatDate(card.created_at)}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedCardId(card.id);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {paginatedCards.length === 0 && (
              <TableRow>
                <TableCell colSpan={18} className="py-16 text-center text-sm text-muted-foreground">
                  No stock cards found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <DataPagination
          page={page}
          pageSize={PAGE_SIZE}
          totalItems={filteredCards.length}
          itemLabel="stock cards"
          onPageChange={setPage}
        />
      </Card>

      <StockCardDetailsSheet
        card={selectedCard}
        open={selectedCard != null}
        onClose={() => setSelectedCardId(null)}
      />
    </div>
  );
}
