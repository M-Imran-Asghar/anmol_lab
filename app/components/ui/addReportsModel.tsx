import { X } from "lucide-react";
import { useEffect, useState } from "react";
import PatientReportModal from "@/app/components/ui/patientReportModal";

interface TestResult {
  parentTestName?: string;
  hasSubTests?: boolean;
  testName: string;
  unit?: string;
  result: string;
  referenceRange: string;
  notes?: string;
}

interface LabTest {
  name: string;
  code: string;
  subTests: Array<{
    name: string;
    referenceRange: string;
    unit: string;
  }>;
}

interface AddReportsModelProps {
  onClose: () => void;
  patientId: number;
  testNames: string[];
}

const AddReportsModel: React.FC<AddReportsModelProps> = ({onClose, patientId, testNames}) => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const buildTestResults = async () => {
      try {
        const response = await fetch("/api/lab-tests", {
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load tests");
        }

        const tests = (data.tests || []) as LabTest[];
        const expandedResults = testNames.flatMap((testName) => {
          const normalizedTestName = testName.trim().toLowerCase();
          const matchedTest = tests.find(
            (test) => test.name.trim().toLowerCase() === normalizedTestName
          );

          if (matchedTest && matchedTest.subTests.length > 0) {
            return matchedTest.subTests.map((subTest) => ({
              parentTestName: matchedTest.name,
              hasSubTests: true,
              testName: subTest.name,
              unit: subTest.unit || "",
              result: "",
              referenceRange: subTest.referenceRange || "",
              notes: "",
            }));
          }

          return [
            {
              parentTestName: testName,
              hasSubTests: false,
              testName,
              unit: "",
              result: "",
              referenceRange: "",
              notes: "",
            },
          ];
        });

        setTestResults(expandedResults);
      } catch (error) {
        console.error("Failed to load test catalog", error);
        setTestResults(
          testNames.map((name) => ({
            parentTestName: name,
            hasSubTests: false,
            testName: name,
            unit: "",
            result: "",
            referenceRange: "",
            notes: "",
          }))
        );
      } finally {
        setCatalogLoading(false);
      }
    };

    buildTestResults();
  }, [testNames]);

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
        const data = await response.json();
        if (data.patient?.reportPDF) {
          setShowReportModal(true);
        } else {
          alert('Test results added successfully, but PDF report is not available yet.');
          onClose();
        }
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

  if (showReportModal) {
    return (
      <PatientReportModal
        patientId={patientId}
        onClose={onClose}
      />
    );
  }

  const groupedResults = testResults.reduce<Record<string, TestResult[]>>((groups, test) => {
    const groupName = test.parentTestName || test.testName;
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(test);
    return groups;
  }, {});

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
            {catalogLoading ? (
              <p className="text-gray-600">Loading test details...</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedResults).map(([groupName, items]) => (
                  <div key={groupName} className="rounded-xl border border-gray-200 overflow-hidden">
                    {items[0]?.hasSubTests ? (
                      <>
                        <div className="bg-purple-50 px-4 py-3 border-b border-gray-200">
                          <h3 className="font-semibold text-purple-800">{groupName}</h3>
                        </div>
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left p-3 font-semibold">Sub Test</th>
                              <th className="text-left p-3 font-semibold">Unit</th>
                              <th className="text-left p-3 font-semibold">Result</th>
                              <th className="text-left p-3 font-semibold">Range</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((test) => {
                              const absoluteIndex = testResults.findIndex(
                                (resultItem) =>
                                  resultItem.parentTestName === test.parentTestName &&
                                  resultItem.testName === test.testName
                              );

                              return (
                                <tr key={`${groupName}-${test.testName}`} className="border-b">
                                  <td className="p-3 font-medium">{test.testName}</td>
                                  <td className="p-3 text-gray-700">{test.unit || "-"}</td>
                                  <td className="p-3">
                                    <input
                                      type="text"
                                      value={test.result}
                                      onChange={(e) => handleResultChange(absoluteIndex, 'result', e.target.value)}
                                      placeholder="Enter test result"
                                      className="w-full p-2 border rounded outline-none focus:border-purple-500"
                                    />
                                  </td>
                                  <td className="p-3">
                                    <input
                                      type="text"
                                      value={test.referenceRange}
                                      onChange={(e) => handleResultChange(absoluteIndex, 'referenceRange', e.target.value)}
                                      placeholder="Enter reference range"
                                      className="w-full p-2 border rounded outline-none focus:border-purple-500"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </>
                    ) : (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="text-left p-3 font-semibold">Test Name</th>
                            <th className="text-left p-3 font-semibold">Unit</th>
                            <th className="text-left p-3 font-semibold">Result</th>
                            <th className="text-left p-3 font-semibold">Range</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((test) => {
                            const absoluteIndex = testResults.findIndex(
                              (resultItem) =>
                                resultItem.parentTestName === test.parentTestName &&
                                resultItem.testName === test.testName
                            );

                            return (
                              <tr key={`${groupName}-${test.testName}`} className="border-b">
                                <td className="p-3 font-medium">{groupName}</td>
                                <td className="p-3">
                                  <input
                                    type="text"
                                    value={test.unit || ""}
                                    onChange={(e) => handleResultChange(absoluteIndex, 'unit', e.target.value)}
                                    placeholder="Enter unit"
                                    className="w-full p-2 border rounded outline-none focus:border-purple-500"
                                  />
                                </td>
                                <td className="p-3">
                                  <input
                                    type="text"
                                    value={test.result}
                                    onChange={(e) => handleResultChange(absoluteIndex, 'result', e.target.value)}
                                    placeholder="Enter test result"
                                    className="w-full p-2 border rounded outline-none focus:border-purple-500"
                                  />
                                </td>
                                <td className="p-3">
                                  <input
                                    type="text"
                                    value={test.referenceRange}
                                    onChange={(e) => handleResultChange(absoluteIndex, 'referenceRange', e.target.value)}
                                    placeholder="Enter reference range"
                                    className="w-full p-2 border rounded outline-none focus:border-purple-500"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end items-center mt-6">
              <button
                onClick={handleSubmit}
                disabled={loading || catalogLoading}
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
