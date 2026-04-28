import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates a professional PDF Proposal/Estimate from the Job Estimator.
 * Handles both Single Product and Multi-Product Project modes.
 * 
 * @param {Object} data - The estimate data
 * @param {String} mode - 'single' | 'project'
 */
export function generateEstimatePDF(data, mode) {
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

  // --- DOCUMENT LABEL ---
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...white);
  doc.text('PROPOSAL', pageWidth - margin, 20, { align: 'right' });

  // --- ESTIMATE REFERENCE ---
  const refNum = `EST-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...muted);
  doc.text(refNum, pageWidth - margin, 32, { align: 'right' });
  doc.text(new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }), pageWidth - margin, 38, { align: 'right' });

  // --- COMPANY INFO ---
  doc.setFillColor(...card);
  doc.rect(0, 50, pageWidth, 0.5, 'F');
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text('Brandline Advertising | Lahore, Pakistan | info@brandline.pk | brandline.pk', margin + 6, 58);

  // --- CLIENT INFO ---
  doc.setFontSize(8);
  doc.setTextColor(...green);
  doc.setFont('helvetica', 'bold');
  doc.text('PREPARED FOR', margin + 6, 72);

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(12);
  doc.text(data.clientName || 'Valued Client', margin + 6, 80);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  if (data.clientContact) doc.text(data.clientContact, margin + 6, 86);
  if (data.projectName) doc.text(`Project: ${data.projectName}`, margin + 6, 92);

  // --- LINE ITEMS TABLE ---
  let tableRows = [];
  if (mode === 'single') {
    tableRows = [[
      data.product.name,
      data.quantity.toString(),
      `PKR ${(data.estimate.totalProposal / data.quantity).toLocaleString('en-PK')}`,
      `PKR ${data.estimate.totalProposal.toLocaleString('en-PK')}`
    ]];
  } else {
    tableRows = (data.projectCalculations.productBreakdown || []).map(pb => [
      pb.name,
      pb.quantity.toString(),
      `PKR ${(pb.costs.totalProposal / pb.quantity).toLocaleString('en-PK')}`,
      `PKR ${pb.costs.totalProposal.toLocaleString('en-PK')}`
    ]);
  }

  autoTable(doc, {
    startY: 105,
    head: [['Product Description', 'Qty', 'Unit Rate', 'Total Amount']],
    body: tableRows,
    margin: { left: margin + 6, right: margin },
    headStyles: { fillColor: green, textColor: white, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
    },
  });

  // --- TOTALS ---
  const finalY = doc.lastAutoTable.finalY + 10;
  const totalAmount = mode === 'single' ? data.estimate.totalProposal : data.projectCalculations.totalProposal;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...dark);
  doc.text('Proposal Subtotal:', pageWidth - margin - 80, finalY);
  doc.text(`PKR ${totalAmount.toLocaleString('en-PK')}`, pageWidth - margin, finalY, { align: 'right' });

  doc.setFontSize(14);
  doc.setTextColor(...green);
  doc.text('TOTAL INVESTMENT:', pageWidth - margin - 80, finalY + 10);
  doc.text(`PKR ${totalAmount.toLocaleString('en-PK')}`, pageWidth - margin, finalY + 10, { align: 'right' });

  // --- TIMELINE ---
  const timelineY = finalY + 30;
  const maxDays = mode === 'single' ? data.estimate.totalDays : data.projectCalculations.maxDays;
  
  doc.setFillColor(245, 250, 247);
  doc.roundedRect(margin + 6, timelineY, pageWidth - margin * 2 - 6, 15, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setTextColor(...green);
  doc.text(`Estimated Production Timeline: ${maxDays} Working Days`, margin + 12, timelineY + 9.5);

  // --- TERMS & CONDITIONS ---
  const termsY = timelineY + 25;
  doc.setFontSize(8);
  doc.setTextColor(...green);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS & CONDITIONS', margin + 6, termsY);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('1. All rates are subject to 0% Tax (Exempt/Inclusive).', margin + 6, termsY + 6);
  doc.text('2. 50% advance payment required to initiate production.', margin + 6, termsY + 11);
  doc.text('3. Remaining balance due on successful delivery.', margin + 6, termsY + 16);
  doc.text('4. This proposal is valid for 30 days from the issue date.', margin + 6, termsY + 21);

  // --- FOOTER ---
  doc.setFillColor(...dark);
  doc.rect(0, 272, pageWidth, 25, 'F');
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text('Generated by Brandline Advertising AI Job Estimator', pageWidth / 2, 282, { align: 'center' });
  doc.text('For queries contact: info@brandline.pk | brandline.pk', pageWidth / 2, 288, { align: 'center' });

  // --- SAVE ---
  const fileName = data.projectName ? `Proposal-${data.projectName}.pdf` : `Brandline-Estimate.pdf`;
  doc.save(fileName);
}
