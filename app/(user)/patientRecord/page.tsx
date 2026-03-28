"use client";
import { useState, useEffect, useCallback } from "react";
import Button from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";
import PatientReportModal from "@/app/components/ui/patientReportModal";
import { downloadPatientReport, printPatientReport } from "@/app/lib/patientReportActions";
import { User, IdCard, Mail, Phone, Stethoscope, Calendar, Search, Printer, Download, Eye } from "lucide-react";

interface Patient {
  _id: string;
  patientId: number;
  patientname: string;
  cnic: number;
  patientEmail: string;
  patientMobile: number;
  doctorName: string;
  createdAt: string;
  status?: string;
}

const PatientRecord: React.FC = () => {
  const [filters, setFilters] = useState({
    name: '',
    cnic: '',
    email: '',
    mobile: '',
    doctor: '',
    dateFrom: '',
    dateTo: ''
  });
  const [isSearching, setIsSearching] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportPatient, setReportPatient] = useState<Patient | null>(null);

  // Wrap fetchPatients in useCallback to prevent unnecessary re-renders
  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.cnic) params.append('cnic', filters.cnic);
      if (filters.email) params.append('email', filters.email);
      if (filters.mobile) params.append('mobile', filters.mobile);
      if (filters.doctor) params.append('doctor', filters.doctor);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      params.append('limit', '1000');
      
      const response = await fetch(`/api/patient/patientRegistration?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]); // Add dependencies that fetchPatients uses

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]); // Now fetchPatients is in the dependency array

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    await fetchPatients();
    setIsSearching(false);
  };

  const downloadPDF = async (patientId: number) => {
    try {
      await downloadPatientReport(patientId);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(error instanceof Error ? error.message : 'Error downloading PDF');
    }
  };

  const printReport = async (patientId: number) => {
    try {
      await printPatientReport(patientId);
    } catch (error) {
      console.error('Error printing PDF:', error);
      alert(error instanceof Error ? error.message : 'Error printing PDF');
    }
  };

  const handleClearFilters = () => {
    setFilters({
      name: '',
      cnic: '',
      email: '',
      mobile: '',
      doctor: '',
      dateFrom: '',
      dateTo: ''
    });
    // Use setTimeout with fetchPatients as dependency
    setTimeout(() => {
      fetchPatients();
    }, 100);
  };

  return (
    <div className="app-page">
      <div className="page-card page-accent mx-auto w-full max-w-7xl rounded-[2rem] p-5 sm:p-8">
        <h2 className="mb-6 text-center text-3xl font-black text-violet-700 sm:text-4xl">
          Patient Record
        </h2>

        {/* Search Form - All Fields Visible */}
        <form onSubmit={handleSearch} className="page-card mb-8 space-y-4 rounded-[1.5rem] p-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Name Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient Name 
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by patient name..."
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* CNIC Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNIC Number
              </label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter CNIC"
                  value={filters.cnic}
                  onChange={(e) => handleFilterChange('cnic', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Email Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={filters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Mobile Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter phone number"
                  value={filters.mobile}
                  onChange={(e) => handleFilterChange('mobile', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Doctor Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor Name
              </label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter doctor name"
                  value={filters.doctor}
                  onChange={(e) => handleFilterChange('doctor', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Date Range - Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date From
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="soft-input pl-10 w-full px-4 py-3"
                />
              </div>
            </div>

            {/* Date Range - Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date To
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="soft-input pl-10 w-full px-4 py-3"
                />
              </div>
            </div>
          </div>

          {/* Search and Clear Buttons */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Button
              type="submit"
              disabled={isSearching}
              className="flex-1 bg-linear-to-r from-violet-600 to-indigo-600 py-3 text-white hover:from-violet-700 hover:to-indigo-700"
            >
              <Search className="w-5 h-5" />
              {isSearching ? 'Searching...' : 'Search Patients'}
            </Button>
            <Button
              type="button"
              onClick={handleClearFilters}
              className="flex-1 border border-slate-200 bg-white py-3 text-slate-700 hover:bg-slate-50"
            >
              Clear All Filters
            </Button>
          </div>
        </form>

        {/* Patient Table */}
        <div className="mt-8">
          <h3 className="mb-4 text-xl font-black text-slate-800">Patient Records</h3>
          
          {loading ? (
            <div className="space-y-4 rounded-[1.5rem] bg-white/50 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="loading-card flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="shimmer h-4 w-20 rounded-full" />
                    <div className="shimmer h-5 w-44 rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:flex">
                    <div className="shimmer h-10 w-24 rounded-xl" />
                    <div className="shimmer h-10 w-24 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : patients.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/60 py-10 text-center text-slate-500">
              No patients found
            </div>
          ) : (
            <div className="table-shell overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-violet-50/80">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNIC</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-violet-50/30">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {patient.patientId}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.patientname}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.cnic}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.patientEmail}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.patientMobile}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.doctorName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(patient.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          patient.status === 'Verified' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {patient.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {patient.status === 'Verified' && (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => setReportPatient(patient)}
                              className="px-2 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded transition-all text-xs"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => printReport(patient.patientId)}
                              className="px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-all text-xs"
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => downloadPDF(patient.patientId)}
                              className="px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded transition-all text-xs"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {reportPatient && (
        <PatientReportModal
          patientId={reportPatient.patientId}
          patientName={reportPatient.patientname}
          onClose={() => setReportPatient(null)}
        />
      )}
    </div>
  );
};

export default PatientRecord;
