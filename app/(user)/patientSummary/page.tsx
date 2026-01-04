"use client"
import { useState } from "react";
import { Calendar, User, Phone, Mail, FileText } from "lucide-react";

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
  payAmount: number;
  status?: string;
  testName?: string;
  createdAt: string;
}

export default function SummaryPage() {
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-12-31");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const startDateFormatted = startDate;
      const endDateFormatted = endDate;
      
      const response = await fetch(`/api/patient/patientRegistration?dateFrom=${startDateFormatted}&dateTo=${endDateFormatted}&limit=1000`);
      const data = await response.json();
      
      if (response.ok) {
        setPatients(data.patients);
        const total = data.patients.reduce((sum: number, patient: Patient) => sum + patient.payAmount, 0);
        setTotalAmount(total);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert('Failed to fetch patient data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Search Form */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">Generate Patient Summary Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-600">Start Date</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-11 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-600">End Date</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-11 px-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-slate-100">
             <button 
               onClick={handleSearch}
               disabled={loading}
               className="bg-purple-600 text-white px-8 py-2.5 text-sm font-bold rounded-lg shadow hover:bg-purple-700 hover:shadow-md transition-all duration-200 transform active:scale-95 flex items-center gap-2 disabled:opacity-50"
             >
               <Calendar className="h-4 w-4" />
               {loading ? 'Searching...' : 'Run Summary'}
             </button>
          </div>
        </div>

        {/* Summary Stats */}
        {patients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{patients.length}</p>
                  <p className="text-sm text-gray-600">Total Patients</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">Rs. {totalAmount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{Math.ceil(totalAmount / patients.length) || 0}</p>
                  <p className="text-sm text-gray-600">Avg. per Patient</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patient Details Table */}
        {patients.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">Patient Details</h3>
              <p className="text-gray-600">Showing {patients.length} patients from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Patient ID</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Contact</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Test</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {patient.patientId || patient._id.slice(-6)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{patient.patientname}</p>
                          <p className="text-sm text-gray-500">{patient.fatherOrHusbandName}</p>
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
                        <span className="text-sm text-gray-700">{patient.testName || 'N/A'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">Rs. {patient.payAmount.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          patient.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {patient.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-700">
                          {new Date(patient.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && patients.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600">Try adjusting your date range to find patients.</p>
          </div>
        )}
      </div>
    </div>
  )
}