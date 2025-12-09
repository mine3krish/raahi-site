# Social Media API Configuration Guide

Complete guide to obtaining and configuring API credentials for Facebook, LinkedIn, and Instagram.

---

## 🟦 Facebook Page Posting

### **Prerequisites**

- Facebook Page (not personal profile)
- Facebook Developer Account
- Page Admin access

### **Step-by-Step Setup**

#### 1. Create Facebook App

1. Go to https://developers.facebook.com/apps
2. Click **"Create App"**
3. Select **"Business"** type
4. Enter App Name (e.g., "Raahi Property Sharing")
5. Enter contact email
6. Click **"Create App"**

#### 2. Add Facebook Login Product

1. In app dashboard, click **"Add Product"**
2. Find **"Facebook Login"** → Click **"Set Up"**
3. Skip quickstart or follow web setup
4. Go to **Settings** → **Basic**
5. Note down **App ID** and **App Secret**

#### 3. Get Page Access Token

**Option A: Using Graph API Explorer (Recommended)**

1. Go to https://developers.facebook.com/tools/explorer
2. Select your app from dropdown
3. Click **"Generate Access Token"**
4. Grant permissions:
   - `pages_manage_posts` (Required - allows posting to page)
   - `pages_read_engagement` (Optional - view page insights)
5. Click **"Generate Access Token"**
6. Copy the token (starts with `EAA...`)

**Note:** The permissions `manage_pages` and `pages_show_list` are deprecated and no longer needed.

**Option B: Using Access Token Tool**

1. Go to https://developers.facebook.com/tools/accesstoken
2. Find your page
3. Click **"Generate Token"**
4. Copy **Page Access Token**

#### 4. Convert to Long-Lived Token (Never Expires)

```bash
# Using curl
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"

# Response: { "access_token": "LONG_LIVED_TOKEN" }
```

Or use this URL in browser:

```
https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_LIVED_TOKEN
```

#### 5. Get Page ID

**Method 1:** From Page Settings

1. Go to your Facebook Page
2. Settings → About
3. Copy **Page ID** (numeric)

**Method 2:** From Graph API

```bash
curl -X GET "https://graph.facebook.com/v18.0/me/accounts?access_token=YOUR_ACCESS_TOKEN"
```

### **Configuration in Admin Panel**

```
Platform: Facebook
Account Name: Main Facebook Page
Page ID: 1234567890123456
Page Access Token: EAAxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **Testing**

Test your credentials:

```bash
curl -X POST "https://graph.facebook.com/v18.0/PAGE_ID/feed" \
  -d "message=Test post from API" \
  -d "access_token=YOUR_PAGE_ACCESS_TOKEN"
```

---

## 🔵 LinkedIn Profile/Company Page Posting

### **Prerequisites**

- LinkedIn Profile or Company Page
- LinkedIn Developer Account
- Posting permissions

### **Step-by-Step Setup**

#### 1. Create LinkedIn App

1. Go to https://www.linkedin.com/developers/apps
2. Click **"Create app"**
3. Fill in details:
   - App name: "Raahi Property Sharing"
   - LinkedIn Page: Select your company page
   - App logo: Upload logo
   - Legal agreement: Check box
4. Click **"Create app"**

#### 2. Add Products

1. In app dashboard, go to **"Products"** tab
2. Request access to:
   - **"Share on LinkedIn"** → Click **"Request access"**
   - **"Sign In with LinkedIn using OpenID Connect"**
3. Wait for approval (usually instant)

#### 3. Configure OAuth Settings

1. Go to **"Auth"** tab
2. Under **"OAuth 2.0 settings"**:
   - Add **Redirect URLs**:
     - `https://yourdomain.com/auth/linkedin/callback`
     - `http://localhost:3000/auth/linkedin/callback` (for testing)
3. Note down:
   - **Client ID**
   - **Client Secret**

#### 4. Get Access Token

**Manual OAuth Flow:**

1. Construct authorization URL:

```
https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=w_member_social%20openid%20profile%20email
```

For organization posting, add `w_organization_social` scope:

```
https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=w_member_social%20w_organization_social%20openid%20profile%20email
```

2. Open URL in browser, authorize the app
3. Get `code` from redirect URL
4. Exchange code for access token:

```bash
curl -X POST "https://www.linkedin.com/oauth/v2/accessToken" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=YOUR_AUTH_CODE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=YOUR_REDIRECT_URI"
```

Response:

```json
{
  "access_token": "AQVxxxxxxxxxxxxx",
  "expires_in": 5184000,
  "refresh_token": "AQWxxxxxxxxxxxxx"
}
```

#### 5. Get User ID (Person URN)

```bash
curl -X GET "https://api.linkedin.com/v2/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:

```json
{
  "id": "ABCDEFGHij",
  "localizedFirstName": "John",
  "localizedLastName": "Doe"
}
```

#### 6. Get Organization ID (For Company Pages)

```bash
curl -X GET "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Or find it in company page URL:

```
https://www.linkedin.com/company/12345678/
                                 ^^^^^^^^ (Organization ID)
```

### **Configuration in Admin Panel**

**For Personal Profile:**

```
Platform: LinkedIn
Account Name: My LinkedIn Profile
Post As: Personal Profile
Access Token: AQVxxxxxxxxxxxxxxxxx
User ID: ABCDEFGHij
```

**For Company Page:**

```
Platform: LinkedIn
Account Name: Company LinkedIn Page
Post As: Organization Page
Access Token: AQVxxxxxxxxxxxxxxxxx
Organization ID: 12345678
```

### **Token Refresh (Access tokens expire in 60 days)**

```bash
curl -X POST "https://www.linkedin.com/oauth/v2/accessToken" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=YOUR_REFRESH_TOKEN" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
```

