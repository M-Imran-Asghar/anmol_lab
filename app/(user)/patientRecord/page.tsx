"use client";
import { useState, useEffect, useCallback } from "react";
import Button from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";
import { User, IdCard, Mail, Phone, Stethoscope, Calendar, Search } from "lucide-react";

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
    <div className="flex justify-center items-center bg-linear-to-br from-purple-200 to-purple-400 py-6 px-4 rounded">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-6xl">
        <h2 className="text-3xl font-bold mb-6 text-purple-700 text-center">
          Patient Record
        </h2>

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

        {/* Patient Table */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Patient Records</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-gray-600">Loading patients...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No patients found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNIC</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-gray-50">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientRecord;