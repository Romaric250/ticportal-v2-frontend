import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { GradingReportTeamRow } from "../lib/services/gradingService";

export async function exportPortfolioToPDF(elementId: string, filename: string = "portfolio.pdf") {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Element not found for PDF export");
  }

  try {
    const loadingToast = document.createElement("div");
    loadingToast.className = "fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50";
    loadingToast.textContent = "Generating PDF...";
    document.body.appendChild(loadingToast);

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgScaledWidth = imgWidth * ratio;
    const imgScaledHeight = imgHeight * ratio;

    const totalPages = Math.ceil(imgScaledHeight / pdfHeight);

    pdf.addImage(imgData, "PNG", 0, 0, imgScaledWidth, imgScaledHeight);

    for (let i = 1; i < totalPages; i++) {
      pdf.addPage();
      const yPosition = -(i * pdfHeight);
      pdf.addImage(imgData, "PNG", 0, yPosition, imgScaledWidth, imgScaledHeight);
    }

    document.body.removeChild(loadingToast);

    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

function trunc(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1))}…`;
}

function computedFinal(row: GradingReportTeamRow): number | null {
  return row.blendFinal ?? row.finalScore ?? null;
}

function lbOutOf10(row: GradingReportTeamRow): string {
  const n = row.normalizedLeaderboard ?? 0;
  return `${((n / 100) * 10).toFixed(2)}/10`;
}

/** Grading report: landscape table, repeated header, readable typography. */
export function exportGradingReportPdf(
  teams: GradingReportTeamRow[],
  options?: { filename?: string; title?: string; generatedAt?: string }
) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const margin = 10;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const innerW = pageW - margin * 2;

  const rowH = 6;
  const headerH = 7;
  const footRoom = 8;

  /** Column widths (mm), sum ≈ innerW */
  const cols = [10, 40, 36, 9, 9, 11, 12, 12, 13, 12, 14] as const;
  const sum = cols.reduce((a, b) => a + b, 0);
  const scale = innerW / sum;
  const w = cols.map((c) => c * scale);
  const colX: number[] = [];
  let acc = margin;
  for (let i = 0; i < w.length; i++) {
    colX.push(acc);
    acc += w[i];
  }

  const wPct = teams[0]?.leaderboardWeightPercent;
  const subtitle =
    wPct != null
      ? `Rev avg is unweighted. Wtd rev = Rev avg × ${100 - wPct}%. Final = Wtd rev + LB pts (Settings w = ${wPct}% LB).`
      : "Final = Wtd rev + LB pts (weighted review + leaderboard share from Settings).";

  let page = 1;
  let y = margin;

  const drawFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(`TiC Portal · ${teams.length} team(s)`, margin, pageH - 5);
    doc.text(`Page ${page}`, pageW - margin - 15, pageH - 5, { align: "right" });
    doc.setTextColor(0, 0, 0);
  };

  const drawTableHeader = (yy: number) => {
    doc.setFillColor(17, 24, 39);
    doc.rect(margin, yy, innerW, headerH, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    const labels = ["Rank", "Team", "School", "S1", "S2", "Rev avg", "Wtd rev", "LB pts", "LB /10", "Raw LB", "Final"];
    for (let i = 0; i < labels.length; i++) {
      doc.text(labels[i], colX[i] + 0.6, yy + 4.8);
    }
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
  };

  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(options?.title ?? "Grading report", margin, y + 5);
  y += 12;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 55, 55);
  const subLines = doc.splitTextToSize(subtitle, innerW);
  for (const line of subLines) {
    doc.text(line, margin, y);
    y += 4;
  }
  if (options?.generatedAt) {
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date(options.generatedAt).toLocaleString()}`, margin, y + 1);
    y += 7;
  } else {
    y += 4;
  }
  doc.setTextColor(0, 0, 0);
  y += 2;

  drawTableHeader(y);
  y += headerH;

  for (let i = 0; i < teams.length; i++) {
    if (y + rowH > pageH - margin - footRoom) {
      drawFooter();
      doc.addPage();
      page += 1;
      y = margin;
      drawTableHeader(y);
      y += headerH;
    }

    const row = teams[i];
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, innerW, rowH, "F");
    }

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(25, 25, 25);

    const cf = computedFinal(row);
    const cell: string[] = [
      `#${row.rank}`,
      trunc(row.teamName, 42),
      trunc(row.school || "—", 38),
      row.score1 != null ? String(row.score1) : "—",
      row.score2 != null ? String(row.score2) : "—",
      row.reviewerAverageScore != null ? String(row.reviewerAverageScore) : "—",
      row.reviewerContributionPoints != null ? row.reviewerContributionPoints.toFixed(2) : "—",
      (row.leaderboardContributionPoints ?? 0).toFixed(2),
      lbOutOf10(row),
      String(row.rawLeaderboardPoints ?? 0),
      cf != null ? cf.toFixed(2) : "—",
    ];

    for (let c = 0; c < 11; c++) {
      const isNum = c >= 3;
      const text = cell[c];
      const x = isNum ? colX[c] + w[c] - 0.8 : colX[c] + 0.6;
      doc.setFont("helvetica", c === 10 && cf != null ? "bold" : "normal");
      doc.text(text, x, y + 4.2, { align: isNum ? "right" : "left", maxWidth: isNum ? undefined : w[c] - 1.2 });
    }
    doc.setFont("helvetica", "normal");

    y += rowH;
  }

  drawFooter();

  doc.save(options?.filename ?? "grading-report.pdf");
}
