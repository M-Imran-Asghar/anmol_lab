"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SubTest {
  name: string;
  referenceRange: string;
  unit: string;
}

interface Test {
  _id: string;
  name: string;
  price: number;
  code: string;
  sample: string;
  subTests: SubTest[];
}

const emptySubTest = (): SubTest => ({
  name: "",
  referenceRange: "",
  unit: "",
});

export default function AdminTests() {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [testName, setTestName] = useState("");
  const [testPrice, setTestPrice] = useState("");
  const [testCode, setTestCode] = useState("");
  const [sampleType, setSampleType] = useState("Blood");
  const [subTests, setSubTests] = useState<SubTest[]>([emptySubTest()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch("/api/lab-tests");
      const data = await response.json();

      if (response.ok) {
        setTests(data.tests || []);
      } else {
        alert(data.message || "Failed to load tests");
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
      alert("Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTestName("");
    setTestPrice("");
    setTestCode("");
    setSampleType("Blood");
    setSubTests([emptySubTest()]);
    setEditingTest(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const normalizedSubTests = subTests
      .map((subTest) => ({
        name: subTest.name.trim(),
        referenceRange: subTest.referenceRange.trim(),
        unit: subTest.unit.trim(),
      }))
      .filter((subTest) => subTest.name);

    try {
      const response = await fetch("/api/lab-tests", {
        method: editingTest ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingTest?._id,
          name: testName,
          price: Number(testPrice),
          code: testCode,
          sample: sampleType,
          subTests: normalizedSubTests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to save test");
        return;
      }

      resetForm();
      fetchTests();
    } catch (error) {
      console.error("Error saving test:", error);
      alert("Failed to save test");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (test: Test) => {
    setEditingTest(test);
    setTestName(test.name);
    setTestPrice(String(test.price));
    setTestCode(test.code);
    setSampleType(test.sample);
    setSubTests(test.subTests.length > 0 ? test.subTests : [emptySubTest()]);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) {
      return;
    }

    try {
      const response = await fetch("/api/lab-tests", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete test");
        return;
      }

      fetchTests();
    } catch (error) {
      console.error("Error deleting test:", error);
      alert("Failed to delete test");
    }
  };

  const addSubTestRow = () => {
    setSubTests((prev) => [...prev, emptySubTest()]);
  };

  const updateSubTest = (index: number, field: keyof SubTest, value: string) => {
    setSubTests((prev) =>
      prev.map((subTest, currentIndex) =>
        currentIndex === index ? { ...subTest, [field]: value } : subTest
      )
    );
  };

  const removeSubTest = (index: number) => {
    setSubTests((prev) => {
      if (prev.length === 1) {
        return [emptySubTest()];
      }

      return prev.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Laboratory Tests</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/admin/users")}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl border border-white/20 transition-all duration-300"
            >
              Back To Users
            </button>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
              >
                + Add New Test
              </button>
            )}
          </div>
        </div>

        {showForm ? (
          <div className="backdrop-blur-md bg-white/10 p-8 rounded-2xl border border-white/20 shadow-2xl mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingTest ? "Edit Test" : "Add New Test"}
              </h2>
              <button
                onClick={resetForm}
                className="text-white hover:text-red-400 text-2xl font-bold"
              >
                x
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">
                    Test Name
                  </label>
                  <input
                    type="text"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter test name"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-semibold mb-2">
                    Test Code
                  </label>
                  <input
                    type="text"
                    value={testCode}
                    onChange={(e) => setTestCode(e.target.value.toUpperCase())}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter test code"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-semibold mb-2">
                    Test Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={testPrice}
                    onChange={(e) => setTestPrice(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter test price"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-semibold mb-2">
                    Sample Type
                  </label>
                  <select
                    value={sampleType}
                    onChange={(e) => setSampleType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Blood" className="text-black">Blood</option>
                    <option value="Urine" className="text-black">Urine</option>
                    <option value="Serum" className="text-black">Serum</option>
                    <option value="Stool" className="text-black">Stool</option>
                    <option value="Other" className="text-black">Other</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Sub Tests</h3>
                    <p className="text-sm text-white/70">
                      Example: CBC can have Hemoglobin, WBC, RBC, Platelets.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addSubTestRow}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300"
                  >
                    + Add Sub Test
                  </button>
                </div>

                <div className="space-y-4">
                  {subTests.map((subTest, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_140px_auto] gap-4 items-end">
                      <div>
                        <label className="block text-white text-sm font-semibold mb-2">
                          Sub Test Name
                        </label>
                        <input
                          type="text"
                          value={subTest.name}
                          onChange={(e) => updateSubTest(index, "name", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g. Hemoglobin"
                        />
                      </div>

                      <div>
                        <label className="block text-white text-sm font-semibold mb-2">
                          Reference Range
                        </label>
                        <input
                          type="text"
                          value={subTest.referenceRange}
                          onChange={(e) => updateSubTest(index, "referenceRange", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g. 4.5 - 11.0"
                        />
                      </div>

                      <div>
                        <label className="block text-white text-sm font-semibold mb-2">
                          Unit
                        </label>
                        <input
                          type="text"
                          value={subTest.unit}
                          onChange={(e) => updateSubTest(index, "unit", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="e.g. g/dL"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSubTest(index)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl transition-all duration-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : editingTest ? "Update Test" : "Add Test"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 rounded-xl bg-white/20 border border-white/30 text-white hover:bg-white/30 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : null}

        <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-white">
              <p className="text-xl">Loading tests...</p>
            </div>
          ) : tests.length === 0 ? (
            <div className="p-12 text-center text-white/60">
              <p className="text-xl">No tests added yet. Click &quot;Add New Test&quot; to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-600/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">Test Name</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Test Code</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Sample</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Price</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Sub Tests</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test, index) => (
                    <tr
                      key={test._id}
                      className={`border-t border-white/10 hover:bg-white/5 transition-colors ${index % 2 === 0 ? "bg-white/5" : ""}`}
                    >
                      <td className="px-6 py-4 text-white">{test.name}</td>
                      <td className="px-6 py-4 text-white">{test.code}</td>
                      <td className="px-6 py-4 text-white">{test.sample}</td>
                      <td className="px-6 py-4 text-white">Rs. {test.price}</td>
                      <td className="px-6 py-4 text-white">
                        {test.subTests.length > 0
                          ? test.subTests.map((subTest) => `${subTest.name}${subTest.unit ? ` (${subTest.unit})` : ""}`).join(", ")
                          : "No sub tests"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleEdit(test)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:-translate-y-0.5"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(test._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:-translate-y-0.5"
                          >
                            Delete
                          </button>
                        </div>
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
}
