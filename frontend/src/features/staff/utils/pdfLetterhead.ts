import type jsPDF from "jspdf";

import parishLogo from "@/assets/images/parish-logo.png";

export const loadParishPdfLogo = () =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Unable to load the parish logo for export."));
    image.src = parishLogo;
  });

export function drawParishPdfLetterhead(doc: jsPDF, logo: HTMLImageElement) {
  const pageWidth = doc.internal.pageSize.getWidth();
  // The source PNG has transparent padding. This larger image box makes the
  // visible seal match the proportions of the printed parish form.
  const logoSize = 38;
  // Center the visible seal and heading as one unit, with the compact spacing
  // used by the printed form. Fixed offsets also work for portrait and
  // landscape exports.
  const logoCenter = pageWidth / 2 - 44;
  const logoX = logoCenter - logoSize / 2;
  const headingCenter = pageWidth / 2 + 17;

  doc.addImage(logo, "PNG", logoX, -3, logoSize, logoSize, undefined, "FAST");
  doc.setTextColor(25, 25, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text("ARCHDIOCESE OF LIPA", headingCenter, 8.5, { align: "center" });
  doc.setFontSize(11);
  doc.text("ST. LORENZO RUIZ PARISH", headingCenter, 14.5, { align: "center" });
  doc.setFontSize(6.2);
  doc.text(
    "PUROK 4, BRGY. DAGATAN, TAYSAN, BATANGAS | 4228 PHILIPPINES",
    headingCenter,
    19,
    { align: "center" },
  );
}
