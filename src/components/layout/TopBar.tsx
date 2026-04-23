import { useMemo, useState } from "react";
import {
  Bell,
  Briefcase,
  CheckCheck,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Package2,
  ShieldCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

type ViewerOption = {
  id: string;
  name: string;
  role: string;
};

type NotificationCategory =
  | "stock"
  | "costing"
  | "ebm"
  | "deadline"
  | "verification";

type NotificationItem = {
  id: number;
  title: string;
  description: string;
  time: string;
  category: NotificationCategory;
};

const viewerOptions: ViewerOption[] = [
  { id: "ops", name: "Jean-Pierre Habimana", role: "Operations" },
  { id: "procurement", name: "Aline Mukamana", role: "Procurement" },
  { id: "finance", name: "Eric Nshimiyimana", role: "Finance Lead" },
  { id: "qa", name: "Claudine Uwase", role: "Quality Control" },
  { id: "warehouse", name: "Patrick Nkundimana", role: "Warehouse" },
  { id: "planning", name: "Diane Uwimana", role: "Production Planning" },
  { id: "sales", name: "Sandrine Mukarugwiza", role: "Sales Operations" },
  { id: "compliance", name: "Samuel Mugabo", role: "Compliance" },
  { id: "dispatch", name: "Yvonne Ingabire", role: "Dispatch" },
  { id: "maintenance", name: "Kevin Ndayisaba", role: "Maintenance" },
];

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "Low stock on kraft liners",
    description: "Only 2 rolls remain for Job SS-104 and replenishment is pending.",
    time: "5 min ago",
    category: "stock",
  },
  {
    id: 2,
    title: "Cost variance above target",
    description: "Job SS-098 exceeded planned material cost by 8.4%.",
    time: "18 min ago",
    category: "costing",
  },
  {
    id: 3,
    title: "EBM submission needs review",
    description: "Duty remission worksheet for April exports is waiting for confirmation.",
    time: "42 min ago",
    category: "ebm",
  },
  {
    id: 4,
    title: "Delivery deadline tomorrow",
    description: "Skol Brewery packaging run must be closed before 10:00 AM.",
    time: "1 hr ago",
    category: "deadline",
  },
  {
    id: 5,
    title: "GRN pending verification",
    description: "Goods received note GRN-2218 needs warehouse sign-off.",
    time: "2 hr ago",
    category: "verification",
  },
  {
    id: 6,
    title: "Ink stock threshold reached",
    description: "Blue flexo ink is below the reorder point for next week's schedule.",
    time: "3 hr ago",
    category: "stock",
  },
];

const notificationTabs = [
  { value: "all", label: "All" },
  { value: "stock", label: "Stock" },
  { value: "costing", label: "Costing" },
  { value: "ebm", label: "EBM" },
  { value: "deadline", label: "Deadline" },
  { value: "verification", label: "Verification" },
] as const;

function notificationIcon(category: NotificationCategory) {
  switch (category) {
    case "stock":
      return <Package2 className="h-4 w-4 text-blue-600" />;
    case "costing":
      return <CircleDollarSign className="h-4 w-4 text-emerald-600" />;
    case "ebm":
      return <Briefcase className="h-4 w-4 text-violet-600" />;
    case "deadline":
      return <Clock3 className="h-4 w-4 text-amber-600" />;
    case "verification":
      return <ShieldCheck className="h-4 w-4 text-rose-600" />;
  }
}

export default function TopBar() {
  const [selectedViewer, setSelectedViewer] = useState(viewerOptions[0]);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState<(typeof notificationTabs)[number]["value"]>("all");

  const filteredNotifications = useMemo(() => {
    if (activeTab === "all") {
      return notifications;
    }

    return notifications.filter((notification) => notification.category === activeTab);
  }, [activeTab, notifications]);

  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b border-border bg-card px-6">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Viewing as:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <span className="max-w-[170px] truncate">{selectedViewer.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 p-0">
            <DropdownMenuLabel>Switch viewer</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-64">
              <div className="p-1">
                {viewerOptions.map((viewer) => (
                  <DropdownMenuItem
                    key={viewer.id}
                    onClick={() => setSelectedViewer(viewer)}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{viewer.name}</p>
                      <p className="text-xs text-muted-foreground">{viewer.role}</p>
                    </div>
                    {selectedViewer.id === viewer.id && (
                      <ClipboardCheck className="mt-0.5 h-4 w-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="relative rounded-md p-2 transition-colors hover:bg-secondary"
            aria-label="Open notifications"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            {notifications.length > 0 && (
              <>
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {notifications.length}
                </span>
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[420px] p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground">
                In-app alerts across stock, costing, compliance, and approvals
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setNotifications([])}
              disabled={notifications.length === 0}
            >
              <CheckCheck className="h-4 w-4" />
              Dismiss all
            </Button>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as (typeof notificationTabs)[number]["value"])
            }
            className="p-4"
          >
            <TabsList className="mb-3 grid h-auto w-full grid-cols-3 gap-1 bg-transparent p-0 md:grid-cols-6">
              {notificationTabs.map((tab) => {
                const count =
                  tab.value === "all"
                    ? notifications.length
                    : notifications.filter((item) => item.category === tab.value).length;

                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    title={tab.label}
                    className="flex h-auto min-h-9 w-full min-w-0 items-center justify-center gap-1 overflow-hidden border border-border bg-background px-1.5 py-2 text-[11px] data-[state=active]:border-primary"
                  >
                    <span className="min-w-0 truncate">{tab.label}</span>
                    <span className="shrink-0 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {count}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {notificationTabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-0">
                {filteredNotifications.length > 0 ? (
                  <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="rounded-xl border border-border bg-background p-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-lg bg-secondary p-2">
                            {notificationIcon(notification.category)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-semibold text-foreground">
                                {notification.title}
                              </p>
                              <span className="shrink-0 text-[11px] text-muted-foreground">
                                {notification.time}
                              </span>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              {notification.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-background px-4 py-8 text-center">
                    <p className="text-sm font-medium text-foreground">No notifications here</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      You&apos;re all caught up for this category.
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
