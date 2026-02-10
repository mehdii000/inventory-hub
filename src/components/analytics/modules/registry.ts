/**
 * Analytics module registry.
 * To add a new analytic, create a module file and add it to a group here.
 */

import { Package, BarChart3, Clock, Warehouse } from "lucide-react";
import { stockRuptureModule } from "./stockRuptureModule";
import type { AnalyticsGroup, AnalyticModule } from "../types";

/* ─── Placeholder modules (not yet implemented) ─── */

const stockCoverage: AnalyticModule = {
  id: "stock-coverage",
  titleKey: "analytics.placeholders.stockCoverage.title",
  descriptionKey: "analytics.placeholders.stockCoverage.description",
  icon: Package,
  implemented: false,
};

const consumptionTrend: AnalyticModule = {
  id: "consumption-trend",
  titleKey: "analytics.placeholders.consumptionTrend.title",
  descriptionKey: "analytics.placeholders.consumptionTrend.description",
  icon: BarChart3,
  implemented: false,
};

const slowMoving: AnalyticModule = {
  id: "slow-moving",
  titleKey: "analytics.placeholders.slowMoving.title",
  descriptionKey: "analytics.placeholders.slowMoving.description",
  icon: Clock,
  implemented: false,
};

const warehouseUtilization: AnalyticModule = {
  id: "warehouse-utilization",
  titleKey: "analytics.placeholders.warehouseUtilization.title",
  descriptionKey: "analytics.placeholders.warehouseUtilization.description",
  icon: Warehouse,
  implemented: false,
};

/* ─── Group definitions ─── */

export const analyticsGroups: AnalyticsGroup[] = [
  {
    id: "etat-journalier",
    labelKey: "analytics.groups.etatJournalier",
    descriptionKey: "analytics.groups.etatJournalierDesc",
    inputFileLabel: "Etat Journalier de Stock",
    accept: ".xlsx,.xls,.csv",
    modules: [stockRuptureModule, stockCoverage, consumptionTrend],
  },
  {
    id: "other",
    labelKey: "analytics.groups.otherAnalytics",
    descriptionKey: "analytics.groups.otherAnalyticsDesc",
    inputFileLabel: "Master Inventory Data",
    accept: ".xlsx,.xls,.csv",
    modules: [slowMoving, warehouseUtilization],
  },
];
