import { TrendingDown } from "lucide-react";
import { fetchStockRuptures, type StockRuptureData } from "@/services/analyticsApi";
import { StockRuptureResults } from "../StockRuptureResults";
import type { AnalyticModule } from "../types";

export const stockRuptureModule: AnalyticModule<StockRuptureData> = {
  id: "monthly-stock-rupture",
  titleKey: "analytics.placeholders.monthlyStockRupture.title",
  descriptionKey: "analytics.placeholders.monthlyStockRupture.description",
  icon: TrendingDown,
  implemented: true,
  fetchData: fetchStockRuptures,
  ResultComponent: StockRuptureResults,
};
