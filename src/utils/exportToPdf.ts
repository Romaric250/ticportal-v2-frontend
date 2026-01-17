import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportPortfolioToPDF(elementId: string, filename: string = "portfolio.pdf") {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Element not found for PDF export");
  }

  try {
    // Show loading state
    const loadingToast = document.createElement("div");
    loadingToast.className = "fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50";
    loadingToast.textContent = "Generating PDF...";
    document.body.appendChild(loadingToast);

    // Create canvas from element
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

    // Calculate number of pages needed
    const totalPages = Math.ceil(imgScaledHeight / pdfHeight);

    // Add first page
    pdf.addImage(imgData, "PNG", 0, 0, imgScaledWidth, imgScaledHeight);

    // Add additional pages if needed
    for (let i = 1; i < totalPages; i++) {
      pdf.addPage();
      const yPosition = -(i * pdfHeight);
      pdf.addImage(imgData, "PNG", 0, yPosition, imgScaledWidth, imgScaledHeight);
    }

    // Remove loading toast
    document.body.removeChild(loadingToast);

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}
