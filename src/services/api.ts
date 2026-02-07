/**
 * Mock API service — simulates Flask backend responses.
 * Replace these functions with real fetch calls when the backend is ready.
 */

export async function processGlobalOrders(
  me2nFile: File,
  ebmFile: File // Note: Your Flask code expects 'lotus_file'
): Promise<Blob> {
  const formData = new FormData();
  
  // These keys must match the strings in: request.files['key']
  formData.append('me2n_file', me2nFile);
  formData.append('lotus_file', ebmFile);

  const response = await fetch('http://localhost:5454/processors/global_orders', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to process orders');
  }

  // Convert the response stream into a Blob (Binary Large Object)
  return await response.blob();
}

export async function processMB52(file: File): Promise<Blob> {
  // 1. Prepare the form data with the key 'mb52_file' 
  // (matching your Flask request.files['mb52_file'])
  const formData = new FormData();
  formData.append('mb52_file', file);

  // 2. Make the request to your Flask server
  const response = await fetch('http://localhost:5454/processors/mb52', {
    method: 'POST',
    body: formData,
  });

  // 3. Handle server errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${response.status}`);
  }

  // 4. Return the binary data (Zip or Excel) as a Blob
  return await response.blob();
}

export async function processMB51(file: File, movementType: number): Promise<Blob> {
  const formData = new FormData();
  formData.append('mb51_file', file);
  formData.append('movement_type', movementType.toString());

  const response = await fetch('http://localhost:5454/processors/mb51', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to process MB51');
  }

  return await response.blob();
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
