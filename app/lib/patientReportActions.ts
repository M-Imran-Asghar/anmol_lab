"use client";

type Disposition = "inline" | "attachment";

export function buildPatientReportUrl(patientId: number, disposition: Disposition = "inline"): string {
  const params = new URLSearchParams({
    patientId: String(patientId),
    disposition,
    ts: String(Date.now()),
  });

  return `/api/patient/pdf?${params.toString()}`;
}

async function readErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await response.json();
    return data.message || "Failed to open report";
  }

  const text = await response.text();
  return text || "Failed to open report";
}

export function viewPatientReport(patientId: number): void {
  const reportWindow = window.open(buildPatientReportUrl(patientId, "inline"), "_blank", "noopener,noreferrer");

  if (!reportWindow) {
    alert("Please allow popups to view the report");
  }
}

export async function downloadPatientReport(patientId: number): Promise<void> {
  const response = await fetch(buildPatientReportUrl(patientId, "attachment"));

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `lab_report_${patientId}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 5000);
}

export async function printPatientReport(patientId: number): Promise<void> {
  const response = await fetch(buildPatientReportUrl(patientId, "inline"));

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const printWindow = window.open(url, "_blank");

  if (!printWindow) {
    window.URL.revokeObjectURL(url);
    throw new Error("Please allow popups to print the report");
  }

  printWindow.onload = () => {
    window.setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 60000);
}
