# Social Media Sharing System - Complete Guide

## 🎯 Overview

Comprehensive social media sharing system that allows bulk sharing of properties to multiple platforms including WhatsApp (via WAHA), Facebook, LinkedIn, and Instagram.

## 📋 Features

### ✅ Implemented & Working
- **WhatsApp Integration (WAHA)** - Fully functional
  - QR code authentication
  - Session management (start, stop, logout)
  - Multi-group broadcasting
  - Image + text sharing
  - Real-time status monitoring
  - Webhook support
  - API key security

### 📋 Ready for Implementation
- **Facebook** - Structure ready, needs Graph API integration
- **LinkedIn** - Structure ready, needs Share API integration  
- **Instagram** - Structure ready, needs Graph API integration

## 🚀 Quick Start

### Step 1: Install WAHA

**Basic Installation:**
```bash
docker run -d -p 3000:3000 --name waha devlikeapro/waha
```

**With API Key (Recommended):**
```bash
docker run -d -p 3000:3000 \
  -e WHATSAPP_API_KEY=your_secret_key_here \
  --name waha \
  devlikeapro/waha
```

**With Persistent Storage:**
```bash
docker run -d -p 3000:3000 \
  -e WHATSAPP_API_KEY=your_secret_key_here \
  -v /path/to/waha:/app/.sessions \
  --name waha \
  devlikeapro/waha
```

**Advanced Configuration:**
```bash
docker run -d -p 3000:3000 \
  -e WHATSAPP_API_KEY=your_secret_key_here \
  -e WHATSAPP_HOOK_URL=https://yourdomain.com/webhook \
  -e WHATSAPP_HOOK_EVENTS=message,message.any \
  -v /path/to/waha:/app/.sessions \
  --restart unless-stopped \
  --name waha \
  devlikeapro/waha
```

### Step 2: Configure in Admin Panel

1. Go to `/admin/social-sharing`
2. Click "Add Account"
3. Select platform: "WhatsApp (WAHA)"
4. Enter configuration:
   - **WAHA Base URL**: `http://your-server-ip:3000` or `https://waha.yourdomain.com`
   - **API Key**: (if you set `WHATSAPP_API_KEY`)
   - **Session Name**: `default` (or custom name)
   - **Account Name**: Any friendly name (e.g., "Main WhatsApp")

### Step 3: Authenticate WhatsApp

1. Click "Check Session Status" to verify connection
2. Click "Start & Scan QR" button
3. QR code will appear - scan with WhatsApp mobile app:
   - Open WhatsApp → Settings → Linked Devices
   - Tap "Link a Device"
   - Scan the QR code
4. Wait for authentication (window closes automatically)
5. Status will change to "WORKING"

### Step 4: Fetch Groups

1. Once authenticated (status = WORKING)
2. Click "Fetch WhatsApp Groups"
3. Select groups you want to share to
4. Click "Select All" or choose individual groups
5. Save configuration

### Step 5: Share Properties

1. Go to `/admin/properties`
2. Select multiple properties using checkboxes
3. Click "Bulk Actions" → "Share to Social Media"
4. Select which social accounts to use
5. Customize message template (optional)
6. Click "Share Properties"
7. Monitor progress and results

## 🔧 Configuration Options

### WhatsApp Account Settings

