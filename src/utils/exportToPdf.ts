import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { Team, GDriveAccessCheckItem } from "../lib/services/adminService";
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

  /** Column widths (mm), sum ≈ innerW — includes Submissions before Final */
  const cols = [8, 28, 24, 10, 6, 6, 6, 9, 9, 9, 8, 8, 7, 10] as const;
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
    const labels = [
      "Rank",
      "Team",
      "School",
      "Reg",
      "S1",
      "S2",
      "S3",
      "Rev avg",
      "Wtd rev",
      "LB pts",
      "LB /10",
      "Raw LB",
      "Sub",
      "Final",
    ];
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
      String(row.submittedDeliverableCount ?? 0),
      cf != null ? cf.toFixed(2) : "—",
    ];

    for (let c = 0; c < 14; c++) {
      const isNum = c >= 4;
      const text = cell[c];
      const x = isNum ? colX[c] + w[c] - 0.8 : colX[c] + 0.6;
      doc.setFont("helvetica", c === 13 && cf != null ? "bold" : "normal");
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

/**
 * Export inaccessible Google Drive deliverables to a detailed PDF,
 * grouped by region with team details, members, schools.
 */
export function exportInaccessibleDeliverablesPdf(
  items: GDriveAccessCheckItem[],
  options?: { filename?: string },
) {
  const inaccessible = items.filter((i) => i.accessResult.accessible === false);
  if (inaccessible.length === 0) return;

  // Group by region
  const regionMap = new Map<string, GDriveAccessCheckItem[]>();
  for (const item of inaccessible) {
    const r = item.teamRegion?.trim() || "__NONE__";
    const list = regionMap.get(r) ?? [];
    list.push(item);
    regionMap.set(r, list);
  }
  const regionKeys = [...regionMap.keys()].sort((a, b) => {
    if (a === "__NONE__") return 1;
    if (b === "__NONE__") return -1;
    return a.localeCompare(b);
  });

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const margin = 10;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const innerW = pageW - margin * 2;
  const footRoom = 10;

  let page = 1;
  let y = margin;

  const drawFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `TiC Portal — Inaccessible Deliverables Report · ${inaccessible.length} item(s)`,
      margin,
      pageH - 5,
    );
    doc.text(`Page ${page}`, pageW - margin - 15, pageH - 5, { align: "right" });
    doc.setTextColor(0, 0, 0);
  };

  const ensureSpace = (needMm: number) => {
    if (y + needMm <= pageH - margin - footRoom) return;
    drawFooter();
    doc.addPage();
    page += 1;
    y = margin;
  };

  // --- Title ---
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("TiC Summit 2026 — Inaccessible Deliverables", margin, y + 5);
  y += 9;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(220, 38, 38);
  doc.text(
    `${inaccessible.length} deliverable(s) with inaccessible Google Drive links`,
    margin,
    y + 3,
  );
  y += 6;
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y + 3);
  y += 5;
  doc.setFontSize(8);
  doc.text(
    "Students must change their Google Drive sharing to \"Anyone with the link\" and re-submit.",
    margin,
    y + 3,
  );
  y += 8;
  doc.setTextColor(0, 0, 0);

  // --- Table columns ---
  const cols = [7, 30, 30, 32, 42, 38, 42, 42];
  const labels = ["#", "Team", "Deliverable", "Link", "Members", "Schools", "Phones", "Emails"];
  const colCount = cols.length;
  const sum = cols.reduce((a, b) => a + b, 0);
  const scale = innerW / sum;
  const w = cols.map((c) => c * scale);
  const colX: number[] = [];
  let acc2 = margin;
  for (let i = 0; i < w.length; i++) {
    colX.push(acc2);
    acc2 += w[i];
  }

  const headerH = 7;

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

  for (const regionKey of regionKeys) {
    const regionLabel = regionKey === "__NONE__" ? "No Region" : regionKey;
    const regionItems = regionMap.get(regionKey)!;

    // Unique teams in this region
    const uniqueTeams = new Set(regionItems.map((i) => i.teamId));

    ensureSpace(30);

    // Region header
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`From Region: ${regionLabel}`, margin, y + 5);
    y += 8;

    // NB summary
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38);
    doc.text(
      `NB: ${regionItems.length} inaccessible link(s) across ${uniqueTeams.size} team(s)`,
      margin,
      y + 3,
    );
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    y += 7;

    drawTableHeader(y);
    y += headerH;

    for (let i = 0; i < regionItems.length; i++) {
      const item = regionItems[i];
      const memberNames = item.members.map((m) => m.name).join(", ");
      const memberSchools = [...new Set(item.members.map((m) => m.school).filter(Boolean))].join(", ");
      const memberPhones = item.members.map((m) => m.phone).filter(Boolean).join(", ");
      const memberEmails = item.members.map((m) => m.email).join(", ");

      // Compute row height (wrap long text)
      doc.setFontSize(7);
      const wrappedMembers = doc.splitTextToSize(memberNames, w[4] - 2);
      const wrappedSchools = doc.splitTextToSize(memberSchools || item.teamSchool || "—", w[5] - 2);
      const wrappedPhones = doc.splitTextToSize(memberPhones || "—", w[6] - 2);
      const wrappedEmails = doc.splitTextToSize(memberEmails, w[7] - 2);
      const maxLines = Math.max(wrappedMembers.length, wrappedSchools.length, wrappedPhones.length, wrappedEmails.length, 1);
      const rowH = Math.max(6, maxLines * 3.5 + 2);

      ensureSpace(rowH);

      if (y <= margin) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`From Region: ${regionLabel} (continued)`, margin, y + 5);
        y += 9;
        doc.setFont("helvetica", "normal");
        drawTableHeader(y);
        y += headerH;
      }

      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, innerW, rowH, "F");
      }

      doc.setFontSize(7);
      doc.setTextColor(25, 25, 25);

      // Number badge
      const numStr = String(i + 1);
      doc.setFont("helvetica", "bold");
      const tw = doc.getTextWidth(numStr);
      const padX = 1.6;
      const padY2 = 1;
      const badgeW = tw + padX * 2;
      const bh = 5;
      const bx = colX[0] + (w[0] - badgeW) / 2;
      const by = y + padY2;
      doc.setFillColor(17, 24, 39);
      doc.roundedRect(bx, by, badgeW, bh, 1, 1, "F");
      doc.setTextColor(255, 255, 255);
      doc.text(numStr, bx + badgeW / 2, y + 4.2, { align: "center" });
      doc.setTextColor(25, 25, 25);
      doc.setFont("helvetica", "normal");

      // Team name
      doc.text(trunc(item.teamName, 36), colX[1] + 0.6, y + 4.2, { maxWidth: w[1] - 1.2 });

      // Deliverable title
      doc.text(trunc(item.templateTitle, 36), colX[2] + 0.6, y + 4.2, { maxWidth: w[2] - 1.2 });

      // Link (shortened)
      doc.setTextColor(37, 99, 235);
      const shortLink = item.content.replace(/^https?:\/\//, "").slice(0, 42);
      doc.text(trunc(shortLink, 42), colX[3] + 0.6, y + 4.2, { maxWidth: w[3] - 1.2 });
      doc.setTextColor(25, 25, 25);

      // Members (wrapped)
      for (let li = 0; li < wrappedMembers.length; li++) {
        doc.text(wrappedMembers[li], colX[4] + 0.6, y + 4.2 + li * 3.5, { maxWidth: w[4] - 1.2 });
      }

      // Schools (wrapped)
      for (let li = 0; li < wrappedSchools.length; li++) {
        doc.text(wrappedSchools[li], colX[5] + 0.6, y + 4.2 + li * 3.5, { maxWidth: w[5] - 1.2 });
      }

      // Phones (wrapped)
      for (let li = 0; li < wrappedPhones.length; li++) {
        doc.text(wrappedPhones[li], colX[6] + 0.6, y + 4.2 + li * 3.5, { maxWidth: w[6] - 1.2 });
      }

      // Emails (wrapped)
      doc.setFontSize(6);
      for (let li = 0; li < wrappedEmails.length; li++) {
        doc.text(wrappedEmails[li], colX[7] + 0.6, y + 4.2 + li * 3.5, { maxWidth: w[7] - 1.2 });
      }
      doc.setFontSize(7);

      y += rowH;
    }

    y += 4;
  }

  drawFooter();
  doc.save(options?.filename ?? "inaccessible-deliverables.pdf");
}

