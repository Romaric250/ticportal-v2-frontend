import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { Team } from "../lib/services/adminService";
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
  const cols = [9, 32, 28, 11, 7, 7, 7, 10, 10, 10, 10, 10, 12] as const;
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
    const labels = ["Rank", "Team", "School", "Reg", "S1", "S2", "S3", "Rev avg", "Wtd rev", "LB pts", "LB /10", "Raw LB", "Final"];
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
      trunc(row.teamName, 40),
      trunc(row.school || "—", 34),
      trunc(row.region?.trim() || "—", 14),
      row.score1 != null ? String(row.score1) : "—",
      row.score2 != null ? String(row.score2) : "—",
      row.score3 != null ? String(row.score3) : "—",
      row.reviewerAverageScore != null ? String(row.reviewerAverageScore) : "—",
      row.reviewerContributionPoints != null ? row.reviewerContributionPoints.toFixed(2) : "—",
      (row.leaderboardContributionPoints ?? 0).toFixed(2),
      lbOutOf10(row),
      String(row.rawLeaderboardPoints ?? 0),
      cf != null ? cf.toFixed(2) : "—",
    ];

    for (let c = 0; c < 13; c++) {
      const isNum = c >= 4;
      const text = cell[c];
      const x = isNum ? colX[c] + w[c] - 0.8 : colX[c] + 0.6;
      doc.setFont("helvetica", c === 12 && cf != null ? "bold" : "normal");
      doc.text(text, x, y + 4.2, { align: isNum ? "right" : "left", maxWidth: isNum ? undefined : w[c] - 1.2 });
    }
    doc.setFont("helvetica", "normal");

    y += rowH;
  }

  drawFooter();

  doc.save(options?.filename ?? "grading-report.pdf");
}

