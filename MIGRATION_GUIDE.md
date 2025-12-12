# Migration Guide: ImportedData to Property

## Overview
The system has been refactored to consolidate all property data into a single **Property** model, eliminating the separate **ImportedData** collection.

## What Changed

### Before (Old System)
```
Excel Import → Property Collection (basic fields)
           └→ ImportedData Collection (all 30 fields)
```
- Data split across two collections
- Admins needed to check both places for complete information
- Complex queries to get full property details

### After (New System)
```
Excel Import → Property Collection (all 50+ fields)
```
- Single source of truth
- All Excel data stored directly in Property
- Template system controls field visibility
- Simpler, more maintainable

## Migration Status

### ✅ Completed
1. **Property Model Updated**
   - Added all 30 Excel import fields
   - Added import tracking (importBatchId, importedAt)
   - Kept legacy fields for backward compatibility

2. **Import Route Refactored** (`app/api/admin/properties/import/route.ts`)
   - Removed ImportedData dependency
   - All data saved directly to Property
   - Simplified duplicate checking

3. **PropertyTemplate System**
   - New model for field visibility control
   - Template Manager UI created
   - Property view page integrated with templates

### ⏳ Pending Cleanup Tasks

#### Task 1: Update Admin Properties Page
**File:** `app/admin/properties/page.tsx`

**Current:** Shows only basic fields (id, name, location, state, type, price, status)

**Todo:** Expand to show ALL fields including:
- Bank details (bankName, branchName)
- Excel fields (category, city, borrowerName, etc.)
- Dates (publishingDate, applicationSubmissionDate)
- Advanced (source, url, fingerprint)

**Suggested Approach:**
- Add "View All Fields" button/modal
- Organize fields into tabs: Core, Excel, Legacy, Advanced
- Allow editing all fields

#### Task 2: Remove/Repurpose ImportedData Admin Page
**Files:**
- `app/admin/imported-data/page.tsx`
- `app/api/admin/imported-data/` routes

**Options:**

**Option A - Remove Completely:**
```powershell
# Remove files
Remove-Item app/admin/imported-data -Recurse -Force
Remove-Item app/api/admin/imported-data -Recurse -Force

# Update admin layout
# Remove "Imported Data" link from app/admin/layout.tsx
```

**Option B - Repurpose as "All Fields View":**
- Rename page to "Property Details"
- Show complete property data with all 50+ fields
- Keep search/filter functionality
- Useful for debugging and data verification

#### Task 3: Remove ImportedData Model (Optional)
**File:** `models/ImportedData.ts`

**Considerations:**
- Check if any existing imports reference this collection
- Verify no other code dependencies
- Back up collection before deletion

**If removing:**
```powershell
# Move to archive
New-Item -ItemType Directory -Path .\models\archive -Force
Move-Item models/ImportedData.ts models/archive/
```

**MongoDB Cleanup (if needed):**
```javascript
// In MongoDB shell or Compass
use your_database_name;
db.importeddata.drop(); // Only if you're sure!
```

#### Task 4: Update Admin Navigation
**File:** `app/admin/layout.tsx`

**Current:**
```tsx
<AdminLink href="/admin/imported-data">Imported Data</AdminLink>
```

**Options:**
- Remove link entirely (if deleting page)
- Rename to "Property Details" or "All Fields"
- Keep for backward compatibility

#### Task 5: Data Migration (If needed)
If you have existing properties with missing Excel fields:

**Script:** Create `scripts/migrate-imported-data.js`
```javascript
// Connect to MongoDB
// For each ImportedData document:
//   1. Find matching Property by id or fingerprint
//   2. Update Property with all ImportedData fields
//   3. Add importBatchId, importedAt
//   4. Delete ImportedData document
```

## Rollback Plan

If you need to revert:

1. **Restore ImportedData Logic** in import route:
   ```typescript
   // Add back ImportedData.create() after property creation
   await ImportedData.create({
     ...propertyData,
     propertyId: property.id,
     batchId: importBatchId,
     importedAt: new Date()
   });
   ```

2. **Restore Admin Page:**
   - Restore from git history
   - Re-add navigation link

3. **Database:**
   - Existing Property documents keep their new fields
   - New imports would populate both collections

## Testing Checklist

Before completing migration:

- [ ] Import new Excel file
- [ ] Verify all 30 fields saved to Property collection
- [ ] Check property view page displays correctly
- [ ] Test template system (default + state-specific)
- [ ] Verify duplicate detection works
- [ ] Check admin properties page
- [ ] Test search and filters
- [ ] Verify no broken references to ImportedData

## Recommendations

### Short Term (Do Now)
1. ✅ **Property model updated** - DONE
2. ✅ **Import route refactored** - DONE
3. ✅ **Template system created** - DONE
4. ⏳ **Test import with real Excel file**
5. ⏳ **Verify property view page**

### Medium Term (Next Phase)
1. Update admin properties page to show all fields
2. Repurpose imported-data page as "All Fields View"
3. Add bulk edit capabilities for Excel fields
4. Create data validation rules

### Long Term (Optional)
1. Remove ImportedData model completely
2. Add import history/audit log
3. Field-level edit tracking
4. Export to Excel functionality

## Benefits of New System

### For Developers
- Single source of truth
- Simpler codebase
- Easier queries
- Better type safety

### For Admins
- See all data in one place
- Faster property management
- Flexible field visibility
- State-specific customization

### For Users
- Cleaner property pages
- Relevant information only
- Faster page loads
- Better mobile experience

## Support

If you encounter issues:
1. Check `TEMPLATE_SYSTEM_GUIDE.md` for usage instructions
2. Review this migration guide
3. Check git history for previous implementation
4. Test in development environment first

---

**Migration Started:** January 2025  
**Status:** Core refactor complete, cleanup pending  
**Breaking Changes:** None (backward compatible)
