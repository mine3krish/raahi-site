const XLSX = require('xlsx');
const path = require('path');

// Sample data for the template
const sampleData = [
  {
    schemaName: "Luxury Villa in Goa",
    newListingId: "PROP001",
    type: "Residential",
    location: "Candolim Beach Road, Near Fort Aguada, Candolim, Goa",
    state: "Goa",
    reservePrice: 15000000,
    EMD: 1500000,
    AuctionDate: "2025-02-15",
    area: 2500,
    description: "Beautiful 4BHK beachfront villa with private pool, garden, and modern amenities. Prime location near popular beaches.",
    images: "villa1.jpg,villa2.jpg,villa3.jpg",
    notice: "Bank Auction - SARFAESI Act"
  },
  {
    schemaName: "",
    newListingId: "",
    type: "Commercial",
    location: "MG Road, Near Metro Station, Bangalore",
    state: "Karnataka",
    reservePrice: 25000000,
    EMD: 2500000,
    AuctionDate: "2025-03-01",
    area: 3000,
    description: "Prime commercial space in heart of Bangalore, high footfall area, suitable for retail or office",
    images: "shop1.png,shop2.jpg",
    notice: ""
  },
  {
    schemaName: "Agricultural Land - Pune",
    newListingId: "PROP003",
    type: "Agricultural",
    location: "Village Wagholi, Taluka Haveli, Pune District, Maharashtra",
    state: "Maharashtra",
    reservePrice: 5000000,
    EMD: 500000,
    AuctionDate: "2025-02-20",
    area: 43560,
    description: "1 acre agricultural land with water facility, suitable for farming or investment",
    images: "land1.jpg",
    notice: "Clear Title"
  },
  {
    schemaName: "",
    newListingId: "",
    type: "Residential",
    location: "Sector 62, Noida, Uttar Pradesh",
    state: "Uttar Pradesh",
    reservePrice: 8500000,
    EMD: 850000,
    AuctionDate: "2025-03-10",
    area: 1800,
    description: "3BHK apartment in gated community with all modern amenities, park facing",
    images: "",
    notice: "As is where is basis"
  }
];

// Create workbook and worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(sampleData);

// Set column widths
const colWidths = [
  { wch: 25 }, // schemaName
  { wch: 15 }, // newListingId
  { wch: 15 }, // type
  { wch: 50 }, // location
  { wch: 15 }, // state
  { wch: 15 }, // reservePrice
  { wch: 12 }, // EMD
  { wch: 12 }, // AuctionDate
  { wch: 10 }, // area
  { wch: 60 }, // description
  { wch: 30 }, // images
  { wch: 25 }, // notice
];
ws['!cols'] = colWidths;

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Properties');

// Write to file
const outputPath = path.join(__dirname, '..', 'property-import-template.xlsx');
XLSX.writeFile(wb, outputPath);

console.log('✓ Sample Excel template created successfully at:', outputPath);
console.log('\nColumn descriptions:');
console.log('- schemaName: Custom property name (optional, AI generates if empty)');
console.log('- newListingId: Custom property ID (optional, random ID if empty)');
console.log('- type: Property type (Residential/Commercial/Agricultural/Industrial)');
console.log('- location: Full property address');
console.log('- state: Indian state name');
console.log('- reservePrice: Reserve price in INR');
console.log('- EMD: Earnest Money Deposit (optional, defaults to 10% of reserve price)');
console.log('- AuctionDate: Auction date (YYYY-MM-DD format recommended)');
console.log('- area: Property area in square feet (optional)');
console.log('- description: Detailed description (helps AI generate better names)');
console.log('- images: Comma-separated image filenames (optional, must be in ZIP file)');
console.log('- notice: Additional notices or information (optional)');
