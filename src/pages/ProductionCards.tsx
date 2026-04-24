import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Plus, Search } from "lucide-react";
import CreateProductionCardModal from "@/components/production-cards/CreateProductionCardModal";
import ProductionCardDetailsSheet from "@/components/production-cards/ProductionCardDetailsSheet";
import ProductionCardRow from "@/components/production-cards/ProductionCardRow";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DataPagination from "@/components/ui/data-pagination";
import { Input } from "@/components/ui/input";
import {
  PRODUCTION_CARD_FILTER_OPTIONS,
  createProductionCardRecord,
  listProductionCardCustomerOptions,
  listProductionCardProductCategoryOptions,
  listProductionCardSalesOrders,
  loadProductionCards,
  saveProductionCards,
  updateProductionCardRecord,
} from "@/lib/production-cards";
import type {
  CreateProductionCardData,
  ProductionCard,
  ProductionCardStatus,
} from "@/types/production-card";

const PAGE_SIZE = 6;

export default function ProductionCards() {
  const [cards, setCards] = useState<ProductionCard[]>(() => loadProductionCards());
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<ProductionCardStatus | "All">("All");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<ProductionCard | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<ProductionCard | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    saveProductionCards(cards);
  }, [cards]);

  const salesOrderOptions = useMemo(() => listProductionCardSalesOrders(cards), [cards]);
  const customerOptions = useMemo(() => listProductionCardCustomerOptions(cards), [cards]);
  const productCategoryOptions = useMemo(
    () => listProductionCardProductCategoryOptions(cards),
    [cards],
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return cards.filter((card) => {
      const matchSearch =
        needle.length === 0 ||
        card.customer_id.toLowerCase().includes(needle) ||
        card.job_number.toLowerCase().includes(needle) ||
        card.customer_order_id.toLowerCase().includes(needle) ||
        card.product_category_id.toLowerCase().includes(needle);
      const matchStatus = statusFilter === "All" || card.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [cards, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginatedCards = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filtered.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filtered, page]);

  const selectedCard = useMemo(
    () => cards.find((card) => card.id === selectedCardId) ?? null,
    [cards, selectedCardId],
  );

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleCreateSubmit = (data: CreateProductionCardData) => {
    const nextCard = createProductionCardRecord(data);
    setCards((current) => [nextCard, ...current]);
    setSelectedCardId(nextCard.id);
    setModalOpen(false);
  };

  const handleUpdateSubmit = (data: CreateProductionCardData) => {
    if (!editingCard) {
      return;
    }

    setCards((current) =>
      current.map((card) =>
        card.id === editingCard.id ? updateProductionCardRecord(card, data) : card,
      ),
    );
    setSelectedCardId(editingCard.id);
    setEditingCard(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteCandidate) {
      return;
    }

    setCards((current) => current.filter((card) => card.id !== deleteCandidate.id));

    if (selectedCardId === deleteCandidate.id) {
      setSelectedCardId(null);
    }

    if (editingCard?.id === deleteCandidate.id) {
      setEditingCard(null);
    }

    setDeleteCandidate(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Production Cards</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Order-driven job tracking with quick access to each card in a right-side detail panel.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setModalOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Production Card
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Search by job, customer, sales order, or product category and page through the results.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search production cards..."
              value={search}
              onChange={handleSearchChange}
              className="w-72 pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRODUCTION_CARD_FILTER_OPTIONS.map((status) => (
              <Button
                key={status}
                type="button"
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {filtered.length} cards
          </Badge>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="space-y-3 px-6 py-5">
          {paginatedCards.map((card) => (
            <ProductionCardRow
              key={card.id}
              card={card}
              selected={selectedCardId === card.id}
              onSelect={(selected) => setSelectedCardId(selected.id)}
            />
          ))}

          {paginatedCards.length === 0 && (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No production cards found.
            </div>
          )}
        </div>

        <DataPagination
          page={page}
          pageSize={PAGE_SIZE}
          totalItems={filtered.length}
          itemLabel="production cards"
          onPageChange={setPage}
        />
      </Card>

      {modalOpen && (
        <CreateProductionCardModal
          existingCards={cards}
          salesOrderOptions={salesOrderOptions}
          customerOptions={customerOptions}
          productCategoryOptions={productCategoryOptions}
          onSubmit={handleCreateSubmit}
          onClose={() => setModalOpen(false)}
          isLoading={false}
        />
      )}

      {editingCard && (
        <CreateProductionCardModal
          card={editingCard}
          existingCards={cards}
          salesOrderOptions={salesOrderOptions}
          customerOptions={customerOptions}
          productCategoryOptions={productCategoryOptions}
          onSubmit={handleUpdateSubmit}
          onClose={() => setEditingCard(null)}
          isLoading={false}
        />
      )}

      <ProductionCardDetailsSheet
        card={selectedCard}
        open={selectedCard != null}
        onClose={() => setSelectedCardId(null)}
        onEdit={(card) => setEditingCard(card)}
        onDelete={(card) => setDeleteCandidate(card)}
      />

      <AlertDialog
        open={deleteCandidate != null}
        onOpenChange={(open) => !open && setDeleteCandidate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete production card?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteCandidate
                ? `This will permanently remove ${deleteCandidate.job_number} from local storage.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
