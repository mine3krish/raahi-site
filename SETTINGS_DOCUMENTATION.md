# Raahi Auction - Admin Settings System

## Overview
A comprehensive settings management system for the Raahi Auction website. All site content can be customized through the admin panel without code changes.

## Features Implemented

### 1. **Settings Management** (`/admin/settings`)
Centralized admin panel to customize all site content with tabbed interface:

#### Contact Information
- Contact Email
- Contact Phone
- WhatsApp Number
- Office Address
- Business Hours / Office Timings
- Footer Text

#### About Us Content
- About Title
- About Description
- Mission Statement
- Vision Statement

#### Team Members Management
- Add/Remove/Edit team members
- Fields: Name, Role, Image, Email, Phone, Bio, Order
- Display order customization
- Public page: `/team`

#### Partners Management
- Add/Remove/Edit partner logos
- Fields: Partner Name, Logo URL, Display Order
- Automated logo scroller on homepage
- Grayscale hover effect

#### Social Media Links
- Facebook URL
- Twitter URL
- Instagram URL
- LinkedIn URL
- YouTube URL
- Dynamic footer social icons

#### Google AdSense Integration
- Enable/Disable toggle
- AdSense Client ID
- Ad Slot IDs: Header, Sidebar, Footer
- AdSense component for easy ad placement

#### SEO Settings
- Site Title
- Site Description
- Meta Keywords

### 2. **Public Pages**

#### Contact Page (`/contact`)
- Dynamic contact information from settings
- Email, phone, and address
- Business hours display
- Contact form

#### About Us Page (`/about`)
- Combined About & Team page
- Dynamic about content
- Mission & Vision statements
- Values and features showcase
- Team members section with photos
- Contact information (email, phone) for each member
- Role and bio display
- Sorted by custom order
- Call-to-action section

#### Team Redirect (`/team`)
- Redirects to `/about` for unified experience

### 3. **Dynamic Components**

#### PartnersScroller
- Infinite horizontal scroll animation
- Partner logos from settings
- Automatically shown on homepage
- Grayscale-to-color hover effect

#### Footer
- Dynamic social media links
- Custom footer text
- Links to all major pages
- Only shows social icons if URLs are configured

#### AdSense Component
- Reusable ad placement component
- Automatic client ID injection
- Configurable ad formats
- Easy integration: `<AdSense slot="your-slot-id" />`

### 4. **Navigation Updates**
Added to main navbar:
- About
- Our Team

## Database Schema

### SiteSettings Model
```javascript
{
  // Contact
  contactEmail: String,
  contactPhone: String,
  contactAddress: String,
  officeHours: String,
  whatsappNumber: String,
  
  // About
  aboutTitle: String,
  aboutDescription: String,
  missionStatement: String,
  visionStatement: String,
  
  // Social Media
  facebookUrl: String,
  twitterUrl: String,
  instagramUrl: String,
  linkedinUrl: String,
  youtubeUrl: String,
  
  // AdSense
  adsenseClientId: String,
  adsenseSlotHeader: String,
  adsenseSlotSidebar: String,
  adsenseSlotFooter: String,
  adsenseEnabled: Boolean,
  
  // Team Members
  teamMembers: [{
    name: String,
    role: String,
    image: String,
    email: String,
    phone: String,
    bio: String,
    order: Number
  }],
  
  // Partners
  partners: [{
    name: String,
    logo: String,
    order: Number
  }],
  
  // SEO
  siteTitle: String,
  siteDescription: String,
  siteKeywords: String,
  footerText: String,
  
  timestamps: true
}
```

## API Endpoints

### Admin API
- `GET /api/admin/settings` - Fetch all settings (admin only)
- `PUT /api/admin/settings` - Update settings (admin only)

### Public API
- `GET /api/settings` - Fetch public settings (no auth required)

## File Structure

```
models/
  └── SiteSettings.ts          # Settings database model

app/
  ├── about/
  │   ├── layout.tsx           # About & Team page layout
  │   └── page.tsx             # Combined About & Team page (dynamic content)
  │
  ├── team/
  │   └── page.tsx             # Redirects to /about
  │
  ├── contact/
  │   └── page.tsx             # Updated with dynamic settings
  │
  ├── admin/
  │   └── settings/
  │       └── page.tsx         # Admin settings panel
  │
  └── api/
      ├── settings/
      │   └── route.ts         # Public settings API
      │
      └── admin/
          └── settings/
              └── route.ts     # Admin settings API

components/ui/
  ├── PartnersScroller.tsx     # Homepage partners section
  ├── AdSense.tsx              # AdSense ad component
  ├── Footer.tsx               # Updated with dynamic data
  └── Navbar.tsx               # Added About & Team links
```

## Usage Examples

### Adding AdSense Ads
```jsx
import AdSense from "@/components/ui/AdSense";

// In your page component
<AdSense 
  slot="1234567890" 
  format="auto"
  responsive={true}
/>
```

### Using Settings in Custom Components
```jsx
const [settings, setSettings] = useState({});

useEffect(() => {
  const fetchSettings = async () => {
    const response = await fetch("/api/settings");
    const data = await response.json();
    setSettings(data);
  };
  fetchSettings();
}, []);

// Use settings.contactEmail, settings.aboutDescription, etc.
```

## Admin Workflow

1. **Login as Admin** → Navigate to `/admin/settings`
2. **Select Tab** → Choose the content category to edit
3. **Edit Content** → Update text fields, add/remove items
4. **Save Changes** → Click "Save Changes" button
5. **View Live** → Changes reflect immediately on public pages

## Architecture Notes

- **Navbar & Footer**: Defined once in root layout (`app/layout.tsx`)
  - Automatically included on all pages
  - No need to import in individual pages
  - Consistent across entire site
  
- **Combined Pages**: About Us includes team members
  - Single cohesive experience
  - Better navigation flow
  - `/team` redirects to `/about` for backwards compatibility

## Features Summary

✅ **Fully Customizable Contact Page** - Email, phone, address, hours
✅ **Dynamic About Us Page** - Mission, vision, description
✅ **Team Members Management** - Add staff with photos & bios
✅ **Partners Logo Scroller** - Automated homepage showcase
✅ **Social Media Integration** - Dynamic footer icons
✅ **Google AdSense Support** - Easy ad placement system
✅ **SEO Controls** - Title, description, keywords
✅ **No Code Changes Required** - All edits via admin panel

## Technical Features

- **Real-time Updates** - Changes reflect immediately
- **Image Support** - CDN integration for team photos & logos
- **Order Management** - Custom sorting for team & partners
- **Responsive Design** - Mobile-friendly admin panel
- **Error Handling** - Graceful fallbacks for missing data
- **TypeScript** - Full type safety
- **Validation** - Form validation in admin panel

## Default Values

All settings have sensible defaults:
- Contact Phone: +91 848 884 8874
- Contact Email: contact@raahiauction.com
- Office Hours: Mon - Sat: 9:00 AM - 6:00 PM
- About Title: About Raahi Auction
- Footer: © 2024 Raahi Auction. All rights reserved.

## Future Enhancements

Potential additions:
- Blog system integration
- Testimonials management
- Gallery/Media library
- Email template customization
- Notification settings
- Advanced analytics integration
