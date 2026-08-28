import type jsPDF from "jspdf";

import pdfLogo from "@/assets/images/pdf-logo.png";

export const loadParishPdfLogo = () =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Unable to load the parish logo for export."));
    image.src = pdfLogo;
  });

export function drawParishPdfLetterhead(doc: jsPDF, logo: HTMLImageElement) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const archdiocese = "ARCHDIOCESE OF LIPA";
  const parish = "ST. LORENZO RUIZ PARISH";
  const address =
    "PUROK 4, BRGY. DAGATAN, TAYSAN, BATANGAS | 4228 PHILIPPINES";

  doc.setTextColor(25, 25, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  const archdioceseWidth = doc.getTextWidth(archdiocese);
  doc.setFontSize(11);
  const parishWidth = doc.getTextWidth(parish);
  doc.setFontSize(6.2);
  const addressWidth = doc.getTextWidth(address);

  const logoSize = 21;
  const logoTextGap = 4;
  const headingWidth = Math.max(
    archdioceseWidth,
    parishWidth,
    addressWidth,
  );
  const groupWidth = logoSize + logoTextGap + headingWidth;
  const groupX = (pageWidth - groupWidth) / 2;
  const headingCenter = groupX + logoSize + logoTextGap + headingWidth / 2;

  doc.addImage(logo, "PNG", groupX, 1.5, logoSize, logoSize, undefined, "FAST");
  doc.setFontSize(7.2);
  doc.text(archdiocese, headingCenter, 7.5, { align: "center" });
  doc.setFontSize(11);
  doc.text(parish, headingCenter, 13.5, { align: "center" });
  doc.setFontSize(6.2);
  doc.text(address, headingCenter, 18, { align: "center" });
}
