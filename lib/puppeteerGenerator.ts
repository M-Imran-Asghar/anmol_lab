import puppeteer, { Browser } from "puppeteer";
import { PatientData } from "./pdfGenerator";
import fs from "fs";
import path from "path";

const logoPath = path.join(process.cwd(), "public/logo/appLogo.png");
const logoBase64 = fs.readFileSync(logoPath).toString("base64");
const pdfHeader = path.join(process.cwd(), "public/logo/alflahPdfHeader.png");
const pdfHeaderBase64 = fs.readFileSync(pdfHeader).toString("base64");
const pdfFooter = path.join(process.cwd(), "public/logo/alfahlPdfFooter.png");
const pdfFooterBase64 = fs.readFileSync(pdfFooter).toString("base64");

export async function generatePatientReport(
  patient: PatientData,
): Promise<Buffer> {
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(generateHTMLReport(patient), {
      waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "140px", right: "10mm", bottom: "50px", left: "10mm" }, // Increased top margin for header
    });

    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

function generateHTMLReport(patient: PatientData): string {
  const reportDate = new Date(
    patient.updatedAt || Date.now(),
  ).toLocaleDateString("en-GB");
  const reportTime = new Date(
    patient.updatedAt || Date.now(),
  ).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          size: A4;
          margin: 0;
        }

        body {
          font-family: Arial, sans-serif;
          font-size: 11px;
          color: #000;
          margin: 0;
          padding: 0;
        }

        /* HEADER */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          height: 120px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 10px;
          background: white;
          border-bottom: 2px solid #0066cc;
          z-index: 1000;
          box-sizing: border-box;
        }

        .header-left, .header-right {
          height: 100px;
          display: flex;
          align-items: center;
        }

        .header-left {
          flex: 1;
          justify-content: flex-start;
        }

        .header-right {
          flex: 1;
          justify-content: flex-end;
        }

        .header-img {
          width: 100%;
          height: 100px;
          object-fit: contain;
          max-width: calc(100% - 10px);
        }

        .barcode-section {
          display: flex;
          justify-content: space-between;
          padding: 10px 20px;
          background: #f5f5f5;
          margin-top: 120px; /* Push down for fixed header */
          margin-bottom: 15px;
        }
        
        .barcode-box {
          text-align: center;
        }
        
        .barcode-placeholder {
          background: #000;
          height: 30px;
          width: 150px;
          margin-bottom: 3px;
        }
        
        .patient-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding: 0 20px;
          margin-bottom: 15px;
        }
        
        .info-row {
          display: flex;
          margin-bottom: 5px;
          font-size: 10px;
        }
        
        .info-label {
          font-weight: bold;
          min-width: 100px;
        }
        
        .info-value {
          color: #333;
        }
        
        .report-title {
          background: #0066cc;
          color: white;
          padding: 8px 20px;
          font-weight: bold;
          font-size: 12px;
          margin: 15px 0;
        }
        
        .test-section {
          padding: 0 20px;
          margin-bottom: 20px;
        }
        
        .test-name {
          font-weight: bold;
          margin-bottom: 8px;
          font-size: 11px;
        }
        
        .test-results {
          margin-left: 15px;
        }
        
        .test-item {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px solid #eee;
        }
        
        .test-item span:first-child {
          flex: 2;
        }
        
        .test-item span:nth-child(2) {
          flex: 1;
          text-align: center;
        }
        
        .test-item span:last-child {
          flex: 1;
          text-align: right;
          color: #666;
        }
        
        .notes {
          margin: 10px 0;
          padding: 10px;
          background: #f9f9f9;
          font-size: 9px;
          line-height: 1.4;
        }
        
        /* FOOTER */
        .footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          height: 70;
          background: white;
          z-index: 1000;
          box-sizing: border-box;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .footer-img {
          width: 100%;
          height: full;
          object-fit: cover;
        }
        
        /* Content wrapper to prevent overlap with fixed elements */
        .content-wrapper {
          padding-top: 10px;
          padding-bottom: 50px; /* Space for footer */
        }
          
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="header-left">
          <img 
            class="header-img"
            src="data:image/png;base64,${pdfHeaderBase64}" 
            alt="Al-Falah Header"
          />
        </div>
        <div class="header-right">
          <img 
            class="header-img"
            src="data:image/png;base64,${logoBase64}" 
            alt="Al-Falah Logo"
          />
        </div>
      </div>
      
      <!-- Content Wrapper -->
      <div class="content-wrapper">
        <!-- Barcode Section -->
        <div class="barcode-section">
          <div class="barcode-box">
            <p style="font-size: 8px;">Lab No: ${patient.patientId}</p>
          </div>
          <div style="text-align: right; font-size: 9px;">
            <p><strong>Referred to:</strong> ${patient.doctorName || "SELF"}</p>
          </div>
          <div class="barcode-box">
            <p style="font-size: 8px;">Patient ID: ${patient.patientId}</p>
          </div>
        </div>
        
        <!-- Patient Information -->
        <div class="patient-section">
          <div>
            <div class="info-row">
              <span class="info-label">Patient Name:</span>
              <span class="info-value">${patient.patientname}</span>
            </div>
            <div class="info-row">
              <span class="info-label">S/D/O:</span>
              <span class="info-value">${patient.fatherOrHusbandName || "-"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Age / Sex:</span>
              <span class="info-value">${patient.pateintAge} ${patient.years_month_day} / ${patient.gender}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Blood Group:</span>
              <span class="info-value">${patient.bloodGroup || "Unknown"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value">${patient.patientMobile || "-"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Address:</span>
              <span class="info-value">${patient.patientAddress || "-"}</span>
            </div>
          </div>
          <div>
            <div class="info-row">
              <span class="info-label">Requested on:</span>
              <span class="info-value">${reportDate} ${reportTime}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Reported:</span>
              <span class="info-value">${reportDate} ${reportTime}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Requested By:</span>
              <span class="info-value">${patient.doctorName || "AL-FALAH MEDICAL LAB"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Performed By:</span>
              <span class="info-value">AL-FALAH MEDICAL LAB</span>
            </div>
            <div class="info-row">
              <span class="info-label">Ref By:</span>
              <span class="info-value">${patient.doctorName || "SELF"}</span>
            </div>
          </div>
        </div>
        
        <!-- Report Title -->
        <div class="report-title">GLUCOSE REPORT</div>
        
        <!-- Test Results -->
        <div class="test-section">
          <div class="test-name">TEST(S)</div>
          <div class="test-results">
            ${
              patient.testResults && patient.testResults.length > 0
                ? patient.testResults
                    .map(
                      (test) => `
                <div class="test-item">
                  <span>${test.testName}</span>
                  <span><strong>${test.result}</strong></span>
                  <span>${test.referenceRange}</span>
                </div>
              `,
                    )
                    .join("")
                : `
                <div class="test-item">
                  <span>${patient.testName || "General Test"}</span>
                  <span><strong>Pending</strong></span>
                  <span>-</span>
                </div>
              `
            }
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <img class="footer-img"
          src="data:image/png;base64,${pdfFooterBase64}" 
          alt="Al-Falah Footer"
        />
      </div>
    </body>
    </html>
  `;
}

export default generatePatientReport;