import { PatientData } from './pdfGenerator';
import fs from 'fs/promises';
import path from 'path';

export async function uploadPDF(buffer: Buffer, patient: PatientData): Promise<string> {
  const cleanName = patient.patientname.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  const fileName = `patient_${patient.patientId}_${cleanName}_report.pdf`;
  const filePath = path.join(process.cwd(), 'public', 'reports', fileName);
  
  await fs.writeFile(filePath, buffer);
  return `/reports/${fileName}`;
}

export async function deletePDF(fileName: string): Promise<void> {
  const filePath = path.join(process.cwd(), 'public', 'reports', fileName.replace('/reports/', ''));
  await fs.unlink(filePath).catch(() => {});
}
