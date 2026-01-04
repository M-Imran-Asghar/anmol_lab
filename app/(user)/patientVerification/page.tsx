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
  FileText, 
  X, 
  Check, 
  Droplets, 
  Stethoscope,
  CreditCard,
  UserCircle,
  Home,
  IdCard,
  Clock,
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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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

  const handleEditReport = () => {
    setShowAddReportsModel(true);
  };

  const closeEditReportModal = () => {
    setShowAddReportsModel(false);
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
    setShowDetailsModal(false);
  };

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
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

  // Close modal on escape key press
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDetailsModal();
      }
    };

    if (showDetailsModal) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [showDetailsModal]);

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Search Filters */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
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
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSearching}
                  className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-300 disabled:opacity-50"
                >
                  <Search className="w-5 h-5" />
                  {isSearching ? 'Searching...' : 'Search Patients'}
                </Button>
                <Button
                  type="button"
                  onClick={handleClearFilters}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition-all duration-300"
                >
                  Clear All Filters
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Results Panel with Pagination Controls */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
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
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage || isSearching}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md font-medium">
                      {pagination.page}
                    </span>
                    <span className="text-gray-500">of</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md font-medium">
                      {pagination.totalPages}
                    </span>
                  </div>
                  
                  <Button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage || isSearching}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600">Searching patients...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
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
                        <tr key={patient._id} className="hover:bg-gray-50 transition-colors duration-150">
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
                                <span className="text-sm text-gray-700 truncate max-w-[150px]">
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
                            <Button
                              onClick={() => handleViewDetails(patient)}
                              className="px-3 py-1.5 bg-linear-to-r from-purple-100 to-purple-50 text-purple-700 hover:from-purple-200 hover:to-purple-100 rounded-lg transition-all duration-200 text-sm"
                            >
                              View Details
                            </Button>
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

      {/* Patient Details Modal/Popup */}
      {showDetailsModal && selectedPatient && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity animate-fadeIn"
            onClick={closeDetailsModal}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-linear-to-r from-purple-600 to-indigo-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <UserCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Patient Details
                      </h2>
                      <p className="text-purple-100">
                        Complete patient information record
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeDetailsModal}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Patient Header Info */}
                <div className="mb-8 p-4 bg-linear-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {selectedPatient.patientname}
                      </h3>
                      <p className="text-gray-600">
                        Patient ID: {selectedPatient.patientId || selectedPatient._id.slice(-6)}
                      </p>
                    </div>
                    <div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        selectedPatient.status === 'Verified' ? 'bg-green-100 text-green-800' : 
                        selectedPatient.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        selectedPatient.sampleReceived ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedPatient.status === 'Verified' || selectedPatient.sampleReceived ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Personal Information Card */}
                  <div className="space-y-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-600" />
                      Personal Information
                    </h3>
                    <DetailRow icon={<UserCircle className="w-4 h-4" />} label="Full Name" value={selectedPatient.patientname} />
                    <DetailRow icon={<User className="w-4 h-4" />} label="Father/Husband" value={selectedPatient.fatherOrHusbandName} />
                    <DetailRow icon={<Calendar className="w-4 h-4" />} label="Age" value={`${selectedPatient.pateintAge} ${selectedPatient.years_month_day}`} />
                    <DetailRow icon={<User className="w-4 h-4" />} label="Gender" value={selectedPatient.gender} />
                    <DetailRow icon={<Droplets className="w-4 h-4" />} label="Blood Group" value={selectedPatient.bloodGroup} />
                  </div>

                  {/* Contact Information Card */}
                  <div className="space-y-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-blue-600" />
                      Contact Information
                    </h3>
                    <DetailRow icon={<IdCard className="w-4 h-4" />} label="CNIC" value={selectedPatient.cnic} />
                    <DetailRow icon={<Phone className="w-4 h-4" />} label="Mobile" value={selectedPatient.patientMobile} />
                    <DetailRow icon={<Mail className="w-4 h-4" />} label="Email" value={selectedPatient.patientEmail} />
                    <DetailRow icon={<Home className="w-4 h-4" />} label="Address" value={selectedPatient.patientAddress} />
                  </div>

                  {/* Medical Information Card */}
                  <div className="space-y-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-green-600" />
                      Medical Information
                    </h3>
                    <DetailRow icon={<UserCircle className="w-4 h-4" />} label="Doctor" value={selectedPatient.doctorName || "N/A"} />
                    <DetailRow icon={<User className="w-4 h-4" />} label="Receptionist" value={selectedPatient.receptionsName || "N/A"} />
                    <DetailRow icon={<CreditCard className="w-4 h-4" />} label="Payment" value={`Rs. ${selectedPatient.payAmount.toLocaleString()}`} />
                    <DetailRow icon={selectedPatient.sampleReceived ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-600" />} 
                      label="Sample Status" 
                      value={selectedPatient.sampleReceived ? 'Received' : 'Not Received'} 
                    />
                  </div>
                </div>

                {/* Timestamps and Actions */}
                <div className="mt-6 grid md:grid-cols-2 gap-6">
                  <div className="space-y-4 p-4 bg-linear-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-600" />
                      Registration Details
                    </h3>
                    <DetailRow icon={<Calendar className="w-4 h-4" />} label="Registration Date" value={new Date(selectedPatient.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} />
                    <DetailRow icon={<Clock className="w-4 h-4" />} label="Last Updated" value={new Date(selectedPatient.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} />
                  </div>

                  {/* Actions Card */}
                  <div className="space-y-4 p-4 bg-linear-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button className="flex items-center justify-center gap-2 py-3 bg-white border border-purple-300 text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                      onClick={handleEditReport}
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button className="flex items-center justify-center gap-2 py-3 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors">
                        <Printer className="w-4 h-4" />
                        Print
                      </Button>
                      <Button className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                      </Button>
                      <Button className="flex items-center justify-center gap-2 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-colors">
                        <FileText className="w-4 h-4" />
                        Reports
                      </Button>
                    </div>
                  </div>
                </div>
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
        </>
      )}
    </div>
  );
};

// Helper component for detail rows with icons
const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-gray-100 rounded-lg">
      <div className="w-4 h-4 text-gray-600">
        {icon}
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-medium text-gray-900 truncate">{value}</p>
    </div>
  </div>
);

export default PatientVerification;