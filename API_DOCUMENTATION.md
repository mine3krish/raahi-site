# Raahi Auction API Documentation

Base URL: `https://raahiauctions.cloud/api`

## Table of Contents
- [Authentication](#authentication)
- [Properties](#properties)
- [Communities](#communities)
- [Wishlist](#wishlist)
- [Contact](#contact)
- [Agents](#agents)
- [Admin Endpoints](#admin-endpoints)

---

## Authentication

### Sign Up
**POST** `/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+91 9876543210"
}
```

**Response:** `201 Created`
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "role": "user"
  }
}
```

---

### Login
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### Get Current User
**GET** `/auth/me`

Get currently authenticated user details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "role": "user"
  }
}
```

---

### Forgot Password
**POST** `/auth/forgot-password`

Request password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset email sent"
}
```

---

### Reset Password
**POST** `/auth/reset-password`

Reset password using token from email.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "newSecurePassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successful"
}
```

---

## Properties

### Get All Properties
**GET** `/properties`

Retrieve list of properties with filtering and pagination.

**Query Parameters:**
- `search` (string) - Search by name or location
- `state` (string) - Filter by state
- `type` (string) - Filter by property type (Residential, Commercial, Land, Industrial)
- `minPrice` (number) - Minimum reserve price
- `maxPrice` (number) - Maximum reserve price
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 50)

**Example Request:**
```
GET /properties?state=Maharashtra&type=Residential&page=1&limit=20
```

**Response:** `200 OK`
```json
{
  "properties": [
    {
      "id": "PROP12345",
      "name": "Luxury Apartment in Mumbai",
      "location": "Andheri, Mumbai",
      "state": "Maharashtra",
      "type": "Residential",
      "reservePrice": 5000000,
      "EMD": 500000,
      "AuctionDate": "15-05-2025",
      "area": 1200,
      "images": [
        "https://raahiauctions.cloud/cdn/image1.jpg",
        "https://raahiauctions.cloud/cdn/image2.jpg"
      ],
      "status": "Active",
      "featured": true,
      "assetCategory": "Residential Property",
      "assetAddress": "123 Main Street, Andheri West",
      "assetCity": "Mumbai",
      "borrowerName": "ABC Pvt Ltd",
      "publicationDate": "01-05-2025",
      "auctionStartDate": "15-05-2025",
      "auctionEndTime": "15-05-2025 16:00:00",
      "applicationSubmissionDate": "14-05-2025"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

---

### Get Property by ID
**GET** `/properties/[id]`

Get detailed information about a specific property.

**Example Request:**
```
GET /properties/PROP12345
```

**Response:** `200 OK`
```json
{
  "property": {
    "id": "PROP12345",
    "name": "Luxury Apartment in Mumbai",
    "location": "Andheri, Mumbai",
    "state": "Maharashtra",
    "type": "Residential",
    "reservePrice": 5000000,
    "EMD": 500000,
    "AuctionDate": "15-05-2025",
    "area": 1200,
    "images": [
      "https://raahiauctions.cloud/cdn/image1.jpg"
    ],
    "status": "Active",
    "featured": true,
    "assetCategory": "Residential Property",
    "assetAddress": "123 Main Street, Andheri West",
    "assetCity": "Mumbai",
    "borrowerName": "ABC Pvt Ltd",
    "publicationDate": "01-05-2025",
    "auctionStartDate": "15-05-2025",
    "auctionEndTime": "15-05-2025 16:00:00",
    "applicationSubmissionDate": "14-05-2025",
    "createdAt": "2025-05-01T10:00:00.000Z",
    "updatedAt": "2025-05-01T10:00:00.000Z"
  }
}
```

---

### Get Properties by State
**GET** `/properties/by-state`

Get properties grouped by state with counts.

**Response:** `200 OK`
```json
{
  "states": [
    {
      "state": "Maharashtra",
      "count": 45,
      "properties": [
        {
          "id": "PROP12345",
          "name": "Luxury Apartment in Mumbai",
          "location": "Andheri, Mumbai",
          "reservePrice": 5000000,
          "images": ["https://raahiauctions.cloud/cdn/image1.jpg"]
        }
      ]
    },
    {
      "state": "Delhi",
      "count": 32,
      "properties": [...]
    }
  ]
}
```

---

### Get Available States
**GET** `/properties/states`

Get list of all states with available properties.

**Response:** `200 OK`
```json
{
  "states": [
    "Maharashtra",
    "Delhi",
    "Karnataka",
    "Tamil Nadu"
  ]
}
```

---

### Get Property Statistics
**GET** `/properties/stats`

Get statistics about properties.

**Response:** `200 OK`
```json
{
  "total": 1782,
  "active": 1650,
  "sold": 100,
  "pending": 32,
  "featured": 50,
  "byState": {
    "Maharashtra": 450,
    "Delhi": 320,
    "Karnataka": 280
  },
  "byType": {
    "Residential": 800,
    "Commercial": 600,
    "Land": 300,
    "Industrial": 82
  }
}
```

---

## Communities

### Get All Communities
**GET** `/communities`

Retrieve list of WhatsApp communities.

**Query Parameters:**
- `state` (string) - Filter by state
- `active` (boolean) - Filter by active status

**Example Request:**
```
GET /communities?state=Maharashtra
```

**Response:** `200 OK`
```json
{
  "communities": [
    {
      "id": "comm123",
      "name": "Mumbai Property Buyers",
      "description": "Join our community for Mumbai property auctions",
      "state": "Maharashtra",
      "image": "https://raahiauctions.cloud/cdn/community1.jpg",
      "memberCount": 2500,
      "whatsappLink": "https://chat.whatsapp.com/xyz123",
      "active": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Wishlist

### Get User Wishlist
**GET** `/wishlist`

Get all properties in user's wishlist.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "wishlist": [
    {
      "id": "PROP12345",
      "name": "Luxury Apartment in Mumbai",
      "location": "Andheri, Mumbai",
      "state": "Maharashtra",
      "reservePrice": 5000000,
      "images": ["https://raahiauctions.cloud/cdn/image1.jpg"]
    }
  ]
}
```

---

### Add to Wishlist
**POST** `/wishlist`

Add a property to user's wishlist.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "propertyId": "PROP12345"
}
```

**Response:** `201 Created`
```json
{
  "message": "Property added to wishlist",
  "wishlist": {
    "userId": "user123",
    "propertyId": "PROP12345"
  }
}
```

---

### Remove from Wishlist
**DELETE** `/wishlist`

Remove a property from user's wishlist.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `propertyId` (string) - Property ID to remove

**Example Request:**
```
DELETE /wishlist?propertyId=PROP12345
```

**Response:** `200 OK`
```json
{
  "message": "Property removed from wishlist"
}
```

---

## Contact

### Submit Contact Form
**POST** `/contact`

Submit a contact/inquiry form.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 9876543210",
  "message": "I'm interested in property PROP12345",
  "propertyId": "PROP12345"
}
```

**Response:** `201 Created`
```json
{
  "message": "Contact form submitted successfully",
  "contact": {
    "id": "contact123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "message": "I'm interested in property PROP12345",
    "propertyId": "PROP12345",
    "status": "pending",
    "createdAt": "2025-05-01T10:00:00.000Z"
  }
}
```

---

## Agents

### Register as Agent
**POST** `/agents`

Register to become a property agent.

**Request Body:**
```json
{
  "name": "Agent Name",
  "email": "agent@example.com",
  "phone": "+91 9876543210",
  "city": "Mumbai",
  "state": "Maharashtra",
  "experience": 5,
  "licenseNumber": "LIC12345"
}
```

**Response:** `201 Created`
```json
{
  "message": "Agent registration submitted successfully",
  "agent": {
    "id": "agent123",
    "name": "Agent Name",
    "email": "agent@example.com",
    "status": "pending"
  }
}
```

---

## Admin Endpoints

All admin endpoints require authentication with an admin role.

**Headers:**
```
Authorization: Bearer <admin_token>
```

### Admin - Get All Properties
**GET** `/admin/properties`

Get all properties with advanced filtering (admin only).

**Query Parameters:**
- `search` (string) - Search term
- `state` (string) - Filter by state
- `type` (string) - Filter by type
- `status` (string) - Filter by status (Active, Sold, Pending)
- `page` (number) - Page number
- `limit` (number) - Items per page

**Response:** `200 OK`
```json
{
  "properties": [...],
  "total": 1782,
  "page": 1,
  "limit": 10,
  "totalPages": 179
}
```

---

### Admin - Create Property
**POST** `/admin/properties`

Create a new property listing.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `id` (string) - Unique property ID
- `name` (string) - Property name
- `location` (string) - Location
- `state` (string) - State
- `type` (string) - Property type
- `reservePrice` (number) - Reserve price
- `EMD` (number) - EMD amount
- `AuctionDate` (string) - Auction date
- `area` (number) - Area in sq ft
- `featured` (boolean) - Featured status
- `status` (string) - Status
- `assetCategory` (string) - Asset category
- `assetAddress` (string) - Asset address
- `assetCity` (string) - Asset city
- `borrowerName` (string) - Borrower name
- `publicationDate` (string) - Publication date
- `auctionStartDate` (string) - Auction start date
- `auctionEndTime` (string) - Auction end time
- `applicationSubmissionDate` (string) - Application deadline
- `image_0`, `image_1`, etc. (files) - Property images

**Response:** `201 Created`
```json
{
  "message": "Property created successfully",
  "property": {...}
}
```

---

### Admin - Update Property
**PUT** `/admin/properties/[id]`

Update an existing property.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Form Data:** (same as create, plus)
- `existingImages` (string) - JSON array of existing image URLs to keep
- `existingNotice` (string) - Existing notice PDF URL

**Response:** `200 OK`
```json
{
  "message": "Property updated successfully",
  "property": {...}
}
```

---

### Admin - Delete Property
**DELETE** `/admin/properties/[id]`

Delete a property.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:** `200 OK`
```json
{
  "message": "Property deleted successfully"
}
```

---

### Admin - Bulk Import Properties
**POST** `/admin/properties/import`

Import multiple properties from Excel file with images.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `excel` (file) - Excel file (.xlsx) with property data
- `images` (file) - ZIP file containing property images (optional)

**Excel Columns:**
- `newListingId` or auto-generated
- `schemeName` or `SchemeName` - Property name (or will be generated)
- `type` or `category` - Property type
- `location` or `city` - Location
- `state` - State
- `reservePrice` - Reserve price
- `EMD` or `emd` - EMD amount
- `date` - Auction date
- `area` - Area in sq ft
- `images` - Image filenames (comma-separated) or URLs
- `description` - Property description
- `areaTown` - Area/Town
- `branchName` - Branch name
- `borrowerName` - Borrower name
- `publicationDate` - Publication date
- `auctionStartDate` - Auction start date
- `auctionEndTime` - Auction end time
- `applicationSubmissionDate` - Application deadline

**Response:** `200 OK`
```json
{
  "message": "Import completed",
  "results": {
    "success": 1500,
    "failed": 10,
    "duplicates": 5,
    "errors": [
      "Row 5: Missing required field - state",
      "Property PROP123 already exists"
    ]
  }
}
```

---

### Admin - Get All Communities
**GET** `/admin/communities`

Get all communities with stats (admin only).

**Response:** `200 OK`
```json
{
  "communities": [...],
  "total": 25
}
```

---

### Admin - Create Community
**POST** `/admin/communities`

Create a new WhatsApp community.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `id` (string) - Unique community ID
- `name` (string) - Community name
- `description` (string) - Description
- `state` (string) - State
- `whatsappLink` (string) - WhatsApp group link
- `memberCount` (number) - Initial member count
- `active` (boolean) - Active status
- `image` (file) - Community image

**Response:** `201 Created`
```json
{
  "message": "Community created successfully",
  "community": {...}
}
```

---

### Admin - Get All Users
**GET** `/admin/users`

Get all registered users.

**Response:** `200 OK`
```json
{
  "users": [
    {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+91 9876543210",
      "role": "user",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Admin - Update User
**PATCH** `/admin/users/[id]`

Update user details (e.g., change role to admin).

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response:** `200 OK`
```json
{
  "message": "User updated successfully",
  "user": {...}
}
```

---

### Admin - Delete User
**DELETE** `/admin/users/[id]`

Delete a user account.

**Response:** `200 OK`
```json
{
  "message": "User deleted successfully"
}
```

---

### Admin - Get Statistics
**GET** `/admin/stats`

Get comprehensive dashboard statistics.

**Response:** `200 OK`
```json
{
  "properties": {
    "total": 1782,
    "active": 1650,
    "sold": 100,
    "pending": 32
  },
  "users": {
    "total": 5000,
    "active": 4800
  },
  "contacts": {
    "total": 1200,
    "pending": 150,
    "resolved": 1050
  },
  "agents": {
    "total": 50,
    "active": 45,
    "pending": 5
  },
  "communities": {
    "total": 25,
    "totalMembers": 50000
  }
}
```

---

### Admin - Get All Contacts
**GET** `/admin/contacts`

Get all contact form submissions.

**Response:** `200 OK`
```json
{
  "contacts": [
    {
      "id": "contact123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+91 9876543210",
      "message": "Interested in property",
      "propertyId": "PROP12345",
      "status": "pending",
      "createdAt": "2025-05-01T10:00:00.000Z"
    }
  ]
}
```

---

### Admin - Get All Agents
**GET** `/admin/agents`

Get all agent registrations.

**Response:** `200 OK`
```json
{
  "agents": [
    {
      "id": "agent123",
      "name": "Agent Name",
      "email": "agent@example.com",
      "phone": "+91 9876543210",
      "city": "Mumbai",
      "state": "Maharashtra",
      "experience": 5,
      "licenseNumber": "LIC12345",
      "status": "pending",
      "createdAt": "2025-05-01T10:00:00.000Z"
    }
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error message"
}
```

---

## Data Models

### Property
```typescript
{
  id: string;              // Unique identifier (e.g., "PROP12345")
  name: string;            // Property name
  location: string;        // Location/address
  state: string;           // State name
  type: string;            // "Residential" | "Commercial" | "Land" | "Industrial"
  reservePrice: number;    // Reserve price in INR
  EMD: number;             // Earnest Money Deposit in INR
  AuctionDate: string;     // Auction date (string format)
  area?: number;           // Area in square feet
  images: string[];        // Array of CDN image URLs
  status: string;          // "Active" | "Sold" | "Pending"
  featured: boolean;       // Featured property flag
  
  // Additional auction details
  assetCategory?: string;
  assetAddress?: string;
  assetCity?: string;
  borrowerName?: string;
  publicationDate?: string;
  auctionStartDate?: string;
  auctionEndTime?: string;
  applicationSubmissionDate?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### User
```typescript
{
  id: string;
  name: string;
  email: string;
  phone?: string;
  password: string;        // Hashed
  role: string;            // "user" | "admin"
  createdAt: Date;
  updatedAt: Date;
}
```

### Community
```typescript
{
  id: string;
  name: string;
  description: string;
  state: string;
  image: string;           // CDN URL
  memberCount: number;
  whatsappLink: string;    // WhatsApp group link
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Rate Limiting

- Public endpoints: 100 requests per 15 minutes per IP
- Authenticated endpoints: 1000 requests per 15 minutes per user
- Admin endpoints: 5000 requests per 15 minutes per admin

---

## CDN URLs

All uploaded files (images, PDFs) are stored on CDN:
- Base URL: `https://raahiauctions.cloud/cdn/`
- Images: Optimized to 1200x900px, 85% quality JPEG
- Format: `{timestamp}-{random}.jpg`

---

## Contact

For API support or questions:
- Phone: +91 84888 48874
- Website: https://raahiauctions.cloud
- Email: support@raahiauctions.cloud
