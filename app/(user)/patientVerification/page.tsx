"use client"
import Button from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";
import { useEffect, useState, useCallback } from "react";
import { 
  Search, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  X, 
  Check, 
  Stethoscope,
  IdCard,
  Edit,
  Printer,
  Download,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import AddReportsModel from "@/app/components/ui/addReportsModel";

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
  bloodGroup: string;
  patientAddress: string;
  doctorName: string;
  receptionsName: string;
  payAmount: number;
  sampleReceived: boolean;
  createdAt: string;
  updatedAt: string;
  years_month_day: string;
  status?: string;
  testName?: string | string[];
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const PatientVerification: React.FC = () => {
  // Removed unused allPatientsList state
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [showAddReportsModel, setShowAddReportsModel] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    name: "",
    cnic: "",
    email: "",
    mobile: "",
    doctor: "",
    dateFrom: "",
    dateTo: ""
  });

  // Wrap getAllPatientsData with useCallback to stabilize the reference
  const getAllPatientsData = useCallback((page: number = 1, searchParams = filters) => {
    setIsSearching(true);
    
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    // Always filter for pending status only
    queryParams.set('status', 'Pending');
    
    if (searchParams.search.trim()) queryParams.set('search', searchParams.search);
    if (searchParams.name.trim()) queryParams.set('name', searchParams.name);
    if (searchParams.cnic.trim()) queryParams.set('cnic', searchParams.cnic);
    if (searchParams.email.trim()) queryParams.set('email', searchParams.email);
    if (searchParams.mobile.trim()) queryParams.set('mobile', searchParams.mobile);
    if (searchParams.doctor.trim()) queryParams.set('doctor', searchParams.doctor);
    if (searchParams.dateFrom) queryParams.set('dateFrom', searchParams.dateFrom);
    if (searchParams.dateTo) queryParams.set('dateTo', searchParams.dateTo);
    queryParams.set('page', page.toString());
    queryParams.set('limit', '10');
    
    const queryString = queryParams.toString();
    const url = `/api/patient/patientRegistration${queryString ? `?${queryString}` : ''}`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log('API Response:', data);
        // Directly set filteredPatients instead of storing in unused allPatientsList
        setFilteredPatients(data.patients);
        if (data.pagination) {
          setPagination(data.pagination);
        }
        setIsSearching(false);
      })
      .catch(error => {
        console.error('Error fetching patients data:', error);
        setIsSearching(false);
      });
  }, [filters]); // Add filters as dependency since it's used inside

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to page 1 when performing a new search
    getAllPatientsData(1, filters);
  };

  const handleEditReport = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowAddReportsModel(true);
  };

  const closeEditReportModal = () => {
    setShowAddReportsModel(false);
    setSelectedPatient(null);
    // Refresh patient data after closing modal
    getAllPatientsData(pagination.page);
  };

  const handleClearFilters = () => {
    const resetFilters = {
      search: "",
      name: "",
      cnic: "",
      email: "",
      mobile: "",
      doctor: "",
      dateFrom: "",
      dateTo: ""
    };
    setFilters(resetFilters);
    // Fetch all patients with reset filters
    getAllPatientsData(1, resetFilters);
    setSelectedPatient(null);
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      getAllPatientsData(newPage);
    }
  };

  useEffect(() => {
    // Create an async function inside useEffect
    const loadInitialData = async () => {
      await getAllPatientsData(1, {
        search: "",
        name: "",
        cnic: "",
        email: "",
        mobile: "",
        doctor: "",
        dateFrom: "",
        dateTo: ""
      });
    };
    
    loadInitialData();
  }, [getAllPatientsData]); // Add getAllPatientsData as dependency

  const downloadPDF = async (patientId: number) => {
    try {
      const response = await fetch(`/api/patient/pdf?patientId=${patientId}&disposition=attachment`);
      if (!response.ok) {
        const error = await response.json();
        alert(error.message || 'Failed to generate PDF');
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lab_report_${patientId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF');
    }
  };

  const printReport = async (patientId: number) => {
    try {
      const response = await fetch(`/api/patient/pdf?patientId=${patientId}&disposition=inline`);
      if (!response.ok) {
        const error = await response.json();
        alert(error.message || 'Failed to generate PDF');
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          window.setTimeout(() => {
            printWindow.focus();
            printWindow.print();
          }, 500);
        };
      } else {
        alert('Please allow popups to print the report');
      }
      window.setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);
    } catch (error) {
      console.error('Error printing PDF:', error);
      alert('Error printing PDF');
    }
  };

  return (
    <div className="app-page">
      <div className="mx-auto max-w-7xl">
        {/* Header with Search Filters */}
        <div className="page-card page-accent mb-8 p-6">
          <div className="flex flex-col space-y-6">
            {/* Main Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Pending Patient Verification
                </h1>
                <p className="text-gray-600 mt-1">
                  Verify pending patient test results
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">{pagination.total}</p>
                <p className="text-sm text-gray-600">Pending Patients</p>
              </div>
            </div>

            {/* Search Form - All Fields Visible */}
            <form onSubmit={handleSearch} className="space-y-4">
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
                      className="pl-10 w-full border-gray-300 focus:border-purple-500"
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
                      className="pl-10 w-full border-gray-300 focus:border-purple-500"
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
                      className="pl-10 w-full border-gray-300 focus:border-purple-500"
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
                      className="pl-10 w-full border-gray-300 focus:border-purple-500"
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
                      className="pl-10 w-full border-gray-300 focus:border-purple-500"
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
                      className="pl-10 w-full border border-gray-300 rounded-lg p-2 focus:border-purple-500 focus:ring-purple-500 outline-none"
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
                      className="pl-10 w-full border border-gray-300 rounded-lg p-2 focus:border-purple-500 focus:ring-purple-500 outline-none"
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
          </div>
        </div>

        {/* Results Panel with Pagination Controls */}
        <div className="page-card overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-100 p-3">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Patient Records
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Showing {filteredPatients.length} patients on page {pagination.page} of {pagination.totalPages}
                  </p>
                </div>
              </div>
              
              {/* Pagination Controls */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-2">
                  <Button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage || isSearching}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    <span className="rounded-xl bg-violet-100 px-3 py-1 text-violet-700 font-medium">
                      {pagination.page}
                    </span>
                    <span className="text-gray-500">of</span>
                    <span className="rounded-xl bg-gray-100 px-3 py-1 text-gray-700 font-medium">
                      {pagination.totalPages}
                    </span>
                  </div>
                  
                  <Button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage || isSearching}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Records</p>
                  <p className="text-xl font-bold text-gray-800">{pagination.total}</p>
                </div>
              </div>
            </div>
          </div>

          {isSearching ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="loading-card flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="shimmer h-4 w-24 rounded-full" />
                    <div className="shimmer h-5 w-44 rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:flex">
                    <div className="shimmer h-10 w-24 rounded-xl" />
                    <div className="shimmer h-10 w-24 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="table-shell overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Patient ID</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Patient</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">CNIC</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Contact</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Doctor</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <tr key={patient._id} className="hover:bg-violet-50/30 transition-colors duration-150">
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {patient.patientId || patient._id.slice(-6)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{patient.patientname}</p>
                              <p className="text-sm text-gray-500">{patient.fatherOrHusbandName}</p>
                              <p className="text-xs text-gray-400">{patient.pateintAge} {patient.years_month_day}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-gray-700 font-mono text-sm">{patient.cnic}</p>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span className="text-sm text-gray-700">{patient.patientMobile}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span className="text-sm text-gray-700 truncate max-w-36">
                                  {patient.patientEmail}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-gray-700">{patient.doctorName || "N/A"}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              patient.status === 'Verified' ? 'bg-green-100 text-green-800' : 
                              patient.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                              patient.sampleReceived ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {patient.status === 'Verified' || patient.sampleReceived ? (
                                <>
                                  <Check className="w-3 h-3 mr-1" />
                                  Verified
                                </>
                              ) : (
                                <>
                                  <X className="w-3 h-3 mr-1" />
                                  Pending
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-2">
                              <Button
                                onClick={() => handleEditReport(patient)}
                                className="px-3 py-1.5 bg-linear-to-r from-purple-100 to-purple-50 text-purple-700 hover:from-purple-200 hover:to-purple-100 rounded-lg transition-all duration-200 text-sm"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              {patient.status === 'Verified' && (
                                <>
                                  <Button
                                    onClick={() => printReport(patient.patientId || 0)}
                                    className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-all duration-200 text-sm"
                                  >
                                    <Printer className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    onClick={() => downloadPDF(patient.patientId || 0)}
                                    className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-all duration-200 text-sm"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="p-4 bg-gray-100 rounded-full mb-4">
                              <User className="w-12 h-12 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-lg font-medium">No patients found</p>
                            <p className="text-gray-400 mt-2 max-w-md">
                              Try adjusting your search filters or clear all filters to see all patients
                            </p>
                            <Button
                              onClick={handleClearFilters}
                              className="mt-4 px-6 py-2 border border-purple-600 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            >
                              Clear All Filters
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Bottom Pagination */}
              {filteredPatients.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} patients
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                      <Button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {showAddReportsModel && selectedPatient && (
        <AddReportsModel
          patientId={selectedPatient.patientId || 0}
          testNames={typeof selectedPatient.testName === 'string' 
            ? selectedPatient.testName.split(',').map(name => name.trim())
            : Array.isArray(selectedPatient.testName) 
              ? selectedPatient.testName 
              : ['CBC']
          }
          onClose={closeEditReportModal}
        />
      )}
    </div>
  );
};

export default PatientVerification;
