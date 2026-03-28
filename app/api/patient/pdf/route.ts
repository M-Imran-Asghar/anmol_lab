import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import jwt from "jsonwebtoken";
import PatientRegistration from "@/models/patientRegistration";
import { connectionToDB } from "@/lib/db";

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

export async function GET(request: NextRequest) {
  try {
    await connectionToDB();

    const token = request.cookies.get("token")?.value;
    const tokenVerification = verifyToken(token);
    if (!tokenVerification.valid) {
      return NextResponse.json({ message: tokenVerification.message }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const patientId = Number(searchParams.get("patientId"));
    const disposition = searchParams.get("disposition") === "attachment" ? "attachment" : "inline";

    if (!patientId) {
      return NextResponse.json({ message: "Patient ID is required" }, { status: 400 });
    }

    const patient = await PatientRegistration.findOne({ patientId });

    if (!patient) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }

    if (!patient.reportPDF) {
      return NextResponse.json({ message: "No report available for this patient" }, { status: 404 });
    }

    const reportFileName =
      patient.reportFileName ||
      `patient_${patient.patientId}_${String(patient.patientname || "report")
        .replace(/[^a-zA-Z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "")}_report.pdf`;

    const pdfRelativePath = String(patient.reportPDF).replace(/^\/+/, "");
    const pdfAbsolutePath = path.join(process.cwd(), "public", pdfRelativePath);
    const reportsRoot = path.join(process.cwd(), "public", "reports");
    const resolvedPdfPath = path.resolve(pdfAbsolutePath);
    const resolvedReportsRoot = path.resolve(reportsRoot);

    if (!resolvedPdfPath.startsWith(resolvedReportsRoot)) {
      return NextResponse.json({ message: "Invalid report path" }, { status: 400 });
    }

    const pdfBuffer = await fs.readFile(resolvedPdfPath);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(pdfBuffer.length),
        "Content-Disposition": `${disposition}; filename="${reportFileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error serving patient PDF:", error);
    return NextResponse.json(
      {
        message: "Error serving patient PDF",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
