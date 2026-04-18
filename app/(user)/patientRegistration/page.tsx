"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Activity,
  BadgePlus,
  Beaker,
  CreditCard,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  Printer,
  Search,
  SendHorizonal,
  ShieldPlus,
  Sparkles,
  Stethoscope,
  TestTube2,
  UserRound,
  X,
} from "lucide-react";
import Button from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";

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

interface SectionHeadingProps {
  icon: ReactNode;
  title: string;
  description: string;
}

interface FieldShellProps {
  icon: ReactNode;
  label: string;
  hint?: string;
  children: ReactNode;
}

interface StatCardProps {
  label: string;
  value: string;
  toneClass: string;
}

const defaultFormState: FormData = {
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
};

function SectionHeading({ icon, title, description }: SectionHeadingProps) {
  return (
    <div className="mb-5 flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-[var(--brand-deep)] shadow-[0_12px_30px_rgba(17,122,115,0.14)]">
        {icon}
      </div>
      <div>
        <p className="section-kicker">{title}</p>
        <h3 className="text-xl font-black text-slate-900 sm:text-2xl">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function FieldShell({ icon, label, hint, children }: FieldShellProps) {
  return (
    <label className="field-shell">
      <span className="field-label">
        <span className="field-icon">{icon}</span>
        {label}
      </span>
      {hint ? <span className="field-hint">{hint}</span> : null}
      {children}
    </label>
  );
}

function StatCard({ label, value, toneClass }: StatCardProps) {
  return (
    <div className={`metric-card ${toneClass}`}>
      <span className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
        {label}
      </span>
      <span className="mt-3 text-2xl font-black text-slate-900">{value}</span>
    </div>
  );
}

const PatientRegistration = () => {
  const [form, setForm] = useState<FormData>(defaultFormState);
  const [testInput, setTestInput] = useState("");
  const [availableTests, setAvailableTests] = useState<TestItem[]>([]);
  const [testsLoading, setTestsLoading] = useState(true);
  const [selectedTests, setSelectedTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [savedPatient, setSavedPatient] = useState<PatientData | null>(null);

  const handleFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

  const exactMatchedTest = normalizedTestInput
    ? availableTests.find((test) => {
        const normalizedName = test.name.toLowerCase();
        const normalizedCode = test.code.toLowerCase();

        return (
          normalizedCode === normalizedTestInput ||
          normalizedName === normalizedTestInput
        );
      }) || null
    : null;

  const suggestedTests = normalizedTestInput
    ? availableTests
        .filter((test) => {
          const normalizedName = test.name.toLowerCase();
          const normalizedCode = test.code.toLowerCase();

          return (
            normalizedCode.includes(normalizedTestInput) ||
            normalizedName.includes(normalizedTestInput)
          );
        })
        .slice(0, 5)
    : [];

  const matchedTest = exactMatchedTest || suggestedTests[0] || null;

  const handleAddSpecificTest = (test: TestItem) => {
    if (selectedTests.some((selected) => selected.code === test.code)) {
      setResponseMsg("This test is already added");
      return;
    }

    setSelectedTests((prev) => [...prev, test]);
    setResponseMsg("");
    setTestInput("");
  };

  const handleAddTest = () => {
    if (!matchedTest) {
      setResponseMsg("No matching test found in the database");
      return;
    }

    handleAddSpecificTest(matchedTest);
  };

  const handleRemoveTest = (code: string) => {
    setSelectedTests((prev) => prev.filter((test) => test.code !== code));
  };

  const totalAmount = selectedTests.reduce((sum, test) => sum + test.price, 0);
  const sampleRequired = selectedTests.some((test) => test.sample === "Blood");

  const feedbackTone = responseMsg.toLowerCase().includes("success")
    ? "feedback-success"
    : responseMsg.toLowerCase().includes("already")
      ? "feedback-warning"
      : "feedback-error";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponseMsg("");

    const payload = {
      ...form,
      testName: selectedTests.map((test) => test.name).join(", "),
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
        setForm(defaultFormState);
        setSelectedTests([]);
      } else {
        setResponseMsg(data.message || "Error registering patient");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setResponseMsg("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!savedPatient) {
      return;
    }

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
    <div className="app-page patient-registration-page">
      <div className="page-orb page-orb-one" />
      <div className="page-orb page-orb-two" />

      <div className="page-card page-accent mx-auto w-full max-w-7xl overflow-hidden rounded-[2rem] p-4 sm:p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)] lg:items-start">
          <div className="space-y-5">
            <span className="glow-badge">
              <Sparkles className="h-4 w-4" />
              Smart patient intake
            </span>
            <div className="max-w-3xl">
              <h1 className="display-title text-4xl leading-tight text-slate-950 sm:text-5xl">
                Patient Registration
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                A calmer, clearer intake screen for your front desk. Add patient
                details, attach lab tests, and review billing without jumping
                between dense forms.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-2">
            <StatCard
              label="Selected Tests"
              value={selectedTests.length.toString().padStart(2, "0")}
              toneClass="metric-warm"
            />
            <StatCard
              label="Estimated Bill"
              value={`Rs. ${totalAmount}`}
              toneClass="metric-cool"
            />
            <StatCard
              label="Sample Needed"
              value={sampleRequired ? "Yes" : "No"}
              toneClass="metric-soft"
            />
          </div>
        </div>

        <form
          className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]"
          onSubmit={handleSubmit}
        >
          <div className="space-y-6">
            <section className="section-card">
              <SectionHeading
                icon={<UserRound className="h-5 w-5" />}
                title="Patient Profile"
                description="Capture the main identity and contact information in a format that stays easy to scan."
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FieldShell
                  icon={<UserRound className="h-4 w-4" />}
                  label="Patient Name"
                >
                  <Input
                    type="text"
                    name="patientname"
                    placeholder="Enter patient full name"
                    value={form.patientname}
                    onChange={handleFormChange}
                  />
                </FieldShell>

                <FieldShell
                  icon={<HeartPulse className="h-4 w-4" />}
                  label="Father / Husband Name"
                >
                  <Input
                    type="text"
                    name="fatherOrHusbandName"
                    placeholder="Family reference name"
                    value={form.fatherOrHusbandName}
                    onChange={handleFormChange}
                  />
                </FieldShell>

                <FieldShell
                  icon={<ShieldPlus className="h-4 w-4" />}
                  label="CNIC"
                >
                  <Input
                    type="text"
                    name="cnic"
                    placeholder="xxxxx-xxxxxxx-x"
                    value={form.cnic}
                    onChange={handleFormChange}
                  />
                </FieldShell>

                <FieldShell
                  icon={<Phone className="h-4 w-4" />}
                  label="Mobile Number"
                >
                  <Input
                    type="tel"
                    name="patientMobile"
                    placeholder="03xx-xxxxxxx"
                    value={form.patientMobile}
                    onChange={handleFormChange}
                  />
                </FieldShell>

                <FieldShell
                  icon={<Mail className="h-4 w-4" />}
                  label="Email Address"
                  hint="Optional but useful for digital communication."
                >
                  <Input
                    type="email"
                    name="patientEmail"
                    placeholder="patient@example.com"
                    value={form.patientEmail}
                    onChange={handleFormChange}
                  />
                </FieldShell>

                <FieldShell
                  icon={<MapPin className="h-4 w-4" />}
                  label="Patient Address"
                >
                  <Input
                    type="text"
                    name="patientAddress"
                    placeholder="Street, city, area"
                    value={form.patientAddress}
                    onChange={handleFormChange}
                  />
                </FieldShell>
              </div>
            </section>

            <section className="section-card">
              <SectionHeading
                icon={<TestTube2 className="h-5 w-5" />}
                title="Test Selection"
                description="Search with either a test code or a name, then build a clear billable list for the patient."
              />

              <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-4 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
                <div className="flex flex-col gap-3 lg:flex-row">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      className="pl-11"
                      placeholder="Search by test code or name"
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTest();
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    className="rounded-2xl bg-[linear-gradient(135deg,var(--brand),#f39b6d)] px-5 py-3 text-white hover:bg-[linear-gradient(135deg,#cf5a37,#eb8f5b)]"
                    onClick={handleAddTest}
                    disabled={testsLoading}
                  >
                    <BadgePlus className="h-4 w-4" />
                    Add Test
                  </Button>
                </div>

                {testsLoading ? (
                  <div className="mt-4 space-y-3">
                    <div className="shimmer h-14 w-full rounded-2xl" />
                    <div className="shimmer h-14 w-2/3 rounded-2xl" />
                  </div>
                ) : null}

                {!testsLoading && matchedTest ? (
                  <div className="highlight-panel mt-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <span className="mini-pill">
                          <Beaker className="h-3.5 w-3.5" />
                          Best match
                        </span>
                        <h4 className="text-lg font-black text-slate-900">
                          {matchedTest.name}
                        </h4>
                        <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                          <span className="mini-pill mini-pill-muted">
                            Code: {matchedTest.code}
                          </span>
                          <span className="mini-pill mini-pill-muted">
                            Sample: {matchedTest.sample}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
                          Price
                        </p>
                        <p className="mt-2 text-2xl font-black text-slate-900">
                          Rs. {matchedTest.price}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {!testsLoading && normalizedTestInput && suggestedTests.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                      Matching suggestions
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {suggestedTests.map((test) => (
                        <button
                          key={test.code}
                          type="button"
                          className="group rounded-[1.25rem] border border-white/70 bg-white/85 p-4 text-left shadow-[0_14px_35px_rgba(15,23,42,0.05)] transition-transform duration-200 hover:-translate-y-0.5"
                          onClick={() => handleAddSpecificTest(test)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-slate-900">
                                {test.name}
                              </p>
                              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                                {test.code}
                              </p>
                            </div>
                            <span className="mini-pill mini-pill-muted group-hover:border-[var(--brand)] group-hover:text-[var(--brand)]">
                              Rs. {test.price}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {!testsLoading && normalizedTestInput && suggestedTests.length === 0 ? (
                  <p className="mt-4 text-sm font-medium text-rose-600">
                    No test found for this code or name.
                  </p>
                ) : null}

                {!testsLoading && availableTests.length === 0 ? (
                  <p className="mt-4 text-sm font-medium text-rose-600">
                    No tests are configured in the database yet.
                  </p>
                ) : null}
              </div>

              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="text-sm font-black uppercase tracking-[0.22em] text-slate-500">
                    Selected tests
                  </h4>
                  <span className="mini-pill mini-pill-muted">
                    {selectedTests.length} item
                    {selectedTests.length === 1 ? "" : "s"}
                  </span>
                </div>

                {selectedTests.length > 0 ? (
                  <div className="grid gap-3 lg:grid-cols-2">
                    {selectedTests.map((test) => (
                      <div key={test.code} className="selected-test-card">
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <span className="mini-pill">{test.code}</span>
                            <span className="mini-pill mini-pill-muted">
                              {test.sample}
                            </span>
                          </div>
                          <h5 className="mt-3 text-base font-black text-slate-900">
                            {test.name}
                          </h5>
                          <p className="mt-2 text-sm font-semibold text-slate-600">
                            Rs. {test.price}
                          </p>
                        </div>

                        <Button
                          type="button"
                          className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-600 shadow-none hover:bg-rose-100"
                          onClick={() => handleRemoveTest(test.code)}
                        >
                          <X className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Activity className="h-5 w-5 text-[var(--brand-deep)]" />
                    <p className="text-sm leading-6 text-slate-600">
                      No tests selected yet. Search by test code or name to start
                      building the lab request.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6 xl:sticky xl:top-6">
            <section className="section-card">
              <SectionHeading
                icon={<Stethoscope className="h-5 w-5" />}
                title="Medical Details"
                description="Complete the clinical context so billing and sample collection stay aligned."
              />

              <div className="grid gap-4">
                <FieldShell
                  icon={<HeartPulse className="h-4 w-4" />}
                  label="Age"
                  hint="Use the selector to switch between years, months, or days."
                >
                  <div className="grid gap-3 sm:grid-cols-[1fr_170px]">
                    <Input
                      name="pateintAge"
                      type="number"
                      placeholder="Patient age"
                      value={form.pateintAge}
                      onChange={handleFormChange}
                    />
                    <select
                      name="years_month_day"
                      value={form.years_month_day}
                      onChange={handleFormChange}
                      className="soft-input px-4 py-3"
                    >
                      <option value="years">Years</option>
                      <option value="months">Months</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                </FieldShell>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldShell
                    icon={<UserRound className="h-4 w-4" />}
                    label="Gender"
                  >
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleFormChange}
                      className="soft-input px-4 py-3"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </FieldShell>

                  <FieldShell
                    icon={<Beaker className="h-4 w-4" />}
                    label="Blood Group"
                  >
                    <Input
                      type="text"
                      name="bloodGroup"
                      placeholder="A+, O-, B+"
                      value={form.bloodGroup}
                      onChange={handleFormChange}
                    />
                  </FieldShell>
                </div>

                <FieldShell
                  icon={<Stethoscope className="h-4 w-4" />}
                  label="Doctor Name"
                >
                  <Input
                    type="text"
                    name="doctorName"
                    placeholder="Referring doctor"
                    value={form.doctorName}
                    onChange={handleFormChange}
                  />
                </FieldShell>
              </div>
            </section>

            <section className="section-card">
              <SectionHeading
                icon={<CreditCard className="h-5 w-5" />}
                title="Billing Summary"
                description="Review the final amount and sample requirement before saving the patient record."
              />

              <div className="space-y-3">
                <div className="summary-row">
                  <span>Total tests</span>
                  <strong>{selectedTests.length}</strong>
                </div>
                <div className="summary-row">
                  <span>Sample required</span>
                  <strong>{sampleRequired ? "Yes" : "No"}</strong>
                </div>
                <div className="summary-row summary-row-total">
                  <span>Total amount</span>
                  <strong>Rs. {totalAmount}</strong>
                </div>
              </div>

              {responseMsg ? (
                <div className={`feedback-banner mt-5 ${feedbackTone}`}>
                  {responseMsg}
                </div>
              ) : null}

              <Button
                type="submit"
                className="mt-5 w-full rounded-[1.4rem] bg-[linear-gradient(135deg,var(--brand-deep),#2ba29a)] px-6 py-4 text-white hover:bg-[linear-gradient(135deg,#0d6e68,#21948b)]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving patient...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Save Patient Record
                  </>
                )}
              </Button>
            </section>
          </div>
        </form>

        {showModal && savedPatient ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md">
            <div className="page-card relative w-full max-w-2xl rounded-[2rem] p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="glow-badge">
                    <Sparkles className="h-4 w-4" />
                    Registration complete
                  </span>
                  <h3 className="mt-4 text-2xl font-black text-slate-950">
                    Patient Details
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Review the saved record, then print or send it from here.
                  </p>
                </div>

                <Button
                  type="button"
                  className="rounded-2xl border border-slate-200 bg-white/85 px-3 py-2 text-slate-700 shadow-none hover:bg-slate-100"
                  onClick={() => setShowModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div
                id="print-area"
                className="mt-6 grid gap-3 rounded-[1.6rem] border border-white/70 bg-white/75 p-5 sm:grid-cols-2"
              >
                <div className="detail-tile">
                  <span>Patient ID</span>
                  <strong>{savedPatient.patientId}</strong>
                </div>
                <div className="detail-tile">
                  <span>Name</span>
                  <strong>{savedPatient.patientname}</strong>
                </div>
                <div className="detail-tile">
                  <span>Father / Husband</span>
                  <strong>{savedPatient.fatherOrHusbandName}</strong>
                </div>
                <div className="detail-tile">
                  <span>Age</span>
                  <strong>
                    {savedPatient.pateintAge} {savedPatient.years_month_day}
                  </strong>
                </div>
                <div className="detail-tile">
                  <span>Gender</span>
                  <strong>{savedPatient.gender}</strong>
                </div>
                <div className="detail-tile">
                  <span>Blood Group</span>
                  <strong>{savedPatient.bloodGroup || "Not provided"}</strong>
                </div>
                <div className="detail-tile">
                  <span>Mobile</span>
                  <strong>{savedPatient.patientMobile}</strong>
                </div>
                <div className="detail-tile">
                  <span>Email</span>
                  <strong>{savedPatient.patientEmail || "Not provided"}</strong>
                </div>
                <div className="detail-tile sm:col-span-2">
                  <span>Address</span>
                  <strong>{savedPatient.patientAddress || "Not provided"}</strong>
                </div>
                <div className="detail-tile">
                  <span>Doctor</span>
                  <strong>{savedPatient.doctorName || "Not provided"}</strong>
                </div>
                <div className="detail-tile">
                  <span>Total Amount</span>
                  <strong>Rs. {savedPatient.payAmount}</strong>
                </div>
                <div className="detail-tile sm:col-span-2">
                  <span>Tests</span>
                  <strong>{savedPatient.testName}</strong>
                </div>
                <div className="detail-tile sm:col-span-2">
                  <span>Sample Required</span>
                  <strong>{savedPatient.sampleRequiered ? "Yes" : "No"}</strong>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  className="rounded-2xl bg-[linear-gradient(135deg,var(--brand),#f39b6d)] px-5 py-3 text-white hover:bg-[linear-gradient(135deg,#cf5a37,#eb8f5b)]"
                  onClick={handlePrint}
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button
                  type="button"
                  className="rounded-2xl bg-[linear-gradient(135deg,var(--brand-deep),#2ba29a)] px-5 py-3 text-white hover:bg-[linear-gradient(135deg,#0d6e68,#21948b)]"
                  onClick={handleSend}
                >
                  <SendHorizonal className="h-4 w-4" />
                  Send
                </Button>
                <Button
                  type="button"
                  className="rounded-2xl border border-slate-200 bg-white/85 px-5 py-3 text-slate-700 shadow-none hover:bg-slate-100"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PatientRegistration;