### **Testing**

Test posting:

```bash
curl -X POST "https://api.linkedin.com/v2/ugcPosts" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Restli-Protocol-Version: 2.0.0" \
  -d '{
    "author": "urn:li:person:YOUR_USER_ID",
    "lifecycleState": "PUBLISHED",
    "specificContent": {
      "com.linkedin.ugc.ShareContent": {
        "shareCommentary": {
          "text": "Test post from API"
        },
        "shareMediaCategory": "NONE"
      }
    },
    "visibility": {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
    }
  }'
```

---

## 📸 Instagram Business Account Posting

### **Prerequisites**

- Instagram Business or Creator Account
- Facebook Page (linked to Instagram)
- Instagram account connected to Facebook Page
- Facebook Developer Account

### **Step-by-Step Setup**

#### 1. Convert to Business Account

1. Open Instagram app
2. Go to Settings → Account
3. Switch to **"Professional Account"**
4. Choose **"Business"** or **"Creator"**

#### 2. Link to Facebook Page

1. In Instagram: Settings → Account
2. Tap **"Linked Accounts"** → **"Facebook"**
3. Select Facebook Page to connect
4. Confirm connection

#### 3. Create Facebook App (Same as Facebook section)

1. Go to https://developers.facebook.com/apps
2. Create new app or use existing
3. Add **"Instagram Graph API"** product
4. In Instagram Basic Display → User Token Generator

#### 4. Get Page Access Token

(Same process as Facebook Page section)

1. Go to Graph API Explorer
2. Select your app
3. Generate token with permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`

**Note:** `pages_show_list` and `manage_pages` are deprecated permissions and should not be used.

#### 5. Get Instagram Business Account ID

**Method 1: Graph API Explorer**

1. Go to https://developers.facebook.com/tools/explorer
2. Select your app and page
3. Make GET request:

```
GET /me?fields=instagram_business_account
```

Response:

```json
{
  "instagram_business_account": {
    "id": "17841400000000000"
  }
}
```

**Method 2: Using curl**

```bash
curl -X GET "https://graph.facebook.com/v18.0/PAGE_ID?fields=instagram_business_account&access_token=PAGE_ACCESS_TOKEN"
```

### **Configuration in Admin Panel**

```
Platform: Instagram
Account Name: Main Instagram Account
Instagram Business Account ID: 17841400000000000
Page Access Token: EAAxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **Important Notes**

- ⚠️ Instagram requires images - text-only posts not supported
- ⚠️ Posts take 20-30 seconds to process
- ⚠️ Images must be publicly accessible URLs
- ⚠️ Rate limits: 25 posts per day per account

### **Testing**

Test container creation:

```bash
curl -X POST "https://graph.facebook.com/v18.0/IG_USER_ID/media" \
  -d "image_url=https://example.com/image.jpg" \
  -d "caption=Test post from API" \
  -d "access_token=PAGE_ACCESS_TOKEN"
```

---

## 🔒 Security Best Practices

### **1. Token Storage**

- ✅ Store tokens encrypted in database
- ✅ Use environment variables for sensitive data
- ✅ Never commit tokens to Git
- ✅ Rotate tokens regularly

### **2. Access Control**

- ✅ Use least privilege principle
- ✅ Only request necessary permissions
- ✅ Implement token refresh logic
- ✅ Monitor API usage

### **3. Rate Limits**

| Platform  | Limits                           |
| --------- | -------------------------------- |
| Facebook  | 200 calls/hour per user          |
| LinkedIn  | 100 posts/day, 500 invites/day   |
| Instagram | 25 posts/day, 200 API calls/hour |

### **4. Error Handling**

- ✅ Implement retry logic
- ✅ Log API errors
- ✅ Notify on token expiration
- ✅ Handle rate limit errors gracefully

---

## 🧪 Testing Credentials

### Quick Test Script

```javascript
// Test Facebook
fetch(`https://graph.facebook.com/v18.0/${PAGE_ID}/feed?message=Test&access_token=${TOKEN}`, {
  method: 'POST'
});

// Test LinkedIn
fetch('https://api.linkedin.com/v2/me', {
  headers: { 'Authorization': `Bearer ${TOKEN}` }
});

// Test Instagram
fetch(`https://graph.facebook.com/v18.0/${IG_ID}/media?image_url=URL&caption=Test&access_token=${TOKEN}`, {
  method: 'POST'
});
```

---

## 📞 Support & Resources

### Official Documentation

- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [LinkedIn API](https://docs.microsoft.com/en-us/linkedin/)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)

### Useful Tools

- [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer)
- [Facebook Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken)
- [LinkedIn API Console](https://www.linkedin.com/developers/apps)

### Common Issues

1. **Token expired** → Refresh token or regenerate
2. **Permissions denied** → Check app permissions
3. **Rate limited** → Implement exponential backoff
4. **Invalid credentials** → Verify IDs and tokens

---

## ✅ Checklist

### Facebook Setup

- [ ] Facebook Page created
- [ ] Developer account created
- [ ] App created with Facebook Login
- [ ] Page Access Token generated
- [ ] Token converted to long-lived
- [ ] Page ID obtained
- [ ] Permissions granted

### LinkedIn Setup

- [ ] LinkedIn app created
- [ ] Share on LinkedIn product added
- [ ] OAuth redirect URLs configured
- [ ] Access token obtained
- [ ] User/Organization ID retrieved
- [ ] Correct scopes granted

### Instagram Setup

- [ ] Account converted to Business
- [ ] Linked to Facebook Page
- [ ] Facebook app with Instagram API
- [ ] Page Access Token generated
- [ ] Instagram Business Account ID obtained
- [ ] Permissions granted
