export const clients = [
  { id: 1, name: "Ahmed Raza", company: "Shan Foods Pvt Ltd", phone: "0300-1234567", email: "ahmed@shanfoods.com", totalJobs: 14, lastOrder: "15 Mar 2026", outstanding: 45000, status: "Active" },
  { id: 2, name: "Sara Malik", company: "Engro Corporation", phone: "0321-9876543", email: "sara@engro.com", totalJobs: 9, lastOrder: "10 Mar 2026", outstanding: 0, status: "Active" },
  { id: 3, name: "Bilal Hussain", company: "Packages Ltd", phone: "0333-4567890", email: "bilal@packages.com", totalJobs: 21, lastOrder: "18 Mar 2026", outstanding: 120000, status: "Active" },
  { id: 4, name: "Nadia Khan", company: "Gul Ahmed Textile", phone: "0345-6543210", email: "nadia@gulahmad.com", totalJobs: 6, lastOrder: "01 Feb 2026", outstanding: 0, status: "Inactive" },
  { id: 5, name: "Usman Tariq", company: "Dawlance", phone: "0311-2233445", email: "usman@dawlance.com", totalJobs: 11, lastOrder: "12 Mar 2026", outstanding: 67500, status: "Active" },
  { id: 6, name: "Hira Baig", company: "Metro Cash & Carry", phone: "0322-5544332", email: "hira@metro.com.pk", totalJobs: 17, lastOrder: "19 Mar 2026", outstanding: 15000, status: "Active" }
];

export const inquiries = [
  { id: 1, client: "Faisal Ahmed", jobType: "Exhibition Stall", date: "Today", rep: "Ali Hassan", priority: "High", stage: "New Inquiry" },
  { id: 2, client: "Zara Textiles", jobType: "Flex Banner x200", date: "Yesterday", rep: "Maria Khan", priority: "Medium", stage: "New Inquiry" },
  { id: 3, client: "Pepsi Pakistan", jobType: "Vehicle Wrap x12", date: "16 Mar", rep: "Ali Hassan", priority: "High", stage: "Contacted" },
  { id: 4, client: "National Foods", jobType: "Brochure x5000", date: "15 Mar", rep: "Sara Ahmed", priority: "Medium", stage: "Contacted" },
  { id: 5, client: "Unilever Pakistan", jobType: "Shop Signage", date: "12 Mar", rep: "Maria Khan", priority: "High", stage: "Quoted" },
  { id: 6, client: "Telenor", jobType: "Standee x50", date: "10 Mar", rep: "Ali Hassan", priority: "Low", stage: "Quoted" },
  { id: 7, client: "HBL Bank", jobType: "Branch Branding Package", date: "05 Mar", rep: "Sara Ahmed", priority: "High", stage: "Converted" },
  { id: 8, client: "Jazz Telecom", jobType: "Billboard Campaign", date: "01 Mar", rep: "Maria Khan", priority: "Medium", stage: "Lost" }
];

export const quotes = [
  { id: "QT-2026-018", client: "Shan Foods", jobType: "Exhibition Stall", amount: 485000, status: "Approved", date: "15 Mar" },
  { id: "QT-2026-017", client: "Engro Corporation", jobType: "Vehicle Wrap x8", amount: 224000, status: "Sent", date: "14 Mar" },
  { id: "QT-2026-016", client: "Packages Ltd", jobType: "Flex Banner x500", amount: 87500, status: "Approved", date: "12 Mar" },
  { id: "QT-2026-015", client: "Dawlance", jobType: "Shop Signage x3", amount: 156000, status: "Rejected", date: "08 Mar" },
  { id: "QT-2026-014", client: "Metro Cash & Carry", jobType: "Brochure x10000", amount: 45000, status: "Draft", date: "05 Mar" }
];

export const jobs = [
  { id: "BL-2026-047", client: "Shan Foods", jobType: "Exhibition Stall", qty: "1 unit", stage: "Production", priority: "HIGH", deadline: "25 Mar 2026", assigned: "Design Team A" },
  { id: "BL-2026-046", client: "Engro Corp", jobType: "Vehicle Wrap", qty: "8 units", stage: "Design", priority: "HIGH", deadline: "28 Mar 2026", assigned: "Bilal (Designer)" },
  { id: "BL-2026-045", client: "Packages Ltd", jobType: "Flex Banner", qty: "500 units", stage: "Pre-Press", priority: "MEDIUM", deadline: "22 Mar 2026", assigned: "Pre-Press Team" },
  { id: "BL-2026-044", client: "HBL Bank", jobType: "Branch Branding", qty: "1 lot", stage: "Finishing", priority: "HIGH", deadline: "21 Mar 2026", assigned: "Finishing Team" },
  { id: "BL-2026-043", client: "Dawlance", jobType: "Shop Signage", qty: "3 units", stage: "QC", priority: "MEDIUM", deadline: "20 Mar 2026", assigned: "QC Team" },
  { id: "BL-2026-042", client: "Metro Cash & Carry", jobType: "Brochure", qty: "10,000 units", stage: "Dispatch", priority: "LOW", deadline: "19 Mar 2026", assigned: "Dispatch Team" }
];

