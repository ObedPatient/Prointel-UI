import type { ReactElement } from "react";
import PlaceholderPage from "@/pages/marketing/placeholder/PlaceholderPage";

export function placeholderRoute(title: string): ReactElement {
  return <PlaceholderPage title={title} />;
}
