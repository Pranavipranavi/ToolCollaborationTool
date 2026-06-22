import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mdPath = path.resolve(__dirname, "Project_Documentation.md");
const pdfPath = path.resolve(__dirname, "Project_Documentation.pdf");

console.log("Reading documentation from:", mdPath);
const markdown = fs.readFileSync(mdPath, "utf-8");

console.log("Initializing PDF document...");
const doc = new PDFDocument({
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
  size: "A4",
  bufferPages: true,
});

const writeStream = fs.createWriteStream(pdfPath);
doc.pipe(writeStream);

// Define styles
const colors = {
  primary: "#1e293b",    // slate 800
  secondary: "#0284c7",  // sky 600
  text: "#334155",       // slate 700
  lightText: "#64748b",  // slate 500
  accent: "#f8fafc",     // slate 50
  border: "#e2e8f0",     // slate 200
};

// 1. Cover Page
doc.rect(0, 0, doc.page.width, doc.page.height).fill("#0f172a"); // Dark cover page background

doc.fillColor("#38bdf8").fontSize(14).font("Helvetica-Bold").text("INTERNSHIP PROJECT REPORT", 50, 150, { align: "center" });
doc.moveDown(2);

doc.fillColor("#ffffff").fontSize(32).font("Helvetica-Bold").text("TaskFlow", { align: "center" });
doc.fillColor("#ffffff").fontSize(18).font("Helvetica").text("Task Collaboration & Team Productivity Platform", { align: "center" });
doc.moveDown(4);

// Divider line
doc.moveTo(150, doc.y).lineTo(doc.page.width - 150, doc.y).strokeColor("#38bdf8").lineWidth(2).stroke();
doc.moveDown(4);

doc.fillColor("#94a3b8").fontSize(12).font("Helvetica").text("SUBMITTED IN FULFILLMENT OF THE INTERNSHIP FOR", { align: "center" });
doc.moveDown();
doc.fillColor("#ffffff").fontSize(14).font("Helvetica-Bold").text("Codtech IT Solutions Private Limited", { align: "center" });
doc.moveDown(4);

// Intern details box
const boxTop = doc.y;
doc.rect(100, boxTop, doc.page.width - 200, 140).fill("#1e293b");

doc.fillColor("#38bdf8").fontSize(10).font("Helvetica-Bold").text("INTERN PROFILE", 120, boxTop + 15);
doc.fillColor("#ffffff").fontSize(12).font("Helvetica-Bold").text("Name: Sai Pranavi", 120, boxTop + 35);
doc.fillColor("#e2e8f0").fontSize(11).font("Helvetica").text("Intern ID: CITS1983", 120, boxTop + 55);
doc.text("Domain: Full-Stack Web Development", 120, boxTop + 75);
doc.text("Duration: 8 Weeks (April - June 2026)", 120, boxTop + 95);

doc.addPage(); // Start main content

// Configure margins for content
doc.page.margins = { top: 60, bottom: 60, left: 50, right: 50 };
doc.x = 50;
doc.y = 60;
doc.fillColor(colors.text).fontSize(10).font("Helvetica");

