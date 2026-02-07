/**
 * Mock API service — simulates Flask backend responses.
 * Replace these functions with real fetch calls when the backend is ready.
 */

export async function processGlobalOrders(
  me2nFile: File,
  ebmFile: File
): Promise<Blob> {
  await simulateDelay();
  maybeThrow();
  return new Blob(
    [`Global Orders — ME2N: ${me2nFile.name}, eBM: ${ebmFile.name}\nProcessed at ${new Date().toISOString()}`],
    { type: "text/csv" }
  );
}

export async function processMB52(file: File): Promise<Blob> {
  await simulateDelay();
  maybeThrow();
  return new Blob(
    [`MB52 Filtered — Source: ${file.name}\nProcessed at ${new Date().toISOString()}`],
    { type: "text/csv" }
  );
}

export async function processMB51(file: File, movementType: string = "102"): Promise<Blob> {
  await simulateDelay();
  maybeThrow();
  return new Blob(
    [`MB51 Filtered — Source: ${file.name}, Movement Type: ${movementType}\nProcessed at ${new Date().toISOString()}`],
    { type: "text/csv" }
  );
}

/* ── Helpers ─────────────────────────────────── */

function simulateDelay(): Promise<void> {
  const ms = 2000 + Math.random() * 2000;
  return new Promise((r) => setTimeout(r, ms));
}

function maybeThrow(): void {
  if (Math.random() < 0.08) {
    throw new Error("Simulated processing error from backend.");
  }
}
