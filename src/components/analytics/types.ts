/**
 * Core types for the modular analytics system.
 * Each analytic module implements AnalyticModule<TData> to plug into the framework.
 */

export interface AnalyticModule<TData = unknown> {
  /** Unique identifier */
  id: string;
  /** i18n key for title */
  titleKey: string;
  /** i18n key for description */
  descriptionKey: string;
  /** Lucide icon component */
  icon: React.ElementType;
  /** Whether this module is implemented */
  implemented: boolean;
  /** API call to process the file and return data */
  fetchData?: (file: File) => Promise<TData>;
  /** React component to render results */
  ResultComponent?: React.ComponentType<{ data: TData }>;
}

export interface AnalyticsGroup {
  id: string;
  labelKey: string;
  descriptionKey: string;
  inputFileLabel: string;
  accept: string;
  modules: AnalyticModule<any>[];
}
