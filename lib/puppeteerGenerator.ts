import puppeteer, { Browser } from "puppeteer";
import fs from "fs/promises";
import path from "path";
import { PatientData } from "./pdfGenerator";

interface ReportAssets {
  pdfHeaderBase64: string;
  pdfFooterBase64: string;
}

interface GroupedResultSection {
  groupName: string;
  items: NonNullable<PatientData["testResults"]>;
  hasSubTests: boolean;
}

async function loadAssetBase64(fileName: string): Promise<string> {
  const filePath = path.join(process.cwd(), "public", "logo", fileName);
  const fileBuffer = await fs.readFile(filePath);
  return fileBuffer.toString("base64");
}

async function loadReportAssets(): Promise<ReportAssets> {
  const [pdfHeaderBase64, pdfFooterBase64] = await Promise.all([
    loadAssetBase64("alflahPdfHeader.PNG"),
    loadAssetBase64("alfahlPdfFooter.PNG"),
  ]);

  return {
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
      margin: { top: "12mm", right: "12mm", bottom: "0mm", left: "12mm" },
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
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

function groupResultSections(patient: PatientData): GroupedResultSection[] {
  const testResults = patient.testResults || [];

  if (testResults.length === 0) {
    const fallbackName = Array.isArray(patient.testName)
      ? patient.testName.filter(Boolean).join(", ")
      : patient.testName || "General Test";

    return [
      {
        groupName: fallbackName,
        items: [
          {
            testName: fallbackName,
            unit: "-",
            result: "Pending",
            referenceRange: "-",
            notes: "",
          },
        ],
        hasSubTests: false,
      },
    ];
  }

  const groupedTests = new Map<string, typeof testResults>();

  testResults.forEach((test) => {
    const groupName = test.parentTestName?.trim() || test.testName.trim() || "Test";
    const currentTests = groupedTests.get(groupName) || [];
    currentTests.push(test);
    groupedTests.set(groupName, currentTests);
  });

  return Array.from(groupedTests.entries()).map(([groupName, items]) => ({
    groupName,
    items,
    hasSubTests:
      items.length > 1 ||
      items.some(
        (item) =>
          (item.parentTestName || "").trim().toLowerCase() !==
          item.testName.trim().toLowerCase(),
      ),
  }));
}

function buildRows(section: GroupedResultSection): string {
  const hasAnyNotes = section.items.some((item) => (item.notes || "").trim());

  return section.items
    .map(
      (item, index) => `
        <tr>
          <td class="test-name">
            ${escapeHtml(
              section.hasSubTests
                ? item.testName || "-"
                : index === 0
                  ? item.testName || section.groupName
                  : "-",
            )}
          </td>
          <td class="test-result">${escapeHtml(item.result || "-")}</td>
          <td class="test-unit">${escapeHtml(item.unit || "-")}</td>
          <td class="test-range">${escapeHtml(item.referenceRange || "-")}</td>
          ${
            hasAnyNotes
              ? `<td class="test-notes">${escapeHtml(item.notes || "-")}</td>`
              : ""
          }
        </tr>
      `,
    )
    .join("");
}

function buildReportPages(patient: PatientData, assets: ReportAssets): string {
  const sections = groupResultSections(patient);
  const reportDate = formatReportDate(patient.updatedAt || Date.now());
  const ageText = patient.pateintAge
    ? `${patient.pateintAge}${patient.years_month_day || "Year"}`
    : "-";
  const patientLocation = "Sample taken inside Lab";

  return sections
    .map((section, index) => {
      const hasAnyNotes = section.items.some((item) => (item.notes || "").trim());
      const columnHeader = section.hasSubTests ? "SUB TEST NAME" : "TEST NAME";

      return `
        <section class="report-page ${index < sections.length - 1 ? "page-break" : ""}">
          <div class="header-image-wrap">
            <img
              class="header-image"
              src="data:image/png;base64,${assets.pdfHeaderBase64}"
              alt="Report Header"
            />
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
              <td><span class="meta-label">Location:</span> ${escapeHtml(patientLocation)}</td>
            </tr>
          </table>

          <div class="separator"></div>

          <table class="results-table ${hasAnyNotes ? "results-table-with-notes" : ""}">
            <thead>
              <tr>
                <th>${escapeHtml(section.groupName.toUpperCase())}</th>
                <th>RESULTS</th>
                <th>UNITS</th>
                <th>REFERENCE RANGES</th>
                ${hasAnyNotes ? "<th>NOTES</th>" : ""}
              </tr>
            </thead>
            <tbody>
              ${
                section.hasSubTests
                  ? `
                    <tr class="column-title-row">
                      <td>${columnHeader}</td>
                      <td>RESULT</td>
                      <td>UNIT</td>
                      <td>REFERENCE RANGE</td>
                      ${hasAnyNotes ? "<td>NOTES</td>" : ""}
                    </tr>
                  `
                  : ""
              }
              ${buildRows(section)}
            </tbody>
          </table>

          <div class="footer-image-wrap">
            <img
              class="footer-image"
              src="data:image/png;base64,${assets.pdfFooterBase64}"
              alt="Report Footer"
            />
          </div>
        </section>
      `;
    })
    .join("");
}

function generateHTMLReport(patient: PatientData, assets: ReportAssets): string {
  const reportPages = buildReportPages(patient, assets);

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
          margin: 0;
          padding: 0;
          color: #000;
          font-family: Arial, sans-serif;
          font-size: 11px;
          line-height: 1.35;
          background: #fff;
        }

        .report-page {
          min-height: 297mm;
          padding: 2px 0 0 0;
          box-sizing: border-box;
          page-break-inside: avoid;
          display: flex;
          flex-direction: column;
        }

        .page-break {
          break-after: page;
          page-break-after: always;
        }

        .header-image-wrap {
          margin: 0 12mm 2px 12mm;
        }

        .header-image {
          display: block;
          width: 100%;
          margin: 0;
          object-fit: cover;
        }

        .footer-image-wrap {
          margin-top: auto;
          padding: 0 0 2px 0;
        }

        .footer-image {
          display: block;
          width: 100%;
          margin: 0;
          padding: 0;
          
        }

        .top-note {
          margin: 8px 0 10px;
          text-align: center;
          font-size: 11px;
          font-weight: 600;
        }

        .meta-grid {
          width: 100%;
          border-collapse: collapse;
          margin: 0 12mm 1px 12mm;
        }

        .meta-grid td {
          width: 50%;
          padding: 3px 2px;
          vertical-align: top;
          font-size: 12px;
        }

        .meta-label {
          font-weight: 700;
          display: inline-block;
          min-width: 98px;
        }

        .separator {
          border-top: 1px dashed #000;
          margin: 8px 12mm 10px 12mm;
        }

        .results-table {
          width: calc(100% - 24mm);
          border-collapse: collapse;
          table-layout: fixed;
          margin: 0 12mm;
        }

        .results-table th,
        .results-table td {
          padding: 6px 6px;
          text-align: left;
          vertical-align: top;
          font-size: 11px;
        }

        .results-table thead th {
          border-bottom: 1.5px solid #000;
          font-size: 12px;
          font-weight: 700;
        }

        .results-table tbody td {
          border-bottom: 1px solid #d4d4d4;
        }

        .results-table thead th:nth-child(1) {
          width: 34%;
        }

        .results-table thead th:nth-child(2) {
          width: 16%;
        }

        .results-table thead th:nth-child(3) {
          width: 14%;
        }

        .results-table thead th:nth-child(4) {
          width: 36%;
        }

        .results-table-with-notes thead th:nth-child(1) {
          width: 24%;
        }

        .results-table-with-notes thead th:nth-child(2) {
          width: 14%;
        }

        .results-table-with-notes thead th:nth-child(3) {
          width: 12%;
        }

        .results-table-with-notes thead th:nth-child(4) {
          width: 28%;
        }

        .results-table-with-notes thead th:nth-child(5) {
          width: 22%;
        }

        .column-title-row td {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          background: #f3f3f3;
        }

        .test-name {
          font-weight: 600;
        }

        .test-result {
          font-weight: 700;
        }
      </style>
    </head>
    <body>
      ${reportPages}
    </body>
    </html>
  `;
}

export default generatePatientReport;