/** Group teams by lead region; empty region → one bucket shown as "No region". */
export function groupTeamsByRegionForExport(teams: Team[]): { region: string; teams: Team[] }[] {
  const map = new Map<string, Team[]>();
  for (const t of teams) {
    const r = t.region?.trim() || "";
    const key = r || "__NONE__";
    const list = map.get(key) ?? [];
    list.push(t);
    map.set(key, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  const keys = [...map.keys()].sort((a, b) => {
    if (a === "__NONE__") return 1;
    if (b === "__NONE__") return -1;
    return a.localeCompare(b);
  });
  return keys.map((key) => ({
    region: key === "__NONE__" ? "No region" : key,
    teams: map.get(key)!,
  }));
}

/**
 * Teams list PDF: title, then for each region — "From Region: …" and a data table.
 */
export function exportTeamsPdfByRegion(
  teams: Team[],
  options?: { filename?: string; generatedAt?: string; excludeReviewers?: boolean }
) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const margin = 10;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const innerW = pageW - margin * 2;

  const rowH = 6;
  const headerH = 7;
  const sectionGap = 4;
  const footRoom = 10;
  const sectionTitleH = 7;

  const hideReviewers = options?.excludeReviewers === true;
  const cols = hideReviewers
    ? [8, 48, 50, 50, 16, 22]
    : [8, 42, 46, 46, 14, 20, 20];
  const labels = hideReviewers
    ? ["#", "Team", "School", "Project", "Members", "Deliverables"]
    : ["#", "Team", "School", "Project", "Members", "Deliverables", "Reviewers"];
  const colCount = cols.length;

  const sum = cols.reduce((a, b) => a + b, 0);
  const scale = innerW / sum;
  const w = cols.map((c) => c * scale);
  const colX: number[] = [];
  let acc = margin;
  for (let i = 0; i < w.length; i++) {
    colX.push(acc);
    acc += w[i];
  }

  const groups = groupTeamsByRegionForExport(teams);
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
    for (let i = 0; i < labels.length; i++) {
      doc.text(labels[i], colX[i] + 0.6, yy + 4.8);
    }
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
  };

  const ensureSpace = (needMm: number) => {
    if (y + needMm <= pageH - margin - footRoom) return;
    drawFooter();
    doc.addPage();
    page += 1;
    y = margin;
  };

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("TiC Summit 2026 ", margin, y + 5);
  y += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 55, 55);
  doc.text(`Total teams: ${teams.length}`, margin, y + 3);
  y += 6;
  const gen = options?.generatedAt ?? new Date().toISOString();
  doc.text(`Generated: ${new Date(gen).toLocaleString()}`, margin, y + 3);
  y += 10;
  doc.setTextColor(0, 0, 0);

  for (const { region, teams: regionTeams } of groups) {
    const submissionBuckets = new Map<number, number>();
    for (const t of regionTeams) {
      const s = t.deliverableSubmitted ?? 0;
      submissionBuckets.set(s, (submissionBuckets.get(s) ?? 0) + 1);
    }
    const bucketKeys = [...submissionBuckets.keys()].sort((a, b) => b - a);
    const maxDel = regionTeams.reduce((m, t) => Math.max(m, t.deliverableTotal ?? 0), 0);
    const parts = bucketKeys.map((k) => {
      const count = submissionBuckets.get(k)!;
      return k === maxDel && maxDel > 0
        ? `${count} team${count !== 1 ? "s" : ""} with all ${k} submitted`
        : `${count} team${count !== 1 ? "s" : ""} with ${k} submitted`;
    });
    const nbText = `NB: ${regionTeams.length} team${regionTeams.length !== 1 ? "s" : ""} total — ${parts.join(", ")}.`;

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    const nbLines = doc.splitTextToSize(nbText, innerW);
    const nbHeight = nbLines.length * 4;

    const blockMin = sectionTitleH + 2 + nbHeight + 2 + headerH + rowH;
    ensureSpace(blockMin);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`From Region: ${region}`, margin, y + 5);
    y += sectionTitleH + 1;

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38);
    for (let li = 0; li < nbLines.length; li++) {
      doc.text(nbLines[li], margin, y + 3 + li * 4);
    }
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    y += nbHeight + 3;

    drawTableHeader(y);
    y += headerH;

    for (let i = 0; i < regionTeams.length; i++) {
      const t = regionTeams[i];
      if (y + rowH > pageH - margin - footRoom) {
        drawFooter();
        doc.addPage();
        page += 1;
        y = margin;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`From Region: ${region} (continued)`, margin, y + 5);
        y += sectionTitleH + sectionGap;
        doc.setFont("helvetica", "normal");
        drawTableHeader(y);
        y += headerH;
      }

      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, innerW, rowH, "F");
      }

      const members = t.memberCount ?? t.members?.length ?? "—";
      const del =
        (t.deliverableTotal ?? 0) > 0
          ? `${t.deliverableSubmitted ?? 0}/${t.deliverableTotal}`
          : "—";

      const cell: string[] = [
        String(i + 1),
        trunc(t.name, 48),
        trunc(t.school || "—", 48),
        trunc(t.projectTitle?.trim() || "—", 48),
        String(members),
        del,
      ];
      if (!hideReviewers) {
        cell.push(String(t.reviewerAssignmentCount ?? 0));
      }

      doc.setFontSize(7.5);

      const delColIdx = 5;
      const numColIdx = 0;
      const submitted = t.deliverableSubmitted ?? 0;
      const total = t.deliverableTotal ?? 0;
      const delComplete = total > 0 && submitted >= total;

      for (let c = 0; c < colCount; c++) {
        const isNum = c === numColIdx || c >= 4;
        const text = cell[c];

        if (c === numColIdx) {
          doc.setFont("helvetica", "bold");
          const tw = doc.getTextWidth(text);
          const padX = 1.6;
          const padY = 0.8;
          const badgeW = tw + padX * 2;
          const bh = rowH - padY * 2;
          const bx = colX[c] + (w[c] - badgeW) / 2;
          const by = y + padY;
          doc.setFillColor(17, 24, 39);
          doc.roundedRect(bx, by, badgeW, bh, 1, 1, "F");
          doc.setTextColor(255, 255, 255);
          doc.text(text, bx + badgeW / 2, y + 4.2, { align: "center" });
          doc.setFont("helvetica", "normal");
          doc.setTextColor(25, 25, 25);
          continue;
        }

        if (c === delColIdx) {
          if (delComplete) {
            doc.setTextColor(22, 163, 74);
          } else if (total > 0) {
            doc.setTextColor(220, 38, 38);
          }
          doc.setFont("helvetica", "bold");
        }

        const x = isNum ? colX[c] + w[c] - 0.8 : colX[c] + 0.6;
        doc.text(text, x, y + 4.2, {
          align: isNum ? "right" : "left",
          maxWidth: isNum ? undefined : w[c] - 1.2,
        });

        if (c === delColIdx) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(25, 25, 25);
        }
      }

      y += rowH;
    }

    y += sectionGap;
  }

  drawFooter();
  doc.save(options?.filename ?? "teams.pdf");
}
