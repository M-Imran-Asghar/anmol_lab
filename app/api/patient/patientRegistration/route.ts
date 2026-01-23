import { NextRequest, NextResponse } from "next/server";
import PatientRegistration from "@/models/patientRegistration";
import { connectionToDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import Counter from "@/models/counter";
import { generatePatientReport } from "@/lib/puppeteerGenerator";
import { uploadPDF } from "@/lib/cloudinary";

// Define interfaces for better type safety
interface QueryConditions {
  [key: string]: unknown;
  $or?: Array<Record<string, unknown>>;
  $and?: QueryConditions[];
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  patientname?: { $regex: string; $options: string };
  cnic?: { $regex: string; $options: string };
  patientEmail?: { $regex: string; $options: string };
  doctorName?: { $regex: string; $options: string };
  patientMobile?: { $regex: string; $options: string };
  status?: string | { $exists: boolean } | null;
}

interface TestResult {
  testName: string;
  result: string;
  referenceRange: string;
  notes: string;
  date: Date;
}

interface UpdateData {
  updatedAt: Date;
  receptionsName?: string;
  patientname?: string;
  fatherOrHusbandName?: string;
  pateintAge?: number;
  years_month_day?: string;
  cnic?: number;
  bloodGroup?: string;
  gender?: string;
  patientEmail?: string;
  patientMobile?: number;
  doctorName?: string;
  payAmount?: number;
  sampleReceived?: boolean;
  patientAddress?: string;
  sampleRequiered?: boolean;
  testName?: string;
  testResults?: TestResult[];
  testResult?: string;
  referenceRange?: string;
  resultNotes?: string;
  resultDate?: Date;
  status?: string;
  reportPDF?: string;
  reportFileName?: string;
}

// Helper function to verify JWT token
function verifyToken(token: string | undefined): { valid: boolean; message?: string } {
  const JWT_SECRET = process.env.JWT_SECRET!;
  
  if (!token) {
    return { valid: false, message: "Unauthorized: Token missing" };
  }
  
  try {
    jwt.verify(token, JWT_SECRET);
    return { valid: true };
  } catch {
    return { valid: false, message: "Invalid or expired token" };
  }
}

// POST - Create new patient
export async function POST(request: NextRequest) {
  try {
    // 1️⃣ Connect to DB
    await connectionToDB();

    // 2️⃣ Verify JWT Token
    const token = request.cookies.get("token")?.value;
    const tokenVerification = verifyToken(token);
    if (!tokenVerification.valid) {
      return NextResponse.json({ message: tokenVerification.message }, { status: 401 });
    }

    // 3️⃣ Parse request body
    const {
      receptionsName,
      patientname,
      fatherOrHusbandName,
      pateintAge,
      years_month_day,
      cnic,
      bloodGroup,
      gender,
      patientEmail,
      patientMobile,
      doctorName,
      payAmount,
      sampleReceived,
      patientAddress,
      sampleRequiered,
      testName
    } = await request.json();

    // 4️⃣ Auto-increment patient ID
    const counter = await Counter.findOneAndUpdate(
      { _id: "patientId" },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    const patientId = counter.sequence_value;

    // 5️⃣ Create patient in DB
    const patient = await PatientRegistration.create({
      patientId,
      receptionsName,
      patientname,
      fatherOrHusbandName,
      pateintAge: Number(pateintAge),
      years_month_day,
      cnic: Number(cnic),
      bloodGroup,
      gender,
      patientEmail,
      patientMobile: Number(patientMobile),
      doctorName,
      payAmount: Number(payAmount),
      sampleReceived,
      patientAddress,
      sampleRequiered,
      testName,
      status: "Pending" // Set initial status as Pending
    });

    // 6️⃣ Respond with patient info
    return NextResponse.json(
      {
        message: "Patient registered successfully",
        patientId: patient.patientId,
        patient
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error while patient registration:", error);
    return NextResponse.json(
      { 
        message: "Error while patient registration", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// GET - Fetch patients with search/filtering or download/view PDF
export async function GET(request: NextRequest) {
  try {
    await connectionToDB();

    // 1️⃣ Verify JWT Token
    const token = request.cookies.get("token")?.value;
    const tokenVerification = verifyToken(token);
    if (!tokenVerification.valid) {
      return NextResponse.json({ message: tokenVerification.message }, { status: 401 });
    }

    // 2️⃣ Get search parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action'); // 'download' or 'view'
    const patientId = searchParams.get('patientId');
    
    // 3️⃣ Handle PDF download/view requests
    if ((action === 'download' || action === 'view') && patientId) {
      return await handlePDFRequest(Number(patientId), action);
    }

    // 4️⃣ Handle patient search/filtering requests
    return await handlePatientSearch(request);

  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { 
        message: "Error processing request", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// PUT - Update patient details and generate PDF
export async function PUT(request: NextRequest) {
  try {
    // 1️⃣ Connect to DB
    await connectionToDB();

    // 2️⃣ Verify JWT Token
    const token = request.cookies.get("token")?.value;
    const tokenVerification = verifyToken(token);
    if (!tokenVerification.valid) {
      return NextResponse.json({ message: tokenVerification.message }, { status: 401 });
    }

    // 3️⃣ Parse request body
    const {
      patientId,
      testResults,
      testResult,
      referenceRange,
      resultNotes,
      receptionsName,
      patientname,
      fatherOrHusbandName,
      pateintAge,
      years_month_day,
      cnic,
      bloodGroup,
      gender,
      patientEmail,
      patientMobile,
      doctorName,
      payAmount,
      sampleReceived,
      patientAddress,
      sampleRequiered,
      testName,
      generatePDF = true // New flag to control PDF generation
    } = await request.json();

    // 4️⃣ Validate required fields
    if (!patientId) {
      return NextResponse.json(
        { message: "Patient ID is required" },
        { status: 400 }
      );
    }

    // 5️⃣ Get current patient data
    const currentPatient = await PatientRegistration.findOne({ 
      patientId: Number(patientId) 
    });

    if (!currentPatient) {
      return NextResponse.json(
        { message: "Patient not found" },
        { status: 404 }
      );
    }

    // 6️⃣ Prepare update data
    const updateData: UpdateData = {
      updatedAt: new Date(),
      // Include other fields if they are provided
      ...(receptionsName !== undefined && { receptionsName }),
      ...(patientname !== undefined && { patientname }),
      ...(fatherOrHusbandName !== undefined && { fatherOrHusbandName }),
      ...(pateintAge !== undefined && { pateintAge: Number(pateintAge) }),
      ...(years_month_day !== undefined && { years_month_day }),
      ...(cnic !== undefined && { cnic: Number(cnic) }),
      ...(bloodGroup !== undefined && { bloodGroup }),
      ...(gender !== undefined && { gender }),
      ...(patientEmail !== undefined && { patientEmail }),
      ...(patientMobile !== undefined && { patientMobile: Number(patientMobile) }),
      ...(doctorName !== undefined && { doctorName }),
      ...(payAmount !== undefined && { payAmount: Number(payAmount) }),
      ...(sampleReceived !== undefined && { sampleReceived }),
      ...(patientAddress !== undefined && { patientAddress }),
      ...(sampleRequiered !== undefined && { sampleRequiered }),
      ...(testName !== undefined && { testName }),
    };

    // 7️⃣ Check if test results are being added
    const hasTestResults = testResults && Array.isArray(testResults) && testResults.length > 0;
    const hasLegacyTestResult = testResult !== undefined || referenceRange !== undefined;
    let pdfInfo = null;
    
    if (hasTestResults) {
      // Add multiple test results
      updateData.testResults = testResults.map((test: TestResult) => ({
        testName: test.testName,
        result: test.result,
        referenceRange: test.referenceRange,
        notes: test.notes || "",
        date: new Date()
      }));
      updateData.status = "Verified";
      
      // Generate PDF if requested
      if (generatePDF) {
        try {
          // Prepare patient data for PDF
          const patientData = {
            ...currentPatient.toObject(),
            ...updateData,
            patientId: currentPatient.patientId,
            createdAt: currentPatient.createdAt,
            updatedAt: new Date()
          };

          // Generate PDF buffer
          const pdfBuffer = await generatePatientReport(patientData);
          
          // Upload to Cloudinary
          const pdfUrl = await uploadPDF(pdfBuffer, patientData);
          
          // Get clean filename
          const cleanName = patientData.patientname
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
          
          const fileName = `patient_${patientData.patientId}_${cleanName}_report.pdf`;
          
          // Save PDF info to update data
          updateData.reportPDF = pdfUrl;
          updateData.reportFileName = fileName;
          
          pdfInfo = {
            downloadUrl: pdfUrl,
            fileName: fileName,
            generatedAt: new Date().toISOString()
          };
          
        } catch (pdfError) {
          console.error('PDF generation/upload failed:', pdfError);
          // Continue without PDF
        }
      }
      
    } else if (hasLegacyTestResult) {
      // Handle legacy single test result
      updateData.testResult = testResult;
      updateData.referenceRange = referenceRange;
      updateData.resultNotes = resultNotes || "";
      updateData.resultDate = new Date();
      updateData.status = "Verified";
    }

    // 8️⃣ Update patient in database
    const updatedPatient = await PatientRegistration.findOneAndUpdate(
      { patientId: Number(patientId) },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      return NextResponse.json(
        { message: "Patient update failed" },
        { status: 500 }
      );
    }

    // 9️⃣ Prepare response
    const response: any = {
      message: hasTestResults || hasLegacyTestResult
        ? "Patient test results added and status updated to Verified" 
        : "Patient details updated successfully",
      patient: updatedPatient.toObject()
    };

    if (pdfInfo) {
      response.pdfInfo = pdfInfo;
      response.message += " - PDF report generated and uploaded";
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json(
      { 
        message: "Error while updating patient", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove patient
export async function DELETE(request: NextRequest) {
  try {
    await connectionToDB();

    // 1️⃣ Verify JWT Token
    const token = request.cookies.get("token")?.value;
    const tokenVerification = verifyToken(token);
    if (!tokenVerification.valid) {
      return NextResponse.json({ message: tokenVerification.message }, { status: 401 });
    }

    // 2️⃣ Parse request body
    const { patientId } = await request.json();

    if (!patientId) {
      return NextResponse.json({ message: "Patient ID is required" }, { status: 400 });
    }

    // 3️⃣ Find and delete patient
    const deletedPatient = await PatientRegistration.findOneAndDelete({ 
      patientId: Number(patientId) 
    });

    if (!deletedPatient) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Patient deleted successfully", patientId },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error while deleting patient:", error);
    return NextResponse.json(
      { 
        message: "Error while deleting patient", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// ==================== HELPER FUNCTIONS ====================

// Handle PDF download/view requests
async function handlePDFRequest(patientId: number, action: string): Promise<NextResponse> {
  // Get patient data
  const patient = await PatientRegistration.findOne({ 
    patientId: Number(patientId) 
  });
  
  if (!patient) {
    return NextResponse.json({ 
      message: "Patient not found" 
    }, { status: 404 });
  }

  if (!patient.reportPDF) {
    return NextResponse.json({ 
      message: "No report available for this patient" 
    }, { status: 404 });
  }

  // Generate response based on action
  if (action === 'view') {
    // For viewing, return the Cloudinary URL
    // Cloudinary can display PDFs directly in browser
    return NextResponse.json({
      message: "Report available for viewing",
      viewUrl: patient.reportPDF,
      fileName: patient.reportFileName || `patient_${patientId}_${patient.patientname.replace(/[^a-zA-Z0-9]/g, '_')}_report.pdf`,
      patientName: patient.patientname,
      patientId: patient.patientId,
      reportDate: patient.updatedAt
    }, { status: 200 });
    
  } else if (action === 'download') {
    return NextResponse.json({
      message: "Download URL generated",
      downloadUrl: patient.reportPDF,
      fileName: patient.reportFileName || `patient_${patientId}_${patient.patientname.replace(/[^a-zA-Z0-9]/g, '_')}_report.pdf`,
      patientName: patient.patientname,
      patientId: patient.patientId
    }, { status: 200 });
  }

  return NextResponse.json({ 
    message: "Invalid action specified. Use 'download' or 'view'" 
  }, { status: 400 });
}

// Handle patient search/filtering
async function handlePatientSearch(request: NextRequest): Promise<NextResponse> {
  // Get search parameters from URL
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';
  const name = searchParams.get('name') || '';
  const cnic = searchParams.get('cnic') || '';
  const email = searchParams.get('email') || '';
  const mobile = searchParams.get('mobile') || '';
  const doctor = searchParams.get('doctor') || '';
  const status = searchParams.get('status') || ''; 
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  const query: QueryConditions = {};
  const andConditions: QueryConditions[] = [];
  
  // Filter by status if provided
  if (status.trim()) {
    if (status === 'Pending') {
      andConditions.push({
        $or: [
          { status: 'Pending' },
          { status: { $exists: false } },
          { status: null },
          { status: '' }
        ]
      });
    } else {
      andConditions.push({ status });
    }
  }
  
  // General search across multiple fields
  if (search.trim()) {
    andConditions.push({
      $or: [
        { patientname: { $regex: search, $options: 'i' } },
        { cnic: { $regex: search, $options: 'i' } },
        { patientEmail: { $regex: search, $options: 'i' } },
        { doctorName: { $regex: search, $options: 'i' } },
        { patientMobile: { $regex: search, $options: 'i' } }
      ]
    });
  }
  
  // Individual field filters (more specific)
  if (name.trim()) {
    query.patientname = { $regex: name, $options: 'i' };
  }
  
  if (cnic.trim()) {
    query.cnic = { $regex: cnic, $options: 'i' };
  }
  
  if (email.trim()) {
    query.patientEmail = { $regex: email, $options: 'i' };
  }
  
  if (mobile.trim()) {
    query.patientMobile = { $regex: mobile, $options: 'i' };
  }
  
  if (doctor.trim()) {
    query.doctorName = { $regex: doctor, $options: 'i' };
  }
  
  // Date range filtering
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      query.createdAt.$gte = fromDate;
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      query.createdAt.$lte = toDate;
    }
  }
  
  // Combine all conditions
  if (andConditions.length > 0) {
    query.$and = andConditions;
  }
  
  // Calculate skip for pagination
  const skip = (page - 1) * limit;
  
  // Get total count for pagination
  const total = await PatientRegistration.countDocuments(query);
  
  // Execute query with pagination and sorting
  const patients = await PatientRegistration.find(query)
    .sort({ createdAt: -1 }) // Latest first
    .skip(skip)
    .limit(limit);
  
  return NextResponse.json(
    { 
      message: "Patients fetched successfully",
      patients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    },
    { status: 200 }
  );
}