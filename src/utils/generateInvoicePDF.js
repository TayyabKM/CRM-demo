import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a professional PDF invoice using jsPDF and jsPDF-autotable.
 * Styled with Brandline AI dark/green aesthetic.
 * 
 * @param {Object} invoice - The invoice document object from Firestore
 */
export function generateInvoicePDF(invoice) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // --- COLOR PALETTE ---
  const green = [3, 141, 70];      // #038D46
  const dark = [49, 49, 49];       // #313131
  const card = [62, 62, 62];       // #3E3E3E  
  const white = [251, 252, 251];   // #FBFCFB
  const muted = [160, 160, 160];   // #A0A0A0

  // --- HEADER BACKGROUND ---
  doc.setFillColor(...dark);
  doc.rect(0, 0, pageWidth, 50, 'F');

  // --- GREEN ACCENT BAR ---
  doc.setFillColor(...green);
  doc.rect(0, 0, 6, 297, 'F');

  // --- BRANDLINE TEXT LOGO ---
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...green);
  doc.text('Brand', margin + 6, 22);
  
  doc.setTextColor(...white);
  doc.text('Line', margin + 6 + doc.getTextWidth('Brand'), 22);

  // --- INVOICE LABEL ---
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...white);
  doc.text('INVOICE', pageWidth - margin, 20, { align: 'right' });

  // --- INVOICE NUMBER ---
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...muted);
  doc.text(invoice.invoiceNumber, pageWidth - margin, 29, { align: 'right' });

  // --- DATES ---
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  
  const formatDate = (val) => {
    if (!val) return '—';
    const date = val.toDate ? val.toDate() : new Date(val);
    return date.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const issueDateStr = formatDate(invoice.issueDate);
  const dueDateStr = formatDate(invoice.dueDate);

  doc.text(`Issue Date: ${issueDateStr}`, pageWidth - margin, 36, { align: 'right' });
  doc.text(`Due Date: ${dueDateStr}`, pageWidth - margin, 42, { align: 'right' });

  // --- COMPANY ADDRESS ---
  doc.setFillColor(...card);
  doc.rect(0, 50, pageWidth, 0.5, 'F');

  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text(
    'Brandline Advertising | Lahore, Pakistan | info@brandline.pk | brandline.pk',
    margin + 6, 58
  );

  // --- BILL TO SECTION ---
  doc.setFontSize(8);
  doc.setTextColor(...green);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', margin + 6, 72);

  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(invoice.clientName || 'Valued Client', margin + 6, 80);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  
  let billY = 86;
  if (invoice.clientCompany && invoice.clientCompany !== invoice.clientName) {
    doc.text(invoice.clientCompany, margin + 6, billY);
    billY += 5;
  }
  if (invoice.clientEmail) {
    doc.text(invoice.clientEmail, margin + 6, billY);
    billY += 5;
  }
  if (invoice.clientPhone) {
    doc.text(invoice.clientPhone, margin + 6, billY);
  }

  // --- PROJECT REFERENCE ---
  doc.setFontSize(8);
  doc.setTextColor(...green);
  doc.setFont('helvetica', 'bold');
  doc.text('PROJECT REFERENCE', pageWidth - margin - 60, 72);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  doc.text(invoice.projectName || '—', pageWidth - margin - 60, 80);
  doc.text(invoice.projectNumber || '—', pageWidth - margin - 60, 86);

  // --- LINE ITEMS TABLE ---
  const tableStartY = Math.max(billY, 86) + 20;
  
  const tableRows = (invoice.lineItems || []).map(item => [
    item.description,
    item.quantity.toString(),
    `PKR ${item.unitPrice.toLocaleString('en-PK')}`,
    `PKR ${item.total.toLocaleString('en-PK')}`
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [['Description', 'Qty', 'Unit Price', 'Amount']],
    body: tableRows,
    margin: { left: margin + 6, right: margin },
    headStyles: {
      fillColor: green,
      textColor: white,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
    },
  });

  // --- TOTALS SECTION ---
  const finalY = doc.lastAutoTable.finalY + 8;
  const totalsX = pageWidth - margin - 80;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Subtotal:', totalsX, finalY);
  doc.text(
    `PKR ${(invoice.subtotal || 0).toLocaleString('en-PK')}`,
    pageWidth - margin, finalY, { align: 'right' }
  );

  doc.text('Tax:', totalsX, finalY + 6);
  doc.text('PKR 0 (Exempt)', pageWidth - margin, finalY + 6, { align: 'right' });

  doc.setDrawColor(...green);
  doc.setLineWidth(0.5);
  doc.line(totalsX, finalY + 9, pageWidth - margin, finalY + 9);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...green);
  doc.text('TOTAL:', totalsX, finalY + 17);
  doc.text(
    `PKR ${(invoice.totalAmount || 0).toLocaleString('en-PK')}`,
    pageWidth - margin, finalY + 17, { align: 'right' }
  );

  // --- PAYMENT TERMS ---
  const termsY = finalY + 35;
  doc.setFillColor(245, 250, 247);
  doc.roundedRect(margin + 6, termsY, pageWidth - margin * 2 - 6, 22, 2, 2, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...green);
  doc.text('PAYMENT TERMS', margin + 10, termsY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(
    invoice.paymentTerms || '50% advance payment required. Balance due on delivery.',
    margin + 10, termsY + 13
  );

  // --- BANK DETAILS ---
  const bankY = termsY + 30;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...green);
  doc.text('BANK DETAILS', margin + 6, bankY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Bank: Meezan Bank Limited', margin + 6, bankY + 6);
  doc.text('Account Title: Brandline Advertising', margin + 6, bankY + 11);
  doc.text('Account No: 0123-4567890-1', margin + 6, bankY + 16);
  doc.text('IBAN: PK12MEZN0001230123456789', margin + 6, bankY + 21);

  // --- NOTES ---
  if (invoice.notes) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...green);
    doc.text('NOTES', margin + 6, bankY + 32);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(invoice.notes, margin + 6, bankY + 38, { maxWidth: pageWidth - margin * 2 - 6 });
  }

  // --- FOOTER ---
  const footerY = 272;
  doc.setFillColor(...dark);
  doc.rect(0, footerY, pageWidth, 25, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...muted);
  doc.text(
    'This is a system-generated invoice from Brandline AI.',
    pageWidth / 2, footerY + 8, { align: 'center' }
  );
  doc.text(
    'For queries contact: info@brandline.pk | brandline.pk',
    pageWidth / 2, footerY + 14, { align: 'center' }
  );

  // --- WATERMARK ---
  if (invoice.status === 'paid') {
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(3, 141, 70, 0.15);
    doc.text('PAID', pageWidth / 2, 180, { align: 'center', angle: 45 });
  } else if (invoice.status === 'cancelled') {
    doc.setFontSize(45);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(239, 68, 68, 0.15);
    doc.text('CANCELLED', pageWidth / 2, 180, { align: 'center', angle: 45 });
  }

  // --- SAVE PDF ---
  const fileName = invoice.pdfFileName || `Brandline-${invoice.invoiceNumber}.pdf`;
  doc.save(fileName);
}
