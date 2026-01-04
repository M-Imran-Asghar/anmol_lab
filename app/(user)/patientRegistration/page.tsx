"use client";

import { useState } from "react";
import Button from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";

const TEST_DB = [
  { code: "T100", name: "CBC", price: 500, sample: "Blood" },
  { code: "T101", name: "Blood Sugar", price: 200, sample: "Blood" },
  { code: "T102", name: "Urine Test", price: 300, sample: "Urine" },
  { code: "T103", name: "Liver Function", price: 800, sample: "Blood" },
];

const PatientRegistration: React.FC = () => {
  const [form, setForm] = useState({
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
  const [selectedTests, setSelectedTests] = useState<
    { code: string; name: string; price: number; sample: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [savedPatient, setSavedPatient] = useState<any>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAddTest = () => {
    const test = TEST_DB.find(
      (t) =>
        t.code.toLowerCase() === testInput.toLowerCase() ||
        t.name.toLowerCase() === testInput.toLowerCase()
    );
    if (test && !selectedTests.find((t) => t.code === test.code)) {
      setSelectedTests([...selectedTests, test]);
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
    } catch (err) {
      setResponseMsg("Network error");
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
    <div className="bg-linear-to-br from-purple-200 to-purple-400 px-4 py-3 flex justify-center min-h-screen">
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-xl p-5">
        <h2 className="text-2xl font-bold text-purple-700 text-center mb-4">
          Patient Registration
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Patient Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-base font-semibold text-purple-600 mb-3">
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
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-base font-semibold text-purple-600 mb-3">
              Medical Details & Test Selection
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <Input name="pateintAge" type="number" placeholder="Age" value={form.pateintAge} onChange={handleFormChange} />
              <select name="years_month_day" value={form.years_month_day} onChange={handleFormChange} className="border rounded px-2 py-2">
                <option value="years">Years</option>
                <option value="months">Months</option>
                <option value="days">Days</option>
              </select>
              <select name="gender" value={form.gender} onChange={handleFormChange} className="border rounded px-2 py-2">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <Input type="text" name="bloodGroup" placeholder="Blood Group" value={form.bloodGroup} onChange={handleFormChange} />
              <Input type="text" name="doctorName" placeholder="Doctor Name" value={form.doctorName} onChange={handleFormChange} />
            </div>

            <div className="flex gap-2 mb-3">
              <Input type="text" placeholder="Enter Test Code or Name" value={testInput} onChange={(e) => setTestInput(e.target.value)} />
              <Button type="button" className="p-2" onClick={handleAddTest}>Add Test</Button>
            </div>

            {selectedTests.length > 0 && (
              <table className="w-full border text-sm mb-3">
                <thead className="bg-purple-100">
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
            )}
          </div>

          {/* Billing */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-base font-semibold text-purple-600 mb-3">
              Billing Summary
            </h3>
            <table className="w-full border text-sm">
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
            <Button type="submit" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow" disabled={loading}>
              {loading ? "Saving..." : "Save Patient"}
            </Button>
          </div>
        </form>

        {/* Modal */}
        {showModal && savedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-lg max-w-lg w-full relative">
              <h3 className="text-xl font-bold mb-3 text-purple-700">Patient Details</h3>
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
              <div className="flex justify-end gap-2 mt-4">
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handlePrint}>Print</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSend}>Send</Button>
                <Button className="bg-gray-400 hover:bg-gray-500 text-white" onClick={() => setShowModal(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PatientRegistration;
