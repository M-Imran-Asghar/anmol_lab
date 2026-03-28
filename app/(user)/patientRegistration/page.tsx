"use client";

import { useEffect, useState } from "react";
import Button from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";

// Define interfaces
interface TestItem {
  _id: string;
  code: string;
  name: string;
  price: number;
  sample: string;
  subTests: Array<{
    name: string;
    referenceRange: string;
  }>;
}

interface FormData {
  patientname: string;
  fatherOrHusbandName: string;
  cnic: string;
  patientMobile: string;
  patientEmail: string;
  patientAddress: string;
  pateintAge: string;
  years_month_day: string;
  gender: string;
  bloodGroup: string;
  doctorName: string;
}

interface PatientData {
  patientId: string;
  patientname: string;
  fatherOrHusbandName: string;
  pateintAge: string;
  years_month_day: string;
  gender: string;
  bloodGroup: string;
  patientMobile: string;
  patientEmail: string;
  patientAddress: string;
  doctorName: string;
  testName: string;
  payAmount: number;
  sampleRequiered: boolean;
}

const PatientRegistration: React.FC = () => {
  const [form, setForm] = useState<FormData>({
    patientname: "",
    fatherOrHusbandName: "",
    cnic: "",
    patientMobile: "",
    patientEmail: "",
    patientAddress: "",
    pateintAge: "",
    years_month_day: "years",
    gender: "Male",
    bloodGroup: "",
    doctorName: "",
  });

  const [testInput, setTestInput] = useState("");
  const [availableTests, setAvailableTests] = useState<TestItem[]>([]);
  const [testsLoading, setTestsLoading] = useState(true);
  const [selectedTests, setSelectedTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [savedPatient, setSavedPatient] = useState<PatientData | null>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch("/api/lab-tests", {
          credentials: "include",
        });
        const data = await response.json();

        if (response.ok) {
          setAvailableTests(data.tests || []);
        } else {
          setResponseMsg(data.message || "Failed to load tests");
        }
      } catch (error) {
        console.error("Error loading tests:", error);
        setResponseMsg("Failed to load tests");
      } finally {
        setTestsLoading(false);
      }
    };

    fetchTests();
  }, []);

  const normalizedTestInput = testInput.trim().toLowerCase();
  const matchedTest = normalizedTestInput
    ? availableTests.find((test) => {
        const normalizedName = test.name.toLowerCase();
        const normalizedCode = test.code.toLowerCase();

        return (
          normalizedCode === normalizedTestInput ||
          normalizedName === normalizedTestInput ||
          normalizedName.includes(normalizedTestInput)
        );
      }) || null
    : null;

  const handleAddTest = () => {
    if (!matchedTest) {
      setResponseMsg("No matching test found in the database");
      return;
    }

    if (!selectedTests.find((test) => test.code === matchedTest.code)) {
      setSelectedTests([...selectedTests, matchedTest]);
      setResponseMsg("");
    } else {
      setResponseMsg("This test is already added");
    }

    setTestInput("");
  };

  const handleRemoveTest = (code: string) => {
    setSelectedTests(selectedTests.filter((t) => t.code !== code));
  };

  const totalAmount = selectedTests.reduce((sum, t) => sum + t.price, 0);
  const sampleRequired = selectedTests.some((t) => t.sample === "Blood");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponseMsg("");

    const payload = {
      ...form,
      testName: selectedTests.map((t) => t.name).join(", "),
      payAmount: totalAmount,
      sampleRequiered: sampleRequired,
      sampleReceived: false,
    };

    try {
      const res = await fetch("/api/patient/patientRegistration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setSavedPatient(data.patient);
        setShowModal(true);
        
        setForm({
          patientname: "",
          fatherOrHusbandName: "",
          cnic: "",
          patientMobile: "",
          patientEmail: "",
          patientAddress: "",
          pateintAge: "",
          years_month_day: "years",
          gender: "Male",
          bloodGroup: "",
          doctorName: "",
        });
        setSelectedTests([]);
      } else {
        setResponseMsg(data.message || "Error registering patient");
      }
    } catch (error) {
      setResponseMsg("Network error");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!savedPatient) return;
    const printContent = document.getElementById("print-area");
    if (printContent) {
      const newWindow = window.open("", "_blank");
      newWindow?.document.write(printContent.innerHTML);
      newWindow?.document.close();
      newWindow?.print();
    }
  };

  const handleSend = () => {
    alert("Patient data sent successfully!");
  };

  return (
    <div className="app-page">
      <div className="page-card page-accent mx-auto w-full max-w-7xl rounded-[2rem] p-5 sm:p-8">
        <h2 className="mb-4 text-center text-3xl font-black text-violet-700 sm:text-4xl">
          Patient Registration
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Patient Info */}
          <div className="page-card rounded-[1.5rem] p-4 sm:p-6">
            <h3 className="mb-3 text-base font-black uppercase tracking-[0.2em] text-violet-600">
              Patient Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input type="text" name="patientname" placeholder="Patient Name" value={form.patientname} onChange={handleFormChange} />
              <Input type="text" name="fatherOrHusbandName" placeholder="Father / Husband Name" value={form.fatherOrHusbandName} onChange={handleFormChange} />
              <Input type="text" name="cnic" placeholder="CNIC" value={form.cnic} onChange={handleFormChange} />
              <Input type="tel" name="patientMobile" placeholder="Mobile Number" value={form.patientMobile} onChange={handleFormChange} />
              <Input name="patientEmail" type="email" placeholder="Email Address" value={form.patientEmail} onChange={handleFormChange} />
              <Input type="text" name="patientAddress" placeholder="Patient Address" value={form.patientAddress} onChange={handleFormChange} />
            </div>
          </div>

          {/* Medical Info & Tests */}
          <div className="page-card rounded-[1.5rem] p-4 sm:p-6">
            <h3 className="mb-3 text-base font-black uppercase tracking-[0.2em] text-violet-600">
              Medical Details & Test Selection
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <Input name="pateintAge" type="number" placeholder="Age" value={form.pateintAge} onChange={handleFormChange} />
              <select name="years_month_day" value={form.years_month_day} onChange={handleFormChange} className="soft-input px-4 py-3">
                <option value="years">Years</option>
                <option value="months">Months</option>
                <option value="days">Days</option>
              </select>
              <select name="gender" value={form.gender} onChange={handleFormChange} className="soft-input px-4 py-3">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <Input type="text" name="bloodGroup" placeholder="Blood Group" value={form.bloodGroup} onChange={handleFormChange} />
              <Input type="text" name="doctorName" placeholder="Doctor Name" value={form.doctorName} onChange={handleFormChange} />
            </div>

            <div className="mb-3 flex flex-col gap-2 sm:flex-row">
              <Input type="text" placeholder="Enter Test Code or Name" value={testInput} onChange={(e) => setTestInput(e.target.value)} />
              <Button type="button" className="bg-violet-600 px-4 py-3 text-white hover:bg-violet-700" onClick={handleAddTest} disabled={testsLoading}>
                Add Test
              </Button>
            </div>

            {testsLoading && (
              <div className="space-y-3 mb-4">
                <div className="shimmer h-12 w-full rounded-2xl" />
                <div className="shimmer h-12 w-2/3 rounded-2xl" />
              </div>
            )}

            {!testsLoading && matchedTest && (
              <div className="mb-4 rounded-2xl border border-violet-200 bg-violet-50/90 p-4 shadow-sm">
                <div className="flex flex-col gap-1 text-sm text-gray-700">
                  <p><strong>Code:</strong> {matchedTest.code}</p>
                  <p><strong>Test:</strong> {matchedTest.name}</p>
                  <p><strong>Sample:</strong> {matchedTest.sample}</p>
                  <p><strong>Price:</strong> Rs. {matchedTest.price}</p>
                </div>
              </div>
            )}

            {!testsLoading && normalizedTestInput && !matchedTest && (
              <p className="text-sm text-red-500 mb-3">No test found for this code or name.</p>
            )}

            {!testsLoading && availableTests.length === 0 && (
              <p className="text-sm text-red-500 mb-3">No tests are configured in the database yet.</p>
            )}

            {selectedTests.length > 0 && (
              <div className="table-shell overflow-x-auto">
              <table className="w-full text-sm mb-3">
                <thead className="bg-violet-100/80">
                  <tr>
                    <th className="border px-2 py-1">Code</th>
                    <th className="border px-2 py-1">Name</th>
                    <th className="border px-2 py-1">Price</th>
                    <th className="border px-2 py-1">Sample</th>
                    <th className="border px-2 py-1">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTests.map((t) => (
                    <tr key={t.code}>
                      <td className="border px-2 py-1">{t.code}</td>
                      <td className="border px-2 py-1">{t.name}</td>
                      <td className="border px-2 py-1">{t.price}</td>
                      <td className="border px-2 py-1">{t.sample}</td>
                      <td className="border px-2 py-1 text-center">
                        <button type="button" className="text-red-500" onClick={() => handleRemoveTest(t.code)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>

          {/* Billing */}
          <div className="page-card rounded-[1.5rem] p-4 sm:p-6">
            <h3 className="mb-3 text-base font-black uppercase tracking-[0.2em] text-violet-600">
              Billing Summary
            </h3>
            <table className="table-shell w-full text-sm">
              <tbody>
                <tr>
                  <td className="border px-3 py-2">Total Amount</td>
                  <td className="border px-3 py-2 text-right">{totalAmount}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Response */}
          {responseMsg && <p className="text-green-600 font-medium">{responseMsg}</p>}

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" className="bg-linear-to-r from-violet-600 to-indigo-600 px-6 py-3 text-white hover:from-violet-700 hover:to-indigo-700" disabled={loading}>
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Saving...
                </>
              ) : "Save Patient"}
            </Button>
          </div>
        </form>

        {/* Modal */}
        {showModal && savedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="page-card w-full max-w-lg rounded-[1.75rem] p-5 relative">
              <h3 className="mb-3 text-xl font-black text-violet-700">Patient Details</h3>
              <div id="print-area">
                <p><strong>Patient ID:</strong> {savedPatient.patientId}</p>
                <p><strong>Name:</strong> {savedPatient.patientname}</p>
                <p><strong>Father/Husband:</strong> {savedPatient.fatherOrHusbandName}</p>
                <p><strong>Age:</strong> {savedPatient.pateintAge} {savedPatient.years_month_day}</p>
                <p><strong>Gender:</strong> {savedPatient.gender}</p>
                <p><strong>Blood Group:</strong> {savedPatient.bloodGroup}</p>
                <p><strong>Mobile:</strong> {savedPatient.patientMobile}</p>
                <p><strong>Email:</strong> {savedPatient.patientEmail}</p>
                <p><strong>Address:</strong> {savedPatient.patientAddress}</p>
                <p><strong>Doctor:</strong> {savedPatient.doctorName}</p>
                <p><strong>Tests:</strong> {savedPatient.testName}</p>
                <p><strong>Total Amount:</strong> {savedPatient.payAmount}</p>
                <p><strong>Sample Required:</strong> {savedPatient.sampleRequiered ? "Yes" : "No"}</p>
              </div>
              <div className="mt-4 flex flex-col justify-end gap-2 sm:flex-row">
                <Button className="bg-green-600 text-white hover:bg-green-700" onClick={handlePrint}>Print</Button>
                <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleSend}>Send</Button>
                <Button className="bg-slate-300 text-slate-800 hover:bg-slate-400" onClick={() => setShowModal(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PatientRegistration;
