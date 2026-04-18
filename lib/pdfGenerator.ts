import PDFDocument from "pdfkit";

export interface PatientData {
  patientId: number;
  patientname: string;
  fatherOrHusbandName?: string;
  pateintAge: number;
  years_month_day: string;
  cnic: number;
  bloodGroup?: string;
  gender: string;
  patientEmail?: string;
  patientMobile: number;
  doctorName: string;
  patientAddress?: string;
  testName?: string | string[];
  testResults?: Array<{
    parentTestName?: string;
    testName: string;
    unit?: string;
    result: string;
    referenceRange?: string;
    notes?: string;
    date?: Date;
  }>;
  receptionsName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AdvancedPDFGenerator {
  private doc: PDFKit.PDFDocument;

  constructor() {
    this.doc = new PDFDocument({
      margin: 50,
      size: "A4",
      info: {
        Title: "Laboratory Report",
        Author: "Clinical Lab",
        Subject: "Patient Test Results",
        Keywords: "medical, lab, test, report",
      },
    });
  }

  async generateReport(patient: PatientData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      this.doc.on("data", (chunk) => chunks.push(chunk));
      this.doc.on("end", () => resolve(Buffer.concat(chunks)));
      this.doc.on("error", reject);

      try {
        this.createHeader();
        this.createPatientDetails(patient);
        this.createTestResults(patient);
        this.createFooter();
        this.doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private createHeader(): void {
    this.doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("CLINICAL DIAGNOSTIC LABORATORY", { align: "center" })
      .moveDown(0.5);

    this.doc
      .fontSize(10)
      .font("Helvetica")
      .text("123 Medical Street, City, Country", { align: "center" })
      .text("Phone: +1 234 567 8900 | Email: info@lab.com", {
        align: "center",
      })
      .moveDown(1);

    this.doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("LABORATORY TEST REPORT", { align: "center", underline: true })
      .moveDown(2);

    this.doc
      .moveTo(50, this.doc.y)
      .lineTo(550, this.doc.y)
      .lineWidth(2)
      .stroke()
      .moveDown(1);
  }

  private createPatientDetails(patient: PatientData): void {
    this.doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#2c3e50")
      .text("PATIENT INFORMATION", { underline: true })
      .moveDown(0.5);

    const details = [
      ["Patient ID", `: ${patient.patientId}`],
      ["Full Name", `: ${patient.patientname}`],
      ["Father/Husband", `: ${patient.fatherOrHusbandName || "N/A"}`],
      [
        "Age/Gender",
        `: ${patient.pateintAge} ${patient.years_month_day} / ${patient.gender}`,
      ],
      ["Blood Group", `: ${patient.bloodGroup || "N/A"}`],
      ["CNIC", `: ${patient.cnic || "N/A"}`],
      [
        "Contact",
        `: ${patient.patientMobile} ${patient.patientEmail ? `| ${patient.patientEmail}` : ""}`,
      ],
      ["Address", `: ${patient.patientAddress || "N/A"}`],
      ["Referring Doctor", `: ${patient.doctorName || "N/A"}`],
      ["Test(s)", `: ${patient.testName || "N/A"}`],
      ["Report Date", `: ${new Date(patient.updatedAt).toLocaleDateString()}`],
      [
        "Collection Date",
        `: ${new Date(patient.createdAt).toLocaleDateString()}`,
      ],
    ];

    this.doc.fontSize(10).font("Helvetica").fillColor("black");

    let y = this.doc.y;
    details.forEach(([label, value]) => {
      this.doc.text(label, 60, y);
      this.doc.text(value, 200, y);
      y += 20;
    });

    this.doc.y = y + 10;

    this.doc
      .moveTo(50, this.doc.y)
      .lineTo(550, this.doc.y)
      .lineWidth(1)
      .stroke()
      .moveDown(1.5);
  }

  private createTestResults(patient: PatientData): void {
    this.doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#2c3e50")
      .text("TEST RESULTS", { underline: true })
      .moveDown(0.5);

    if (patient.testResults && patient.testResults.length > 0) {
      const headers = ["Test Name", "Unit", "Result", "Reference Range", "Notes"];
      const columnWidths = [150, 70, 90, 120, 120];
      const rowHeight = 25;

      this.doc.fontSize(9).font("Helvetica-Bold").fillColor("white");
      let x = 50;
      headers.forEach((header, i) => {
        this.doc
          .rect(x, this.doc.y, columnWidths[i], rowHeight)
          .fillAndStroke("#3498db", "#3498db");
        this.doc.text(header, x + 5, this.doc.y + 8, {
          width: columnWidths[i] - 10,
          align: "left",
        });
        x += columnWidths[i];
      });

      this.doc.y += rowHeight;

      this.doc.fontSize(9).font("Helvetica").fillColor("black");
      patient.testResults.forEach((test, index) => {
        x = 50;
        const bgColor = index % 2 === 0 ? "#f8f9fa" : "white";

        [
          test.testName,
          test.unit || "",
          test.result,
          test.referenceRange || "",
          test.notes || "",
        ].forEach((cell, i) => {
          this.doc
            .rect(x, this.doc.y, columnWidths[i], rowHeight)
            .fillAndStroke(bgColor, "#ddd");
          this.doc.fillColor("black").text(cell, x + 5, this.doc.y + 8, {
            width: columnWidths[i] - 10,
            align: "left",
          });
          x += columnWidths[i];
        });

        this.doc.y += rowHeight;
      });
    } else {
      this.doc
        .fontSize(10)
        .font("Helvetica")
        .text("No test results available.", { align: "center" });
    }

    this.doc.moveDown(2);

    this.doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("REMARKS:", { underline: true })
      .moveDown(0.5);

    this.doc
      .fontSize(9)
      .font("Helvetica-Oblique")
      .fillColor("#7f8c8d")
      .text(
        "This report is computer generated and should be interpreted by a qualified medical professional.",
        60,
        this.doc.y,
        { width: 480 },
      )
      .moveDown(0.3)
      .text(
        "For any queries regarding this report, please contact the laboratory.",
        60,
        this.doc.y,
        { width: 480 },
      )
      .moveDown(1);
  }

  private createFooter(): void {
    const pageHeight = 842;
    const footerY = pageHeight - 50;

    this.doc
      .fontSize(8)
      .font("Helvetica-Oblique")
      .fillColor("#95a5a6")
      .text(
        `Report ID: ${Date.now()} | Generated on: ${new Date().toLocaleString()}`,
        50,
        footerY,
        { align: "center", width: 500 },
      );

    const pageNumber = this.doc.bufferedPageRange().count;
    this.doc.text(`Page ${pageNumber}`, 50, footerY + 15, { align: "center" });
  }
}
