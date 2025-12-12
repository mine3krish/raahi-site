# Property Template System Guide

## Overview
The Property Template System allows you to control which fields are visible on the property detail page on a per-state basis. This gives you flexibility to show different information for properties in different states.

## How It Works

### 1. Property Model (Unified Data Store)
All property data (30 Excel fields + core fields) is now stored in the **Property** model:
- **Core Fields**: id, name, location, state, type, reservePrice, EMD, AuctionDate, area, images, status, featured
- **Excel Import Fields**: newListingId, schemeName, category, city, areaTown, date, emd, incrementBid, bankName, branchName, contactDetails, description, address, note, borrowerName, publishingDate, inspectionDate, applicationSubmissionDate, auctionStartDate, auctionEndTime, auctionType, listingId, notice
- **Advanced Fields**: source, url, fingerprint, assetCategory, assetAddress, assetCity, publicationDate, agentMobile
- **Import Tracking**: importBatchId, importedAt

### 2. PropertyTemplate Model (Visibility Control)
Located at `models/PropertyTemplate.ts`, this model controls which fields are visible:

```typescript
{
  name: string,                    // Template name
  state: string | null,            // null = default template
  isDefault: boolean,              // Only one default template allowed
  visibleFields: {                 // Boolean for each property field
    id: boolean,
    name: boolean,
    reservePrice: boolean,
    bankName: boolean,
    // ... 40+ more fields
  }
}
```

### 3. Template Management API
Located at `app/api/admin/property-templates/route.ts`:

**Endpoints:**
- `GET /api/admin/property-templates` - Get all templates
- `GET /api/admin/property-templates?default=true` - Get default template
- `GET /api/admin/property-templates?state=Maharashtra` - Get template for state
- `POST /api/admin/property-templates` - Create new template
- `PUT /api/admin/property-templates` - Update template
- `DELETE /api/admin/property-templates?id=xxx` - Delete template

### 4. Template Manager UI
Located at `app/admin/templates/page.tsx`:

**Features:**
- View all templates (default + state-specific)
- Create/edit templates with checkbox interface
- 40+ fields organized into groups:
  - Core Fields
  - Excel Import Fields
  - Description & Notes
  - Advanced Fields
- Select/Deselect All buttons per group
- State-specific overrides

**Access:** Admin Panel → Templates

## Usage Guide

### For Administrators

#### Creating a Default Template
1. Navigate to **Admin Panel → Templates**
2. The default template is automatically created if it doesn't exist
3. Click on "Default Template" to edit
4. Check/uncheck fields you want to show/hide
5. Click "Save Template"

#### Creating a State-Specific Template
1. Navigate to **Admin Panel → Templates**
2. Click **"+ New State Template"**
3. Enter a template name (e.g., "Maharashtra Template")
4. Select the state from the dropdown
5. Configure field visibility using checkboxes
6. Click "Save Template"

**Note:** State-specific templates override the default template for properties in that state.

#### Editing Templates
1. Click on any template in the list
2. Modify the field visibility
3. Click "Save Template"

#### Deleting Templates
- State templates can be deleted
- Default template cannot be deleted (only edited)

### Field Groups Explained

**Core Fields** (Always recommended to keep visible):
- id, name, location, state, type, reservePrice, EMD, AuctionDate, area, images, status, youtubeVideo

**Excel Import Fields** (Bank auction specific data):
- Bank details: bankName, branchName, contactDetails
- Auction details: incrementBid, auctionType, auctionStartDate, auctionEndTime
- Property details: category, city, areaTown, schemeName, borrowerName
- Dates: publishingDate, applicationSubmissionDate
- IDs: newListingId, listingId

**Description & Notes**:
- description, note, inspectionDate, assetAddress, agentMobile

**Advanced Fields** (Usually hidden):
- source, url, fingerprint (internal tracking)
- assetCategory, assetCity, publicationDate (legacy fields)

## Property View Page Integration

Located at `app/properties/[id]/page.tsx`:

**How it works:**
1. When a user views a property, the page fetches the template for that property's state
2. If no state template exists, it uses the default template
3. The `isFieldVisible(field)` function checks if a field should be displayed
4. Only enabled fields are rendered

**Example:**
```typescript
{isFieldVisible('bankName') && property.bankName && (
  <div>
    <span className="text-gray-600">Bank Name:</span>
    <p className="font-medium text-gray-800">{property.bankName}</p>
  </div>
)}
```

## Import Process

Located at `app/api/admin/properties/import/route.ts`:

**What happens during import:**
1. Excel file is uploaded with 30 columns
2. All data is saved directly to the **Property** collection
3. Each property includes:
   - All 30 Excel fields
   - Generated property name (via OpenAI)
   - Import tracking: importBatchId, importedAt
   - Duplicate checking: id and fingerprint
4. No separate ImportedData collection is used

## Default Field Visibility

**Visible by default:**
- id, name, location, state, type, reservePrice, EMD, AuctionDate
- area, images, status, description, note, inspectionDate
- assetAddress, agentMobile, youtubeVideo

**Hidden by default:**
- All advanced/internal fields: source, url, fingerprint
- Bank-specific: bankName, branchName, incrementBid
- Excel metadata: newListingId, schemeName, category, city, etc.

## Best Practices

1. **Start with Default Template**: Configure your default template first, then create state overrides only when needed

2. **Core Fields**: Keep core auction fields (price, EMD, date) always visible

3. **State Customization**: Create state templates only for states with unique requirements

4. **Testing**: After creating/updating a template, view a property in that state to verify the changes

5. **Admin View**: Admins can see all fields in the admin panel regardless of template settings

## Troubleshooting

**Q: Fields not showing on property page?**
A: Check the template for that property's state. Ensure the field is checked in the template.

**Q: How to show a field globally?**
A: Edit the default template and enable that field.

**Q: Property has no state-specific template?**
A: The default template will be used automatically.

**Q: Want different fields for Maharashtra vs Gujarat?**
A: Create separate templates for each state with different field configurations.

## Technical Details

### Database Schema
```
PropertyTemplate {
  _id: ObjectId
  name: String (required)
  state: String (optional, indexed)
  isDefault: Boolean (default: false, indexed)
  visibleFields: Object (40+ boolean fields)
  createdAt: Date
  updatedAt: Date
}
```

### Pre-save Hook
Ensures only one default template exists (state = null, isDefault = true).

### Frontend Template Fetching
```typescript
// Fetches template for property's state, falls back to default
const response = await fetch(`/api/admin/property-templates?state=${property.state}`);
const { template } = await response.json();

// Check visibility
const isFieldVisible = (field) => {
  if (!template || !template.visibleFields) return true;
  return template.visibleFields[field] !== false;
};
```

## Future Enhancements

Potential improvements:
- Template preview mode
- Field groups (show/hide entire groups)
- Template cloning
- Import/export templates
- Field usage analytics
- Custom field ordering

---

**Created:** January 2025  
**Version:** 1.0  
**Last Updated:** Property template system implementation
