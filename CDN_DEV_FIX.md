# CDN Development Fix - Implementation Summary

## Problem
The CDN was hardcoded to use production paths (`/var/www/cdn`) and URLs (`https://raahiauctions.cloud/cdn/`), which don't work in Windows development environment.

## Solution
Implemented environment-aware CDN system that automatically switches between development and production configurations.

## What Was Changed

### 1. New Files Created

#### `lib/cdn.ts` - CDN Configuration Utility
Centralized CDN configuration with environment detection:
- `getCDNDir()` - Returns local path in dev, server path in production
- `getCDNUrl()` - Returns localhost API route in dev, production CDN in production
- `getCDNBaseUrl()` - Base URL for CDN
- Environment auto-detection based on `process.env.NODE_ENV`

**Development:** `public/uploads/` directory (Windows-compatible)  
**Production:** `/var/www/cdn` directory (Linux server)

#### `app/api/cdn/[...path]/route.ts` - Development CDN API Route
Next.js API route that serves uploaded files in development:
- Serves files from `public/uploads/` in dev
- Mimics production CDN behavior
- Content-type detection for images/PDFs
- Path traversal security checks
- Cache headers for performance

### 2. Updated API Routes

All upload-related routes now use the CDN utility:

**Updated:**
- ✅ `app/api/admin/properties/import/route.ts` - Excel import with images
- ✅ `app/api/admin/properties/route.ts` - Property creation with images & notices
- ✅ `app/api/admin/communities/route.ts` - Community image uploads
- ✅ `app/api/admin/settings/route.ts` - Team photos & partner logos
- ✅ `app/api/admin/upload/route.ts` - Generic file upload
- ✅ `app/api/admin/social-share/route.ts` - Instagram image resizing

**Changes made:**
1. Added `import { getCDNDir, getCDNUrl } from "@/lib/cdn";`
2. Replaced `const CDN_DIR = "/var/www/cdn"` with `const CDN_DIR = getCDNDir()`
3. Replaced hardcoded URLs with `getCDNUrl(filename)`

### 3. Directory Structure

```
public/
  uploads/           # Created for development (gitignored recommended)
    properties/      # Property images
    communities/     # Community images
    notices/         # Notice PDFs
    instagram/       # Social media resized images
    team/           # Team member photos
    partners/       # Partner logos
```

## How It Works

### Development Environment
1. Files upload to `c:\Users\TREX\Desktop\raahi-site\public\uploads\`
2. URLs generated as `http://localhost:3000/api/cdn/filename.jpg`
3. API route `/api/cdn/[...path]` serves the files
4. Works on Windows without Linux-specific paths

### Production Environment
1. Files upload to `/var/www/cdn/`
2. URLs generated as `https://raahiauctions.cloud/cdn/filename.jpg`
3. Web server (Nginx/Apache) serves files directly
4. No API route overhead in production

## Testing

### Test Upload Functionality
1. Start dev server: `npm run dev`
2. Go to Admin Panel → Properties
3. Upload a property with images
4. Verify images display correctly
5. Check `public/uploads/` directory for saved files

### Test CDN API Route
Visit: `http://localhost:3000/api/cdn/[filename]`

Should serve the file with correct content-type and cache headers.

## Environment Variables

Optional: Set `NEXT_PUBLIC_BASE_URL` in `.env.local` for custom dev URL:
```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Benefits

✅ **Works in Development** - No more missing images on Windows  
✅ **Automatic Switching** - Environment detection, no manual config  
✅ **Centralized Logic** - One place to manage CDN behavior  
✅ **Type-Safe** - Full TypeScript support  
✅ **Production Ready** - No changes needed for deployment  
✅ **Secure** - Path traversal protection in dev API route  

## Migration Notes

- Old hardcoded paths automatically converted
- No database changes needed
- Existing production files unaffected
- New uploads work in both environments

## Next Steps (Optional)

1. **Add to .gitignore:**
   ```
   public/uploads/
   ```

2. **Create subdirectories:**
   ```powershell
   New-Item -ItemType Directory -Path public/uploads/properties -Force
   New-Item -ItemType Directory -Path public/uploads/communities -Force
   New-Item -ItemType Directory -Path public/uploads/notices -Force
   ```

3. **Update next.config.ts** for better image optimization:
   ```typescript
   images: {
     remotePatterns: [
       {
         protocol: 'http',
         hostname: 'localhost',
         port: '3000',
         pathname: '/api/cdn/**',
       },
     ],
   }
   ```

## Troubleshooting

**Images not loading in dev?**
- Check `public/uploads/` exists
- Verify dev server is running
- Check browser console for 404 errors
- Ensure file permissions (Windows: read access)

**Still seeing production URLs in dev?**
- Restart dev server (`npm run dev`)
- Clear browser cache
- Check `process.env.NODE_ENV` is "development"

**Upload failing?**
- Check directory permissions
- Verify disk space
- Check file size limits in server config

## Code Example

```typescript
// Before (hardcoded)
const CDN_DIR = "/var/www/cdn";
const url = `https://raahiauctions.cloud/cdn/${filename}`;

// After (environment-aware)
import { getCDNDir, getCDNUrl } from "@/lib/cdn";
const CDN_DIR = getCDNDir();
const url = getCDNUrl(filename);
```

---

**Status:** ✅ Implemented and tested  
**Date:** December 12, 2025  
**Breaking Changes:** None (backward compatible)
