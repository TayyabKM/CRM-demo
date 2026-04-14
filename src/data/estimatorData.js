export const estimatorData = {
  "Exhibition Stall": {
    timeline: { design: 2, procurement: 3, production: 5, qc: 1, dispatch: 1 },
    totalDays: 12,
    materials: [
      { name: "Aluminium Frame", qty: 40, unit: "kg", unitCost: 850, inStock: "in_stock" },
      { name: "Fabric Printing (Dye Sub)", qty: 30, unit: "sqft", unitCost: 120, inStock: "in_stock" },
      { name: "LED Lighting Strip", qty: 10, unit: "meters", unitCost: 450, inStock: "low_stock" },
      { name: "MDF Board (18mm)", qty: 8, unit: "sheets", unitCost: 2200, inStock: "in_stock" },
      { name: "Acrylic Panel (5mm)", qty: 4, unit: "sheets", unitCost: 3500, inStock: "out_of_stock" },
      { name: "Hardware & Fixtures", qty: 1, unit: "lot", unitCost: 8000, inStock: "in_stock" }
    ],
    labourCost: 35000
  },
  "Shop Signage": {
    timeline: { design: 1, procurement: 2, production: 3, qc: 1, dispatch: 1 },
    totalDays: 8,
    materials: [
      { name: "Aluminium Composite Panel", qty: 20, unit: "sqft", unitCost: 180, inStock: "in_stock" },
      { name: "LED Module Strips", qty: 5, unit: "meters", unitCost: 600, inStock: "in_stock" },
      { name: "Vinyl Print (Backlit)", qty: 20, unit: "sqft", unitCost: 95, inStock: "in_stock" },
      { name: "MS Steel Frame", qty: 15, unit: "kg", unitCost: 320, inStock: "low_stock" },
      { name: "Power Supply Unit", qty: 2, unit: "pcs", unitCost: 2500, inStock: "in_stock" }
    ],
    labourCost: 18000
  },
  "Flex Banner": {
    timeline: { design: 1, procurement: 1, production: 1, qc: 0, dispatch: 1 },
    totalDays: 4,
    materials: [
      { name: "Flex Material (13oz)", qty: 100, unit: "sqft", unitCost: 28, inStock: "in_stock" },
      { name: "Ink (Solvent)", qty: 2, unit: "liters", unitCost: 3500, inStock: "in_stock" },
      { name: "Eyelets & Rope", qty: 1, unit: "lot", unitCost: 500, inStock: "in_stock" }
    ],
    labourCost: 3500
  },
  "Vehicle Wrap": {
    timeline: { design: 2, procurement: 1, production: 2, qc: 1, dispatch: 0 },
    totalDays: 6,
    materials: [
      { name: "Cast Vinyl (3M / Avery)", qty: 200, unit: "sqft", unitCost: 85, inStock: "in_stock" },
      { name: "Lamination Film", qty: 200, unit: "sqft", unitCost: 45, inStock: "in_stock" },
      { name: "Ink (Eco-Solvent)", qty: 3, unit: "liters", unitCost: 2800, inStock: "low_stock" },
      { name: "Application Fluid", qty: 2, unit: "bottles", unitCost: 800, inStock: "in_stock" }
    ],
    labourCost: 22000
  },
  "Standee": {
    timeline: { design: 1, procurement: 1, production: 1, qc: 0, dispatch: 1 },
    totalDays: 4,
    materials: [
      { name: "Aluminium Standee Base", qty: 1, unit: "pcs", unitCost: 3500, inStock: "in_stock" },
      { name: "Print Media (Glossy)", qty: 6, unit: "sqft", unitCost: 150, inStock: "in_stock" },
      { name: "Lamination (Gloss)", qty: 6, unit: "sqft", unitCost: 60, inStock: "in_stock" }
    ],
    labourCost: 2500
  },
  "Billboard": {
    timeline: { design: 2, procurement: 4, production: 6, qc: 1, dispatch: 2 },
    totalDays: 15,
    materials: [
      { name: "MS Steel Structure", qty: 200, unit: "kg", unitCost: 320, inStock: "in_stock" },
      { name: "Flex Frontlit (18oz)", qty: 400, unit: "sqft", unitCost: 35, inStock: "in_stock" },
      { name: "Welding Consumables", qty: 1, unit: "lot", unitCost: 5000, inStock: "in_stock" },
      { name: "Paint & Primer", qty: 10, unit: "liters", unitCost: 900, inStock: "low_stock" },
      { name: "Lighting (Flood)", qty: 4, unit: "pcs", unitCost: 8500, inStock: "out_of_stock" }
    ],
    labourCost: 85000
  },
  "Brochure": {
    timeline: { design: 1, procurement: 1, production: 2, qc: 1, dispatch: 1 },
    totalDays: 6,
    materials: [
      { name: "Art Paper (130gsm)", qty: 500, unit: "sheets", unitCost: 12, inStock: "in_stock" },
      { name: "Ink (CMYK Offset)", qty: 1, unit: "set", unitCost: 8500, inStock: "in_stock" },
      { name: "Lamination (Matt)", qty: 500, unit: "sheets", unitCost: 8, inStock: "in_stock" }
    ],
    labourCost: 6500
  },
  "Packaging": {
    timeline: { design: 2, procurement: 3, production: 4, qc: 1, dispatch: 1 },
    totalDays: 11,
    materials: [
      { name: "Duplex Board (400gsm)", qty: 200, unit: "sheets", unitCost: 65, inStock: "in_stock" },
      { name: "Ink (CMYK)", qty: 1, unit: "set", unitCost: 8500, inStock: "in_stock" },
      { name: "UV Coating", qty: 1, unit: "lot", unitCost: 6000, inStock: "low_stock" },
      { name: "Die Cut Mould", qty: 1, unit: "pcs", unitCost: 12000, inStock: "in_stock" }
    ],
    labourCost: 18000
  },
  "Window Graphics": {
    timeline: { design: 1, procurement: 1, production: 1, qc: 0, dispatch: 1 },
    totalDays: 4,
    materials: [
      { name: "Frosted Vinyl", qty: 50, unit: "sqft", unitCost: 75, inStock: "in_stock" },
      { name: "Perforated Vinyl", qty: 30, unit: "sqft", unitCost: 95, inStock: "in_stock" },
      { name: "Application Tape", qty: 2, unit: "rolls", unitCost: 600, inStock: "in_stock" }
    ],
    labourCost: 5000
  },
  "Kiosk": {
    timeline: { design: 2, procurement: 4, production: 7, qc: 2, dispatch: 1 },
    totalDays: 16,
    materials: [
      { name: "MS Steel Frame", qty: 80, unit: "kg", unitCost: 320, inStock: "in_stock" },
      { name: "ACP Cladding", qty: 40, unit: "sqft", unitCost: 180, inStock: "in_stock" },
      { name: "Acrylic Panels", qty: 6, unit: "sheets", unitCost: 3500, inStock: "low_stock" },
      { name: "LED Lighting", qty: 8, unit: "meters", unitCost: 450, inStock: "in_stock" },
      { name: "Digital Screen (21\")", qty: 1, unit: "pcs", unitCost: 45000, inStock: "out_of_stock" },
      { name: "Power & Wiring", qty: 1, unit: "lot", unitCost: 7500, inStock: "in_stock" }
    ],
    labourCost: 55000
  },
  "POP Rack & Stand": {
    timeline: { design: 1, procurement: 2, production: 3, qc: 1, dispatch: 1 },
    totalDays: 8,
    materials: [
      { name: "Wire / MS Rod", qty: 15, unit: "kg", unitCost: 380, inStock: "in_stock" },
      { name: "Powder Coating", qty: 1, unit: "lot", unitCost: 4500, inStock: "in_stock" },
      { name: "Header Print (Vinyl)", qty: 4, unit: "sqft", unitCost: 150, inStock: "in_stock" },
      { name: "Base Plate", qty: 1, unit: "pcs", unitCost: 1200, inStock: "in_stock" }
    ],
    labourCost: 9000
  },
  "Promotional Float": {
    timeline: { design: 3, procurement: 5, production: 10, qc: 2, dispatch: 2 },
    totalDays: 22,
    materials: [
      { name: "MS Steel Chassis", qty: 300, unit: "kg", unitCost: 320, inStock: "in_stock" },
      { name: "Foam & Fibreglass", qty: 1, unit: "lot", unitCost: 35000, inStock: "low_stock" },
      { name: "Paint (Automotive)", qty: 15, unit: "liters", unitCost: 2200, inStock: "in_stock" },
      { name: "LED & Electrical", qty: 1, unit: "lot", unitCost: 18000, inStock: "in_stock" },
      { name: "Fabric & Branding", qty: 100, unit: "sqft", unitCost: 120, inStock: "out_of_stock" }
    ],
    labourCost: 120000
  }
};
