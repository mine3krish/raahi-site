# Raahi Auction Site

A comprehensive auction platform for properties built with Next.js, featuring an admin panel with bulk import capabilities.

## Features

- 🏠 **Property Listings** - Browse properties by state, type, and status
- 🔐 **Authentication** - Secure login/signup with JWT
- 📊 **Admin Panel** - Manage properties, users, agents, communities, and contacts
- 📤 **Bulk Import** - Import multiple properties from Excel with AI-generated names
- 🖼️ **Image Processing** - Automatic image optimization and ZIP support
- 🤖 **AI Integration** - OpenAI-powered property name generation
- 💝 **Wishlist** - Save favorite properties
- 📱 **Responsive Design** - Mobile-friendly interface
- 🗺️ **Interactive Map** - State-wise property visualization

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB
- OpenAI API key (for bulk import feature)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd raahi-site
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```bash
MONGODB_URI=mongodb://localhost:27017/raahi-auction
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=sk-your-openai-api-key-here
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Bulk Import Feature

### Overview
The admin panel includes a powerful bulk import feature that allows importing multiple properties from Excel files with optional image uploads via ZIP files.

### Usage

1. Navigate to **Admin Panel → Properties**
2. Click **📤 Import Excel** button
3. Upload your Excel file (required)
4. Optionally upload a ZIP file containing property images
5. Click **Import Properties**

### Excel Format

**Required Columns:**
- `type` - Property type (Residential/Commercial/Agricultural/Industrial)
- `location` - Full address
- `state` - Indian state name
- `reservePrice` - Reserve price in INR
- `AuctionDate` - Auction date

**Optional Columns:**
- `schemaName` - Custom property name (AI generates if empty)
- `newListingId` - Custom property ID (random if empty)
- `EMD` - Earnest Money Deposit (defaults to 10% of reserve price)
- `area` - Property area in square feet
- `description` - Detailed description (improves AI name generation)
- `images` - Comma-separated image filenames (e.g., "img1.jpg, img2.png")
- `notice` - Additional notices

### Sample Template

A sample Excel template is available at `property-import-template.xlsx`. You can generate it by running:

```bash
node scripts/create-template.js
```

### Image Handling

- **Supported Formats:** JPG, PNG, WEBP
- **ZIP Structure:** Images can be in any folder structure within the ZIP
- **Matching:** Images are matched by filename (case-insensitive)
- **Placeholder:** Properties without images get a placeholder automatically

### AI Name Generation

When `schemaName` is not provided, OpenAI GPT-4 generates professional property names based on:
- Property type
- Location  
- Description

Example: "Luxury 4BHK Villa in Candolim, Goa with Private Pool"

### Import Results

After import, you'll see:
- ✓ Successfully imported properties
- ⚠ Duplicates skipped (existing IDs)
- ✗ Failed imports with error details

For detailed documentation, see [IMPORT_GUIDE.md](./IMPORT_GUIDE.md)

## Project Structure

```
├── app/
│   ├── admin/          # Admin panel pages
│   ├── api/            # API routes
│   ├── properties/     # Property pages
│   └── ...
├── components/         # React components
├── context/           # Context providers
├── lib/               # Utilities
├── models/            # MongoDB models
├── public/            # Static assets
└── scripts/           # Utility scripts
```

## Tech Stack

- **Framework:** Next.js 16
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT with bcrypt
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **AI:** OpenAI GPT-4
- **Image Processing:** Sharp
- **Data Processing:** xlsx, adm-zip

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `node scripts/create-placeholder.js` - Generate placeholder image
- `node scripts/create-template.js` - Generate Excel template

## API Endpoints

### Public
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/properties` - List properties
- `GET /api/properties/[id]` - Get property details

### Admin (requires authentication)
- `GET /api/admin/properties` - List all properties
- `POST /api/admin/properties` - Create property
- `POST /api/admin/properties/import` - Bulk import
- `PATCH /api/admin/properties/[id]/status` - Update status
- `PUT /api/admin/properties/[id]` - Update property

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