export const designTasks = [
  { id: "BL-2026-047", client: "Shan Foods", jobType: "Exhibition Stall", assigned: "Design Team A", status: "In Progress", daysActive: 2, checks: { res: true, cmyk: true, bleed: false, dims: true, font: true, spot: true, resVal: 287 } },
  { id: "BL-2026-046", client: "Engro Corp", jobType: "Vehicle Wrap", assigned: "Bilal (Designer)", status: "Brief Received", daysActive: 1, checks: { res: true, cmyk: true, bleed: true, dims: true, font: true, spot: false, resVal: 300 } },
  { id: "BL-2026-045", client: "Packages Ltd", jobType: "Flex Banner", assigned: "Pre-Press Team", status: "Approved", daysActive: 4, checks: { res: true, cmyk: true, bleed: true, dims: true, font: true, spot: false, resVal: 300 } },
  { id: "BL-2026-044", client: "HBL Bank", jobType: "Branch Branding", assigned: "Finishing Team", status: "Ready for Review", daysActive: 3, checks: { res: true, cmyk: true, bleed: true, dims: true, font: true, spot: false, resVal: 300 } },
  { id: "BL-2026-043", client: "Dawlance", jobType: "Shop Signage", assigned: "QC Team", status: "In Progress", daysActive: 2, checks: { res: true, cmyk: true, bleed: true, dims: true, font: true, spot: false, resVal: 300 } },
  { id: "BL-2026-042", client: "Metro Cash & Carry", jobType: "Brochure", assigned: "Dispatch Team", status: "Approved", daysActive: 5, checks: { res: true, cmyk: true, bleed: true, dims: true, font: true, spot: false, resVal: 300 } }
];

export const approvals = [
  { id: "BL-2026-047", client: "Shan Foods", company: "Shan Foods Pvt Ltd", jobType: "Exhibition Stall", dateSent: "16 Mar", daysWaiting: 4, round: "Round 2", status: "Pending" },
  { id: "BL-2026-046", client: "Engro Corp", company: "Engro Corporation", jobType: "Vehicle Wrap", dateSent: "18 Mar", daysWaiting: 2, round: "Round 1", status: "Pending" },
  { id: "BL-2026-045", client: "Packages Ltd", company: "Packages Ltd", jobType: "Flex Banner", dateSent: "19 Mar", daysWaiting: 1, round: "Round 1", status: "Pending" },
  { id: "BL-2026-044", client: "HBL Bank", company: "HBL Bank", jobType: "Branch Branding", dateSent: "15 Mar", daysWaiting: 5, round: "Round 3", status: "Pending" },
  { id: "BL-2026-043", client: "Dawlance", company: "Dawlance", jobType: "Shop Signage", dateSent: "17 Mar", daysWaiting: 3, round: "Round 2", status: "Pending" },
  { id: "BL-2026-042", client: "Metro Cash & Carry", company: "Metro Cash & Carry", jobType: "Brochure", dateSent: "18 Mar", daysWaiting: 2, round: "Round 1", status: "Pending" },
  { id: "BL-2026-041", client: "Gul Ahmed Textile", company: "Gul Ahmed Textile", jobType: "Packaging", dateSent: "19 Mar", daysWaiting: 1, round: "Round 1", status: "Pending" }
];

export const invoices = [
  { id: "INV-2026-031", client: "HBL Bank", jon: "BL-2026-044", amount: 380000, status: "Paid", issueDate: "10 Mar", dueDate: "24 Mar" },
  { id: "INV-2026-030", client: "Shan Foods", jon: "BL-2026-047", amount: 485000, status: "Sent", issueDate: "15 Mar", dueDate: "29 Mar" },
  { id: "INV-2026-029", client: "Packages Ltd", jon: "BL-2026-045", amount: 87500, status: "Paid", issueDate: "08 Mar", dueDate: "22 Mar" },
  { id: "INV-2026-028", client: "Dawlance", jon: "BL-2026-043", amount: 156000, status: "Overdue", issueDate: "01 Mar", dueDate: "15 Mar" },
  { id: "INV-2026-027", client: "Metro C&C", jon: "BL-2026-042", amount: 45000, status: "Draft", issueDate: "18 Mar", dueDate: "01 Apr" }
];

export const dashboardCharts = {
  jobsCompleted: [
    { name: 'Week 1', value: 12 },
    { name: 'Week 2', value: 18 },
    { name: 'Week 3', value: 14 },
    { name: 'Week 4', value: 22 },
    { name: 'Week 5', value: 19 },
    { name: 'Week 6', value: 24 }
  ],
  jobStatus: [
    { name: 'In Production', value: 9, color: '#038D46' },
    { name: 'Pending Approval', value: 7, color: '#F59E0B' },
    { name: 'Dispatched', value: 5, color: '#3B82F6' },
    { name: 'Billing', value: 3, color: '#8B5CF6' }
  ]
};
