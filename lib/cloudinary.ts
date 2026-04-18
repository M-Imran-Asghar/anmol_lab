import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";
import { PatientData } from "./pdfGenerator";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const hasCloudinaryConfig = Boolean(cloudName && apiKey && apiSecret);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

function getCleanName(patient: PatientData): string {
  return patient.patientname
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function getLocalReportPath(fileName: string): string {
  return path.join(process.cwd(), "public", "reports", fileName);
}

export async function uploadPDF(
  buffer: Buffer,
  patient: PatientData,
): Promise<string> {
  const cleanName = getCleanName(patient);
  const fileName = `patient_${patient.patientId}_${cleanName}_report.pdf`;

  if (hasCloudinaryConfig) {
    const base64 = buffer.toString("base64");
    const dataUri = `data:application/pdf;base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "anmol_lab_reports",
      resource_type: "raw",
      public_id: fileName.replace(/\.pdf$/i, ""),
      format: "pdf",
      overwrite: true,
      invalidate: true,
    });

    return result.secure_url;
  }

  await fs.mkdir(path.dirname(getLocalReportPath(fileName)), { recursive: true });
  await fs.writeFile(getLocalReportPath(fileName), buffer);
  return `/reports/${fileName}`;
}

export async function deletePDF(fileRef: string): Promise<void> {
  if (!fileRef) {
    return;
  }

  if (hasCloudinaryConfig && /^https?:\/\//i.test(fileRef)) {
    const url = new URL(fileRef);
    const uploadMarker = "/upload/";
    const uploadIndex = url.pathname.indexOf(uploadMarker);

    if (uploadIndex !== -1) {
      const publicPath = url.pathname
        .slice(uploadIndex + uploadMarker.length)
        .replace(/^v\d+\//, "")
        .replace(/\.[^.]+$/, "");

      await cloudinary.uploader
        .destroy(publicPath, { resource_type: "raw", invalidate: true })
        .catch(() => {});
    }

    return;
  }

  const filePath = getLocalReportPath(fileRef.replace(/^\/reports\//, ""));
  await fs.unlink(filePath).catch(() => {});
}
