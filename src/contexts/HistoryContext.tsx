import React, { createContext, useContext, useState, useCallback } from "react";

export interface HistoryRecord {
  id: string;
  processorName: string;
  processorKey: string;
  timestamp: Date;
  status: "processing" | "success" | "error";
  inputFiles: string[];
  outputBlob?: Blob;
}

interface HistoryContextType {
  records: HistoryRecord[];
  addRecord: (record: Omit<HistoryRecord, "id">) => string;
  updateRecord: (id: string, updates: Partial<HistoryRecord>) => void;
}

const HistoryContext = createContext<HistoryContextType | null>(null);

let idCounter = 0;

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<HistoryRecord[]>([]);

  const addRecord = useCallback((record: Omit<HistoryRecord, "id">) => {
    const id = `job-${++idCounter}-${Date.now()}`;
    setRecords((prev) => [{ ...record, id }, ...prev]);
    return id;
  }, []);

  const updateRecord = useCallback((id: string, updates: Partial<HistoryRecord>) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  }, []);

  return (
    <HistoryContext.Provider value={{ records, addRecord, updateRecord }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) throw new Error("useHistory must be used within HistoryProvider");
  return context;
}