| Field | Required | Description |
|-------|----------|-------------|
| Account Name | ✅ | Friendly name for this account |
| WAHA Base URL | ✅ | Your WAHA server URL (http://localhost:3000) |
| API Key | ❌ | Security key if configured in WAHA |
| Session Name | ✅ | Session identifier (default: "default") |
| Webhook URL | ❌ | Receive incoming message notifications |
| Webhook Events | ❌ | Events to listen for (message, group.join, etc) |
| No Wait Mode | ❌ | Create session immediately without waiting |

### Template Variables

Use these variables in your post templates:

| Variable | Output Example |
|----------|----------------|
| `{{name}}` | "Luxurious 3BHK Apartment" |
| `{{location}}` | "Mumbai, Maharashtra" |
| `{{state}}` | "Maharashtra" |
| `{{reservePrice}}` | "₹75 Lakhs" |
| `{{auctionDate}}` | "15-12-2025" |
| `{{area}}` | "1,250 sq ft" |
| `{{type}}` | "Residential" |
| `{{link}}` | "https://raahiauctions.cloud/properties/ABC123" |
| `{{emd}}` | "₹5,00,000" |
| `{{assetAddress}}` | "Plot 123, Sector 45, Gurgaon" |

### Default Template Example

```
🏠 {{name}}

📍 Location: {{location}}, {{state}}
💰 Reserve Price: {{reservePrice}}
📅 Auction Date: {{auctionDate}}
📏 Area: {{area}}
🏷️ Type: {{type}}

🔗 View Details: {{link}}

#RealEstate #PropertyAuction #{{state}}
```

## 📡 API Endpoints

### WAHA Sessions
- `GET /api/admin/waha/sessions` - List all sessions
- `POST /api/admin/waha/sessions` - Start new session
- `DELETE /api/admin/waha/sessions` - Stop session

### Authentication
- `GET /api/admin/waha/qr` - Get QR code for authentication
- `POST /api/admin/waha/logout` - Logout from WhatsApp
- `GET /api/admin/waha/status` - Check session status

### Groups & Sharing
- `POST /api/admin/waha/groups` - Fetch WhatsApp groups
- `POST /api/admin/social-share` - Share properties to social media

### Configuration
- `GET /api/admin/social-config` - Get social media configuration
- `POST /api/admin/social-config` - Update configuration

## 🔐 Security Best Practices

1. **Always use API Key in production:**
   ```bash
   -e WHATSAPP_API_KEY=use_strong_random_key_here
   ```

2. **Use HTTPS for WAHA:**
   - Set up reverse proxy (nginx/caddy)
   - Use SSL certificate
   - Access via `https://waha.yourdomain.com`

3. **Restrict access:**
   - Firewall rules to limit access
   - VPN or private network
   - IP whitelisting

4. **Regular backups:**
   - Backup `.sessions` folder
   - Contains WhatsApp authentication data

## 🐛 Troubleshooting

### QR Code Not Showing
- Check WAHA is running: `docker ps`
- Check WAHA logs: `docker logs waha`
- Verify base URL is correct
- Check firewall/network connectivity

### "Session Not Found" Error
- Click "Start & Scan QR" to create session
- Wait for WAHA to initialize
- Check WAHA logs for errors

### Groups Not Loading
- Ensure status is "WORKING" (authenticated)
- Check WhatsApp is actually connected
- Refresh session status
- Check API key if configured

### Messages Not Sending
- Verify group IDs are correct
- Check groups are enabled in settings
- Monitor WAHA logs for errors
- Check rate limits (WhatsApp has restrictions)

### QR Code Expired
- QR codes expire after 60 seconds
- Will auto-refresh every 5 seconds
- Close and reopen modal if stuck

## 📊 Session Status Meanings

| Status | Meaning | Action |
|--------|---------|--------|
| STOPPED | Session not started | Start session |
| STARTING | Initializing | Wait or scan QR |
| SCAN_QR_CODE | Waiting for authentication | Scan QR code |
| WORKING | Connected & ready | Can fetch groups & send |
| FAILED | Error occurred | Check logs, restart |

## 🎨 Advanced Features

### Custom Templates
1. Go to "Post Templates" tab
2. Create platform-specific templates
3. Use different variables per platform
4. Test with single property first

### Webhook Integration
Configure webhooks to receive:
- Incoming messages
- Group events (join/leave)
- Message status updates
- Connection status changes

Example webhook payload:
```json
{
  "event": "message",
  "session": "default",
  "payload": {
    "from": "1234567890@c.us",
    "body": "Hello",
    "timestamp": 1234567890
  }
}
```

### Multiple Accounts
- Add multiple WhatsApp accounts
- Different phone numbers
- Separate group sets per account
- Load balancing across accounts

## 📈 Performance Tips

1. **Batch Sizing:**
   - Share 5-10 properties at a time
   - Don't overload WhatsApp servers
   - Monitor for rate limits

2. **Group Selection:**
   - Organize groups by region/type
   - Create multiple accounts for different segments
   - Enable only relevant groups

3. **Image Optimization:**
   - Use CDN for faster delivery
   - Compress images before upload
   - WAHA will handle image downloading

4. **Monitoring:**
   - Check detailed results after sharing
   - Review failed messages
   - Update templates based on engagement

## 🔄 WAHA Updates

Keep WAHA updated:
```bash
# Pull latest version
docker pull devlikeapro/waha

# Stop and remove old container
docker stop waha && docker rm waha

# Start with new version (use your full docker run command)
docker run -d -p 3000:3000 ...
```

## 📚 Additional Resources

- [WAHA Documentation](https://waha.devlike.pro/)
- [WAHA GitHub](https://github.com/devlikeapro/waha)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Next.js Documentation](https://nextjs.org/docs)

## 🆘 Support

If you encounter issues:
1. Check WAHA logs: `docker logs waha`
2. Verify WAHA is running: `docker ps`
3. Test WAHA API directly: `curl http://localhost:3000/api/sessions`
4. Check browser console for errors
5. Review server logs

## 📝 Changelog

### v1.0.0 (Current)
- ✅ WhatsApp WAHA integration
- ✅ QR code authentication
- ✅ Session management
- ✅ Multi-group broadcasting
- ✅ Template system
- ✅ Bulk property sharing
- ✅ Status monitoring
- ✅ Webhook support
- ✅ API key security

### Planned Features
- 📋 Facebook Graph API integration
- 📋 LinkedIn Share API integration
- 📋 Instagram Graph API integration
- 📋 Scheduled posting
- 📋 Analytics dashboard
- 📋 Message templates library
- 📋 A/B testing for templates
