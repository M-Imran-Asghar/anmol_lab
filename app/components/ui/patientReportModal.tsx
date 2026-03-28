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
  const previewUrl = buildPatientReportUrl(patientId, "inline");

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
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-linear-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white">
            <div>
              <h2 className="text-2xl font-bold">Patient Report</h2>
              <p className="text-sm text-purple-100">
                {patientName ? `${patientName} report preview` : `Report for patient #${patientId}`}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-white/15"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-gray-50 px-6 py-4">
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

          <div className="min-h-[60vh] flex-1 bg-gray-100 p-3">
            <iframe
              title={`Patient report ${patientId}`}
              src={previewUrl}
              className="h-full min-h-[60vh] w-full rounded-xl border border-gray-200 bg-white"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientReportModal;