/** One team block + reviewer rows for Judging → Assignments PDF export. */
export type AssignmentPdfGroup = {
  teamName: string;
  projectTitle?: string | null;
  finalized: boolean;
  rows: {
    reviewer: string;
    email: string;
    assigner: string;
    assignedAt: string;
    grade: string;
    slot: string;
  }[];
};

/**
 * Judging assignments: grouped by team, one table per team (current filtered list).
 */
export function exportAssignmentsPdf(
  groups: AssignmentPdfGroup[],
  options?: { filename?: string; generatedAt?: string },
) {
  if (groups.length === 0) return;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const margin = 10;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const innerW = pageW - margin * 2;

  const rowH = 6;
  const headerH = 7;
  const sectionTitleH = 8;
  const sectionGap = 4;
  const footRoom = 10;

  const labels = ["Reviewer", "Email", "Assigned by", "Assigned", "Grade", "Slot"] as const;
  const cols = [36, 58, 34, 38, 28, 22];
  const sum = cols.reduce((a, b) => a + b, 0);
  const scale = innerW / sum;
  const w = cols.map((c) => c * scale);
  const colX: number[] = [];
  let acc = margin;
  for (let i = 0; i < w.length; i++) {
    colX.push(acc);
    acc += w[i];
  }

  const totalRows = groups.reduce((n, g) => n + g.rows.length, 0);
  let page = 1;
  let y = margin;

  const drawFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(`TiC Portal · Assignments · ${groups.length} team(s) · ${totalRows} row(s)`, margin, pageH - 5);
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
  doc.text("Reviewer assignments", margin, y + 5);
  y += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 55, 55);
  const gen = options?.generatedAt ?? new Date().toISOString();
  doc.text(`Generated: ${new Date(gen).toLocaleString()}`, margin, y + 3);
  y += 10;
  doc.setTextColor(0, 0, 0);

  for (const g of groups) {
    const titleBlock =
      sectionTitleH +
      (g.projectTitle?.trim() ? 5 : 0) +
      2 +
      headerH +
      g.rows.length * rowH +
      sectionGap;
    ensureSpace(titleBlock);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(trunc(g.teamName, 100), margin, y + 5);
    y += sectionTitleH - 1;

    if (g.projectTitle?.trim()) {
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      const ptLines = doc.splitTextToSize(trunc(g.projectTitle.trim(), 200), innerW);
      for (let li = 0; li < ptLines.length; li++) {
        doc.text(ptLines[li], margin, y + 3 + li * 3.8);
      }
      y += ptLines.length * 3.8 + 2;
      doc.setTextColor(0, 0, 0);
    }

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(g.finalized ? 22 : 100, g.finalized ? 163 : 100, g.finalized ? 74 : 100);
    doc.text(g.finalized ? "Team finalized" : "Not finalized", margin, y + 3);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    y += 6;

    drawTableHeader(y);
    y += headerH;

    for (let ri = 0; ri < g.rows.length; ri++) {
      const r = g.rows[ri];
      if (y + rowH > pageH - margin - footRoom) {
        drawFooter();
        doc.addPage();
        page += 1;
        y = margin;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`${trunc(g.teamName, 80)} (continued)`, margin, y + 5);
        y += 8;
        doc.setFont("helvetica", "normal");
        drawTableHeader(y);
        y += headerH;
      }

      if (ri % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, innerW, rowH, "F");
      }

      const cells = [
        trunc(r.reviewer, 42),
        trunc(r.email, 48),
        trunc(r.assigner, 28),
        trunc(r.assignedAt, 36),
        trunc(r.grade, 22),
        trunc(r.slot, 18),
      ];

      doc.setFontSize(7.5);
      for (let c = 0; c < cells.length; c++) {
        doc.text(cells[c], colX[c] + 0.6, y + 4.2, { maxWidth: w[c] - 1.2 });
      }

      y += rowH;
    }

    y += sectionGap;
  }

  drawFooter();
  doc.save(options?.filename ?? "assignments.pdf");
}
