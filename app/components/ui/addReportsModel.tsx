import { X } from "lucide-react";
import { useState } from "react";

interface TestResult {
  testName: string;
  result: string;
  referenceRange: string;
  notes?: string;
}

interface AddReportsModelProps {
  onClose: () => void;
  patientId: number;
  testNames: string[];
}

const AddReportsModel: React.FC<AddReportsModelProps> = ({onClose, patientId, testNames}) => {
  const [testResults, setTestResults] = useState<TestResult[]>(
    testNames.map(name => ({
      testName: name,
      result: '',
      referenceRange: '',
      notes: ''
    }))
  );
  const [loading, setLoading] = useState(false);

  const handleResultChange = (index: number, field: keyof TestResult, value: string) => {
    setTestResults(prev => 
      prev.map((test, i) => 
        i === index ? { ...test, [field]: value } : test
      )
    );
  };

  const handleSubmit = async () => {
    const filledResults = testResults.filter(test => test.result.trim());
    if (filledResults.length === 0) {
      alert("Please fill in at least one test result");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/patient/patientRegistration', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId,
          testResults: filledResults
        })
      });

      if (response.ok) {
        alert('Test results added successfully! Status changed to Verified.');
        onClose();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to save test results', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-purple-600 to-indigo-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Add Report</h2>
                <p className="text-purple-100">Add test results for patient</p>
              </div>
              <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Test Name</th>
                  <th className="text-left p-3 font-semibold">Test Result</th>
                  <th className="text-left p-3 font-semibold">Reference Range</th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((test, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3 font-medium">{test.testName}</td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={test.result}
                        onChange={(e) => handleResultChange(index, 'result', e.target.value)}
                        placeholder="Enter test result"
                        className="w-full p-2 border rounded outline-none focus:border-purple-500"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={test.referenceRange}
                        onChange={(e) => handleResultChange(index, 'referenceRange', e.target.value)}
                        placeholder="Enter reference range"
                        className="w-full p-2 border rounded outline-none focus:border-purple-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end items-center mt-6">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="py-2 px-4 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Results'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
};

export default AddReportsModel;