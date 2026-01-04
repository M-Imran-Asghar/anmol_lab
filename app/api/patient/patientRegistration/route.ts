import { NextRequest, NextResponse } from "next/server";
import PatientRegistration from "@/models/patientRegistration";
import { connectionToDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import Counter from "@/models/counter";

export async function POST(request: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;

  try {
    // 1️⃣ Connect to DB
    await connectionToDB();

    // 2️⃣ Verify JWT Token
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized: Token missing" }, { status: 401 });
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
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
    return NextResponse.json(
      { message: "Error while patient registration", error },
      { status: 500 }
    );
  }
}

// Fetch patients with search and filtering
export async function GET(request: NextRequest) {
  try {
    await connectionToDB();
    
    // Get search parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const name = searchParams.get('name') || '';
    const cnic = searchParams.get('cnic') || '';
    const email = searchParams.get('email') || '';
    const mobile = searchParams.get('mobile') || '';
    const doctor = searchParams.get('doctor') || '';
    const status = searchParams.get('status') || ''; // Add status filter parameter
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const query: any = {};
    const andConditions: any[] = [];
    
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
    
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { message: "Error while fetching patients", error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Update patient details including test results
export async function PUT(request: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;

  try {
    // 1️⃣ Connect to DB
    await connectionToDB();

    // 2️⃣ Verify JWT Token
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized: Token missing" }, { status: 401 });
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
    }

    // 3️⃣ Parse request body
    const {
      patientId,
      testResults, // Array of test results
      testResult,
      referenceRange,
      resultNotes,
      // You can include other editable fields if needed
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

    // 4️⃣ Validate required fields for test results
    if (!patientId) {
      return NextResponse.json(
        { message: "Patient ID is required" },
        { status: 400 }
      );
    }

    // 5️⃣ Prepare update data
    const updateData: any = {
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

    // 6️⃣ Check if test results are being added
    const hasTestResults = testResults && Array.isArray(testResults) && testResults.length > 0;
    const hasLegacyTestResult = testResult !== undefined || referenceRange !== undefined;
    
    if (hasTestResults) {
      // Add multiple test results
      updateData.testResults = testResults.map(test => ({
        testName: test.testName,
        result: test.result,
        referenceRange: test.referenceRange,
        notes: test.notes || "",
        date: new Date()
      }));
      updateData.status = "Verified";
    } else if (hasLegacyTestResult) {
      // Handle legacy single test result
      updateData.testResult = testResult;
      updateData.referenceRange = referenceRange;
      updateData.resultNotes = resultNotes || "";
      updateData.resultDate = new Date();
      updateData.status = "Verified";
    }

    // 7️⃣ Update patient in database
    const updatedPatient = await PatientRegistration.findOneAndUpdate(
      { patientId: Number(patientId) },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      return NextResponse.json(
        { message: "Patient not found" },
        { status: 404 }
      );
    }

    // 8️⃣ Return success response
    return NextResponse.json(
      {
        message: hasTestResults || hasLegacyTestResult
          ? "Patient test results added and status updated to Verified" 
          : "Patient details updated successfully",
        patient: updatedPatient
      },
      { status: 200 }
    );

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

// Optional: Get single patient by ID
export async function GET_BY_ID(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectionToDB();
    
    const patient = await PatientRegistration.findOne({ 
      patientId: Number(params.id) 
    });
    
    if (!patient) {
      return NextResponse.json(
        { message: "Patient not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        message: "Patient fetched successfully",
        patient
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      { message: "Error while fetching patient", error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Delete patient by ID
export async function DELETE(request: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;

  try {
    await connectionToDB();

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized: Token missing" }, { status: 401 });
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
    }

    const { patientId } = await request.json();

    if (!patientId) {
      return NextResponse.json({ message: "Patient ID is required" }, { status: 400 });
    }

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
    return NextResponse.json(
      { message: "Error while deleting patient", error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}