/**
 * Analytics API service — calls Flask backend for analytics processing.
 */

export interface StockRuptureData {
  [date: string]: {
    Test: number;
    PDR: number;
    Other: number;
  };
}

export async function fetchStockRuptures(file: File): Promise<StockRuptureData> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:5454/processors/stock_ruptures', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${response.status}`);
  }

  return await response.json();
}
