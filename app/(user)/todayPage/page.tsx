"use client"
import { useState, useEffect } from "react";
import PatientReportModal from "@/app/components/ui/patientReportModal";
import { User, Phone, Mail, ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface Patient {
  _id: string;
  patientId?: number;
  patientname: string;
  fatherOrHusbandName: string;
  cnic: string;
  patientEmail: string;
  patientMobile: string;
  pateintAge: number;
  gender: string;
  doctorName: string;
  payAmount: number;
  status?: string;
  testName?: string;
  createdAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function TodayPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [loading, setLoading] = useState(false);
  const [reportPatient, setReportPatient] = useState<Patient | null>(null);

  const fetchLatestPatients = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/patient/patientRegistration?page=${page}&limit=10`);
      const data = await response.json();
      
      if (response.ok) {
        setPatients(data.patients);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchLatestPatients(newPage);
    }
  };

  useEffect(() => {
    fetchLatestPatients(1);
  }, []);

  return (
    <div className="app-page">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <div className="page-card page-accent px-6 py-8 text-center sm:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-violet-600">Dashboard</p>
          <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">Welcome to Alflah Lab</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Track the latest patient registrations, review verification progress, and open reports quickly from one clean workspace.
          </p>
        </div>

        {/* Patients List */}
        <div className="page-card overflow-hidden">
          <div className="border-b border-slate-200/80 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-violet-100 p-3">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Latest Patients</h2>
                  <p className="text-sm text-slate-500">Page {pagination.page} of {pagination.totalPages} with {pagination.total} total patients</p>
                </div>
              </div>
              
              {/* Pagination Controls */}
              <div className="flex items-center gap-2 self-start rounded-2xl bg-slate-50 p-2 lg:self-auto">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage || loading}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="rounded-xl bg-violet-100 px-3 py-2 font-semibold text-violet-700">
                  {pagination.page}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage || loading}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4 p-6 sm:p-8">
              <div className="loading-card p-5">
                <div className="shimmer h-6 w-48 rounded-full" />
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="space-y-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4">
                      <div className="shimmer h-4 w-24 rounded-full" />
                      <div className="shimmer h-10 w-full rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="table-shell overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/90">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Patient ID</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Patient</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Contact</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Doctor</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Test</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-violet-50/40 transition-colors duration-150">
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-800">
                          {patient.patientId || patient._id.slice(-6)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{patient.patientname}</p>
                          <p className="text-sm text-gray-500">{patient.fatherOrHusbandName}</p>
                          <p className="text-xs text-gray-400">{patient.pateintAge} years, {patient.gender}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-700">{patient.patientMobile}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-700 truncate max-w-[150px]">{patient.patientEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-700">{patient.doctorName || "N/A"}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-700">{patient.testName || "N/A"}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900">Rs. {patient.payAmount.toLocaleString()}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          patient.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {patient.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-700">
                          {new Date(patient.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        {patient.status === "Verified" ? (
                          <button
                            type="button"
                            onClick={() => setReportPatient(patient)}
                            className="inline-flex items-center gap-2 rounded-xl bg-violet-100 px-3 py-2 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-200"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bottom Pagination */}
          {patients.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} patients
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {reportPatient && (
          <PatientReportModal
            patientId={reportPatient.patientId || 0}
            patientName={reportPatient.patientname}
            onClose={() => setReportPatient(null)}
          />
        )}
      </div>
    </div>
  );
}
