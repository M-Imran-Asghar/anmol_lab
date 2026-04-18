"use client";

import { Download, ExternalLink, Printer, X } from "lucide-react";
import {
  buildPatientReportUrl,
  downloadPatientReport,
  printPatientReport,
  viewPatientReport,
} from "@/app/lib/patientReportActions";

interface PatientReportModalProps {
  patientId: number;
  patientName?: string;
  onClose: () => void;
}

const PatientReportModal: React.FC<PatientReportModalProps> = ({
  patientId,
  patientName,
  onClose,
}) => {
  const previewUrl = `${buildPatientReportUrl(
    patientId,
    "inline",
  )}#view=FitH&navpanes=0&toolbar=0&scrollbar=1`;

  const handleDownload = async () => {
    try {
      await downloadPatientReport(patientId);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error downloading PDF");
    }
  };

  const handlePrint = async () => {
    try {
      await printPatientReport(patientId);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error printing PDF");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[100] overflow-y-auto px-3 pb-4 pt-20 sm:px-6 sm:pb-6 sm:pt-24">
        <div className="mx-auto flex w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10">
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-linear-to-r from-purple-600 to-indigo-600 px-4 py-4 text-white sm:px-6">
            <div>
              <h2 className="text-2xl font-bold">Patient Report</h2>
              <p className="text-sm text-purple-100">
                {patientName ? `${patientName} report preview` : `Report for patient #${patientId}`}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 transition-colors hover:bg-white/15"
              aria-label="Close report preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="sticky top-[88px] z-10 flex flex-wrap items-center gap-3 border-b border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
            <button
              type="button"
              onClick={() => viewPatientReport(patientId)}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-100 px-4 py-2 font-semibold text-purple-700 transition-colors hover:bg-purple-200"
            >
              <ExternalLink className="h-4 w-4" />
              View PDF
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 font-semibold text-green-700 transition-colors hover:bg-green-200"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 font-semibold text-blue-700 transition-colors hover:bg-blue-200"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>

          <div className="bg-gray-100 p-3 sm:p-4">
            <iframe
              title={`Patient report ${patientId}`}
              src={previewUrl}
              className="h-[68vh] min-h-[540px] w-full rounded-xl border border-gray-200 bg-white shadow-inner sm:h-[74vh]"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientReportModal;
