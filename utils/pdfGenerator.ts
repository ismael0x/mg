
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, CompanyInfo, Client, DocType } from '../types';
import { formatCurrency, numberToFrenchWords } from './helpers';

export const generateDocumentPDF = (doc: Document, company: CompanyInfo, client: Client | undefined) => {
  const pdf = new jsPDF();
  const isInvoice = doc.type === DocType.INVOICE;
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;

  // Colors
  const primaryColor = [44, 62, 80]; // Dark blue/slate from image
  const secondaryColor = [100, 116, 139]; // Slate 500

  // --- HEADER SECTION ---
  // Left Side: Company Info
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(company.name, 20, 25);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  pdf.text(company.activity, 20, 33);
  pdf.text(company.address, 20, 38);
  pdf.text(`Tél: ${company.phones.join(' / ')}`, 20, 43);
  if (company.email) {
    pdf.text(company.email, 20, 48);
  }

  // Right Side: Document Title & Ref
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  
  // Requirement 1: Slightly reduce font size for "BON DE LIVRAISON"
  const titleFontSize = isInvoice ? 22 : 18; 
  pdf.setFontSize(titleFontSize);
  pdf.setFont('helvetica', 'normal');
  pdf.text(doc.type.toUpperCase(), 140, 25);
  
  pdf.setFontSize(11);
  pdf.text(`N°: ${doc.number}`, 140, 33);
  pdf.text(`Date: ${new Date(doc.date).toLocaleDateString('fr-FR')}`, 140, 39);

  // --- CLIENT BOX ---
  const clientX = 120;
  const clientY = 55;
  const clientWidth = 75;
  const clientHeight = 35;
  
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(clientX, clientY, clientWidth, clientHeight);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text('CLIENT:', clientX + 5, clientY + 8);
  
  pdf.setFont('helvetica', 'normal');
  pdf.text(client?.name || doc.clientName, clientX + 5, clientY + 16);
  pdf.text(`ICE: ${client?.ice || 'N/A'}`, clientX + 5, clientY + 23);
  
  // Fix: Property 'address' does not exist on type 'Client'. Did you mean 'adresse'?
  const clientAddr = client?.adresse || 'N/A';
  pdf.text(clientAddr, clientX + 5, clientY + 30, { maxWidth: clientWidth - 10 });

  // --- TABLE SECTION ---
  const tableHeaders = isInvoice 
    ? [['Désignation', 'Qté', 'P.U HT', 'Total HT']]
    : [['Désignation', 'Quantité']];

  const tableData = doc.items.map(item => isInvoice 
    ? [item.name, item.quantity, formatCurrency(item.priceHT), formatCurrency(item.quantity * item.priceHT)]
    : [item.name, item.quantity]
  );

  autoTable(pdf, {
    startY: 100,
    head: tableHeaders,
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [30, 50, 80] as [number, number, number],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
      lineWidth: 0.1,
      lineColor: [200, 200, 200]
    },
    bodyStyles: {
      textColor: [50, 50, 50],
      fontSize: 9,
      lineWidth: 0.1,
      lineColor: [220, 220, 220]
    },
    columnStyles: isInvoice ? {
        0: { cellWidth: 100 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
    } : {
        0: { cellWidth: 150 },
        1: { cellWidth: 40, halign: 'center' },
    },
    margin: { bottom: 70 }
  });

  const finalY = (pdf as any).lastAutoTable.finalY;

  // --- TOTALS SECTION (Invoices only) ---
  if (isInvoice) {
    const totalX = 140;
    const valueX = pageWidth - 20;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    
    pdf.text('TOTAL HT:', totalX, finalY + 12);
    pdf.text(formatCurrency(doc.totalHT), valueX, finalY + 12, { align: 'right' });
    
    pdf.text(`TVA (${company.vatRate}%):`, totalX, finalY + 19);
    pdf.text(formatCurrency(doc.totalTVA), valueX, finalY + 19, { align: 'right' });

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TOTAL TTC:', totalX, finalY + 30);
    pdf.text(formatCurrency(doc.totalTTC), valueX, finalY + 30, { align: 'right' });

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    pdf.text(`Arrêté la présente facture à la somme de :`, 20, finalY + 45);
    pdf.setFont('helvetica', 'bolditalic');
    const words = numberToFrenchWords(doc.totalTTC).toUpperCase();
    pdf.text(words, 20, finalY + 51, { maxWidth: 170 });
  } else {
    // Requirement 2: Add "Signature Client" zone for Delivery Slips
    const sigWidth = 60;
    const sigHeight = 25;
    const sigX = 20; // Aligned left as per common practice, or could use pageWidth - sigWidth - 20
    const sigY = finalY + 15;

    // Draw background/border for signature
    pdf.setDrawColor(220, 220, 220);
    pdf.setFillColor(250, 250, 250);
    // roundedRect(x, y, w, h, rx, ry, style)
    (pdf as any).roundedRect(sigX, sigY, sigWidth, sigHeight, 3, 3, 'FD');

    // Label
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('Signature Client', sigX + (sigWidth / 2), sigY + 6, { align: 'center' });
  }

  // --- FOOTER SECTION ---
  const footerY = pageHeight - 25;
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(150, 150, 150);
  
  const footerLines = [
    `${company.name} - ICE: ${company.ice} - R.C RABAT n° ${company.rc} - IF: ${company.if}`,
    `Adresse: ${company.address}`,
    `Coordonnées Bancaires: ${company.bankDetails}`
  ];

  footerLines.forEach((line, index) => {
    const textWidth = pdf.getTextWidth(line);
    pdf.text(line, (pageWidth - textWidth) / 2, footerY + (index * 4));
  });

  pdf.save(`${doc.type}-${doc.number}.pdf`);
};