// Parse markdown simply
const lines = markdown.split("\n");
let isTable = false;
let tableRows = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  // Skip cover page heading from parsing since we custom drew it
  if (line === "# Project Documentation" || line === "## 1. Cover Page") {
    continue;
  }

  // Heading 1 (#)
  if (line.startsWith("# ")) {
    const text = line.replace("# ", "");
    doc.moveDown(2);
    doc.fillColor(colors.primary).fontSize(20).font("Helvetica-Bold").text(text);
    doc.moveDown(0.5);
    continue;
  }

  // Heading 2 (##)
  if (line.startsWith("## ")) {
    const text = line.replace("## ", "");
    doc.moveDown(1.5);
    doc.fillColor(colors.secondary).fontSize(14).font("Helvetica-Bold").text(text);
    doc.moveDown(0.5);
    continue;
  }

  // Heading 3 (###)
  if (line.startsWith("### ")) {
    const text = line.replace("### ", "");
    doc.moveDown();
    doc.fillColor(colors.primary).fontSize(11).font("Helvetica-Bold").text(text);
    doc.moveDown(0.3);
    continue;
  }

  // Lists (* or -)
  if (line.startsWith("* ") || line.startsWith("- ")) {
    const text = line.substring(2);
    doc.fillColor(colors.text).fontSize(10).font("Helvetica");
    doc.text(`  •  ${text}`, { indent: 15 });
    doc.moveDown(0.2);
    continue;
  }

  // Numbered lists (e.g. 1. )
  if (/^\d+\.\s/.test(line)) {
    doc.fillColor(colors.text).fontSize(10).font("Helvetica");
    doc.text(`  ${line}`, { indent: 15 });
    doc.moveDown(0.2);
    continue;
  }

  // Table support (very simple markdown table parsing)
  if (line.startsWith("|")) {
    if (line.includes("---")) continue; // Skip table header divider
    const cells = line.split("|").map(c => c.trim()).filter(Boolean);
    tableRows.push(cells);
    isTable = true;
    continue;
  } else if (isTable) {
    // End of table, write table to PDF
    doc.moveDown(0.5);
    const colWidths = [180, 70, 90, 160]; // Adjusted for typical 4-column layout
    
    tableRows.forEach((row, rowIndex) => {
      const startX = 50;
      let curX = startX;
      const startY = doc.y;
      let maxCellHeight = 20;

      // Draw background for header
      if (rowIndex === 0) {
        doc.rect(startX, startY, doc.page.width - 100, maxCellHeight).fill(colors.accent);
        doc.fillColor(colors.primary).font("Helvetica-Bold").fontSize(9);
      } else {
        doc.fillColor(colors.text).font("Helvetica").fontSize(9);
      }

      row.forEach((cell, colIndex) => {
        const width = colWidths[colIndex] || 100;
        doc.text(cell, curX + 5, startY + 5, { width: width - 10, lineBreak: true });
        curX += width;
      });

      doc.y = startY + maxCellHeight;
      // Draw border line
      doc.moveTo(startX, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor(colors.border).lineWidth(0.5).stroke();
    });

    doc.moveDown();
    isTable = false;
    tableRows = [];
    continue;
  }

  // Code blocks / Diagrams
  if (line.startsWith("```")) {
    let codeContent = "";
    i++; // Skip start ```
    while (i < lines.length && !lines[i].trim().startsWith("```")) {
      codeContent += lines[i] + "\n";
      i++;
    }
    doc.moveDown(0.5);
    const boxHeight = codeContent.split("\n").length * 12 + 10;
    const startY = doc.y;
    
    // Draw box
    doc.rect(50, startY, doc.page.width - 100, boxHeight).fill("#1e293b");
    doc.fillColor("#38bdf8").fontSize(8.5).font("Courier").text(codeContent, 55, startY + 5, { width: doc.page.width - 110 });
    doc.y = startY + boxHeight + 10;
    continue;
  }

  // Image references (skip or print reference)
  if (line.startsWith("![")) {
    const titleMatch = line.match(/!\[(.*?)\]/);
    const pathMatch = line.match(/\((.*?)\)/);
    const title = titleMatch ? titleMatch[1] : "Image";
    const imgPath = pathMatch ? pathMatch[1] : "";
    
    doc.moveDown(0.5);
    doc.fillColor(colors.lightText).fontSize(9).font("Helvetica-Oblique");
    doc.text(`[Visual Asset: ${title} (Reference: ${imgPath})]`, { align: "center" });
    doc.moveDown(0.5);
    continue;
  }

  // Plain paragraphs
  if (line.length > 0) {
    doc.fillColor(colors.text).fontSize(10).font("Helvetica");
    doc.text(line, { align: "justify", paragraphGap: 6 });
  }
}

// Add headers and footers to all buffered pages
const range = doc.bufferedPageRange();
for (let i = range.start + 1; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  doc.save();
  // Header
  doc.fontSize(8).fillColor(colors.lightText).font("Helvetica").text("TaskFlow Project Documentation", 50, 25);
  doc.moveTo(50, 37).lineTo(doc.page.width - 50, 37).strokeColor(colors.border).lineWidth(0.5).stroke();
  
  // Footer
  doc.moveTo(50, doc.page.height - 35).lineTo(doc.page.width - 50, doc.page.height - 35).strokeColor(colors.border).lineWidth(0.5).stroke();
  doc.fontSize(8).fillColor(colors.lightText).font("Helvetica").text(`Sai Pranavi | Intern ID: CITS1983`, 50, doc.page.height - 28);
  doc.text(`Page ${i + 1}`, doc.page.width - 100, doc.page.height - 28, { align: "right" });
  doc.restore();
}

doc.end();
console.log("PDF compilation finished successfully.");
