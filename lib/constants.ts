// Indian States and Union Territories
export const INDIAN_STATES = [
  // States
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

export const PROPERTY_TYPES = [
  "Residential",
  "Commercial",
  "Land",
  "Industrial",
  "Vehicle",
  "Gold",
] as const;

export const PROPERTY_STATUSES = [
  "Active",
  "Sold",
  "Pending",
] as const;

// Format price in Indian number system
export function formatIndianPrice(amount: number): string {
  if (amount >= 10000000) {
    // Crores
    const crores = amount / 10000000;
    return `₹${crores.toFixed(2)}Cr`;
  } else if (amount >= 100000) {
    // Lakhs
    const lakhs = amount / 100000;
    return `₹${lakhs.toFixed(2)}L`;
  } else if (amount >= 1000) {
    // Thousands
    const thousands = amount / 1000;
    return `₹${thousands.toFixed(2)}K`;
  } else {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
}
