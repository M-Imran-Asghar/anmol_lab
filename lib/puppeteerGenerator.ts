import puppeteer, { Browser } from "puppeteer";
import { PatientData } from "./pdfGenerator";
import fs from "fs/promises";
import path from "path";

interface ReportAssets {
  logoBase64: string;
  pdfHeaderBase64: string;
  pdfFooterBase64: string;
}

async function loadAssetBase64(fileName: string): Promise<string> {
  const filePath = path.join(process.cwd(), "public", "logo", fileName);
  const fileBuffer = await fs.readFile(filePath);
  return fileBuffer.toString("base64");
}

async function loadReportAssets(): Promise<ReportAssets> {
  const [logoBase64, pdfHeaderBase64, pdfFooterBase64] = await Promise.all([
    loadAssetBase64("appLogo.png"),
    loadAssetBase64("alflahPdfHeader.PNG"),
    loadAssetBase64("alfahlPdfFooter.PNG"),
  ]);

  return {
    logoBase64,
    pdfHeaderBase64,
    pdfFooterBase64,
  };
}

export async function generatePatientReport(
  patient: PatientData,
): Promise<Buffer> {
  let browser: Browser | null = null;

  try {
    const assets = await loadReportAssets();
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(generateHTMLReport(patient, assets), {
      waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "140px", right: "10mm", bottom: "50px", left: "10mm" }, // Increased top margin for header
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatReportDate(date: Date | string | number | undefined): string {
  const parsedDate = date ? new Date(date) : new Date();
  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function buildReportHeading(patient: PatientData): string {
  const groupedNames = Array.from(
    new Set(
      (patient.testResults || [])
        .map((test) => test.parentTestName || test.testName)
        .filter(Boolean),
    ),
  );

  if (groupedNames.length === 1) {
    return `${groupedNames[0].toUpperCase()} REPORT`;
  }

  const normalizedTestName = Array.isArray(patient.testName)
    ? patient.testName.filter(Boolean).join(", ")
    : patient.testName;

  if (normalizedTestName?.trim()) {
    return `${normalizedTestName.toUpperCase()} REPORT`;
  }

  return "LABORATORY REPORT";
}

function buildResultSections(patient: PatientData): string {
  const testResults = patient.testResults || [];

  if (testResults.length === 0) {
    return `
      <div class="test-block">
        <table class="results-table">
          <thead>
            <tr>
              <th class="section-heading">TEST NAME</th>
              <th class="unit-col">UNITS</th>
              <th class="result-col">RESULT</th>
              <th class="range-col">REFERENCE RANGE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="test-cell">${escapeHtml(Array.isArray(patient.testName) ? patient.testName.join(", ") : patient.testName || "General Test")}</td>
              <td class="unit-cell">-</td>
              <td class="result-cell">Pending</td>
              <td class="range-cell">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  const groupedTests = new Map<string, typeof testResults>();

  testResults.forEach((test) => {
    const groupName = test.parentTestName?.trim() || test.testName.trim() || "Test";
    const currentTests = groupedTests.get(groupName) || [];
    currentTests.push(test);
    groupedTests.set(groupName, currentTests);
  });

  return Array.from(groupedTests.entries())
    .map(([groupName, items]) => {
      const hasSubTests =
        items.length > 1 ||
        items.some((item) => (item.parentTestName || "").trim().toLowerCase() !== item.testName.trim().toLowerCase());

      const firstColumnHeader = hasSubTests ? "SUB TEST NAME" : "TEST NAME";
      const firstColumnValue = hasSubTests ? null : items[0]?.testName || groupName;
      const sectionRows = items
        .map((item, index) => `
          <tr>
            <td class="test-cell">${escapeHtml(hasSubTests ? item.testName || "-" : index === 0 ? firstColumnValue || "-" : "-")}</td>
            <td class="unit-cell">${escapeHtml(item.unit || "-")}</td>
            <td class="result-cell">${escapeHtml(item.result || "-")}</td>
            <td class="range-cell">${escapeHtml(item.referenceRange || "-")}</td>
          </tr>
        `)
        .join("");

      return `
        <div class="test-block">
          ${hasSubTests ? `<div class="test-block-heading">${escapeHtml(groupName.toUpperCase())}</div>` : ""}
          <table class="results-table">
            <thead>
              <tr>
                <th class="section-heading">${firstColumnHeader}</th>
                <th class="unit-col">UNIT</th>
                <th class="result-col">RESULT</th>
                <th class="range-col">REFERENCE RANGE</th>
              </tr>
            </thead>
            <tbody>
              ${sectionRows}
            </tbody>
          </table>
        </div>
      `;
    })
    .join("");
}

function generateHTMLReport(patient: PatientData, assets: ReportAssets): string {
  const reportedAt = patient.updatedAt || Date.now();
  const collectedAt = patient.createdAt || Date.now();
  const reportDate = formatReportDate(reportedAt);
  const collectionDate = formatReportDate(collectedAt);
  const reportHeading = buildReportHeading(patient);
  const ageText = patient.pateintAge
    ? `${patient.pateintAge} ${patient.years_month_day || "Year"}`
    : "-";
  const resultSections = buildResultSections(patient);

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
          padding: 0 12px;
          background: white;
          z-index: 1000;
          box-sizing: border-box;
        }

        .header-left,
        .header-right {
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
          max-width: calc(100% - 12px);
        }

        .content-wrapper {
          padding: 122px 18px 78px;
        }

        .top-note {
          text-align: center;
          font-size: 10px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .meta-grid {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }

        .meta-grid td {
          padding: 2px 4px;
          vertical-align: top;
          font-size: 11px;
        }

        .meta-label {
          font-weight: 700;
          white-space: nowrap;
        }

        .separator {
          border-top: 1px solid #000;
          margin: 8px 0 10px;
        }

        .report-heading {
          text-align: center;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.8px;
          margin-bottom: 10px;
        }

        .results-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          margin-bottom: 16px;
        }

        .results-table thead th {
          border-top: 1.5px solid #000;
          border-bottom: 1.5px solid #000;
          padding: 6px 8px;
          font-size: 11px;
          text-align: left;
        }

        .results-table tbody td {
          padding: 6px 8px;
          border-bottom: 1px solid #d9d9d9;
          vertical-align: top;
          font-size: 11px;
        }

        .section-heading {
          width: 42%;
        }

        .result-col {
          width: 18%;
        }

        .unit-col {
          width: 16%;
        }

        .range-col {
          width: 24%;
        }

        .group-row {
          font-weight: 700;
          text-transform: uppercase;
          padding-top: 10px;
          background: #f8f8f8;
        }

        .test-block {
          margin-bottom: 14px;
        }

        .test-block-heading {
          margin: 10px 0 4px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .test-cell {
          font-weight: 500;
        }

        .result-cell {
          font-weight: 700;
        }

        .unit-cell,
        .range-cell {
          color: #222;
        }

        .verification-note {
          text-align: center;
          margin: 18px 0 22px;
          font-size: 10px;
          font-style: italic;
        }

        .signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-top: 22px;
        }

        .signature-block {
          text-align: center;
          font-size: 10px;
        }

        .signature-line {
          border-top: 1px solid #000;
          margin: 0 auto 6px;
          width: 78%;
        }

        .footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          height: 56px;
          background: white;
          z-index: 1000;
          box-sizing: border-box;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .footer-img {
          width: 100%;
          height: 56px;
          object-fit: cover;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-left">
          <img 
            class="header-img"
            src="data:image/png;base64,${assets.pdfHeaderBase64}" 
            alt="Al-Falah Header"
          />
        </div>
        <div class="header-right">
          <img 
            class="header-img"
            src="data:image/png;base64,${assets.logoBase64}" 
            alt="Al-Falah Logo"
          />
        </div>
      </div>

      <div class="content-wrapper">
        <div class="top-note">
          Our Aim Provide Best Diagnostic Facilities With Affordable Price In Our Town
        </div>

        <table class="meta-grid">
          <tr>
            <td><span class="meta-label">Cr/Lab No:</span> ${escapeHtml(String(patient.patientId || "-"))}</td>
            <td><span class="meta-label">Date:</span> ${escapeHtml(reportDate)}</td>
          </tr>
          <tr>
            <td><span class="meta-label">Patient Name:</span> ${escapeHtml(patient.patientname || "-")}</td>
            <td><span class="meta-label">Age/Sex:</span> ${escapeHtml(ageText)} / ${escapeHtml(patient.gender || "-")}</td>
          </tr>
          <tr>
            <td><span class="meta-label">Consultant:</span> ${escapeHtml(patient.doctorName || "Self")}</td>
            <td><span class="meta-label">Collected:</span> ${escapeHtml(collectionDate)}</td>
          </tr>
          <tr>
            <td><span class="meta-label">S/D/O:</span> ${escapeHtml(patient.fatherOrHusbandName || "-")}</td>
            <td><span class="meta-label">Phone:</span> ${escapeHtml(String(patient.patientMobile || "-"))}</td>
          </tr>
          <tr>
            <td><span class="meta-label">Address:</span> ${escapeHtml(patient.patientAddress || "-")}</td>
            <td><span class="meta-label">Reported:</span> ${escapeHtml(reportDate)}</td>
          </tr>
        </table>

        <div class="separator"></div>
        <div class="report-heading">${escapeHtml(reportHeading)}</div>

        ${resultSections}

        <div class="verification-note">
          Electronically verified report. No signature required.
        </div>

        <div class="signatures">
          <div class="signature-block">
            <div class="signature-line"></div>
            <div>Medical Lab Technician</div>
          </div>
          <div class="signature-block">
            <div class="signature-line"></div>
            <div>Medical Lab Technologist</div>
          </div>
        </div>
      </div>

      <div class="footer">
        <img class="footer-img"
          src="data:image/png;base64,${assets.pdfFooterBase64}" 
          alt="Al-Falah Footer"
        />
      </div>
    </body>
    </html>
  `;
}

export default generatePatientReport;
