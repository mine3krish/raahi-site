import { NextRequest, NextResponse } from "next/server";
import SocialConfig from "@/models/SocialConfig";
import Property from "@/models/Property";
import { verifyAdmin } from "@/lib/auth";
import { connectDB } from "@/app/api/connect";
import { formatIndianPrice } from "@/lib/constants";

// Helper to replace template variables
function replaceTemplateVars(template: string, property: any): string {
  return template
    .replace(/{{id}}/g, property.id || "")
    .replace(/{{name}}/g, property.name || "")
    .replace(/{{location}}/g, property.location || "")
    .replace(/{{state}}/g, property.state || "")
    .replace(/{{city}}/g, property.city || "")
    .replace(/{{reservePrice}}/g, formatIndianPrice(property.reservePrice || 0))
    .replace(/{{auctionDate}}/g, property.AuctionDate || "")
    .replace(/{{area}}/g, property.area?.toLocaleString() || "N/A")
    .replace(/{{type}}/g, property.type || "")
    .replace(/{{category}}/g, property.category || "")
    .replace(/{{bank}}/g, property.bank || "")
    .replace(/{{branch}}/g, property.branch || "")
    .replace(/{{emd}}/g, formatIndianPrice(property.EMD || 0))
    .replace(/{{assetAddress}}/g, property.assetAddress || "")
    .replace(/{{borrowerName}}/g, property.borrowerName || "")
    .replace(/{{applicationNumber}}/g, property.applicationNumber || "")
    .replace(/{{possessionStatus}}/g, property.possessionStatus || "")
    .replace(/{{auctionType}}/g, property.auctionType || "")
    .replace(/{{contactPerson}}/g, property.contactPerson || "")
    .replace(/{{contactNumber}}/g, property.contactNumber || "")
    .replace(/{{link}}/g, `https://raahiauctions.cloud/properties/${property.id}`);
}

// POST - Share properties to social media
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { propertyIds, accountIds, template, includeImage = true, includeLink = true } = await req.json();

    if (!propertyIds || propertyIds.length === 0) {
      return NextResponse.json(
        { error: "No properties selected" },
        { status: 400 }
      );
    }

    if (!accountIds || accountIds.length === 0) {
      return NextResponse.json(
        { error: "No accounts selected" },
        { status: 400 }
      );
    }

    // Fetch properties
    const properties = await Property.find({ id: { $in: propertyIds } });

    // Fetch social config
    const config = await SocialConfig.findOne();
    if (!config) {
      return NextResponse.json(
        { error: "Social configuration not found" },
        { status: 404 }
      );
    }

    // Since accounts no longer have _id, we need to match by index or name
    const selectedAccounts = config.accounts.filter((acc: any, index: number) =>
      accountIds.includes(index.toString()) || accountIds.includes(acc.name)
    );

    const results: any[] = [];
    const errors: string[] = [];

    // Share to each account
    for (const account of selectedAccounts) {
      if (!account.enabled) continue;

      for (const property of properties) {
        try {
          const postText = replaceTemplateVars(
            template || config.defaultTemplate,
            property
          );
          const imageUrl = includeImage ? (property.images?.[0] || "") : "";

          let result;

          switch (account.platform) {
            case "whatsapp":
              result = await shareToWhatsApp(account, postText, imageUrl, property);
              break;
            case "facebook":
              result = await shareToFacebook(account, postText, imageUrl);
              break;
            case "linkedin":
              result = await shareToLinkedIn(account, postText, imageUrl);
              break;
            case "instagram":
              result = await shareToInstagram(account, postText, imageUrl);
              break;
            default:
              throw new Error(`Unsupported platform: ${account.platform}`);
          }

          results.push({
            platform: account.platform,
            account: account.name,
            property: property.name,
            success: true,
            result,
          });
        } catch (err: any) {
          errors.push(
            `Failed to share ${property.name} to ${account.name}: ${err.message}`
          );
          results.push({
            platform: account.platform,
            account: account.name,
            property: property.name,
            success: false,
            error: err.message,
          });
        }
      }
    }

    return NextResponse.json({
      message: "Sharing completed",
      results,
      errors,
      summary: {
        total: results.length,
        success: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      },
    });
  } catch (err: any) {
    console.error("Social share error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

const WAHA_API_KEY = "d0169ac6199f4681a46f191bce4dce94";

// WhatsApp sharing via WAHA API
async function shareToWhatsApp(account: any, text: string, imageUrl: string, property: any) {
  const { wahaBaseUrl, sessionName, groups } = account.config;

  if (!wahaBaseUrl || !sessionName) {
    throw new Error("WhatsApp configuration incomplete");
  }

  const enabledGroups = groups?.filter((g: any) => g.enabled) || [];
  if (enabledGroups.length === 0) {
    throw new Error("No WhatsApp groups enabled");
  }

  const results = [];

  for (const group of enabledGroups) {
    try {
      const headers: any = {
        "Content-Type": "application/json",
        "X-Api-Key": WAHA_API_KEY,
      };

      // Send image if available
      if (imageUrl) {
        console.log(`Sending to WhatsApp group ${group.name} (${group.id}):`, {
          wahaBaseUrl,
          sessionName,
          imageUrl,
        });
        
        const imageResponse = await fetch(
          `${wahaBaseUrl}/api/sendImage`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              chatId: group.id,
              file: {
                mimetype: "image/jpeg",
                filename: `${property.id}.jpg`,
                url: imageUrl,
              },
              reply_to: null,
              caption: text,
              session: sessionName,
            }),
          }
        );

        if (!imageResponse.ok) {
          const error = await imageResponse.text();
          console.error(`WAHA sendImage error for ${group.name}:`, error);
          throw new Error(`WAHA API error: ${error}`);
        }

        const responseData = await imageResponse.json();
        console.log(`WAHA sendImage success for ${group.name}:`, responseData);
        results.push({ group: group.name, status: "sent with image", response: responseData });
      } else {
        // Send text only
        const textResponse = await fetch(
          `${wahaBaseUrl}/api/sendText`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              chatId: group.id,
              text: text,
              session: sessionName,
            }),
          }
        );

        if (!textResponse.ok) {
          const error = await textResponse.text();
          throw new Error(`WAHA API error: ${error}`);
        }

        results.push({ group: group.name, status: "sent" });
      }
    } catch (err: any) {
      results.push({ group: group.name, status: "failed", error: err.message });
    }
  }

  return results;
}

// Facebook sharing
async function shareToFacebook(account: any, text: string, imageUrl: string) {
  const { pageId, pageAccessToken } = account.config;

  if (!pageId || !pageAccessToken) {
    throw new Error("Facebook configuration incomplete: Page ID and Access Token required");
  }

  try {
    // If image is provided, post as photo with caption
    if (imageUrl) {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/photos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: imageUrl,
            caption: text,
            access_token: pageAccessToken,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Facebook API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return { 
        status: "success", 
        postId: data.id,
        message: "Posted as photo with caption"
      };
    } else {
      // Post as text-only feed post
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
            access_token: pageAccessToken,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Facebook API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return { 
        status: "success", 
        postId: data.id,
        message: "Posted as text feed"
      };
    }
  } catch (err) {
    const error = err as Error;
    throw new Error(`Facebook sharing failed: ${error.message}`);
  }
}

// LinkedIn sharing
async function shareToLinkedIn(account: any, text: string, imageUrl: string) {
  const { accessToken, userId, organizationId } = account.config;

  if (!accessToken) {
    throw new Error("LinkedIn configuration incomplete: Access Token required");
  }

  const author = organizationId ? `urn:li:organization:${organizationId}` : `urn:li:person:${userId}`;

  if (!userId && !organizationId) {
    throw new Error("LinkedIn configuration incomplete: User ID or Organization ID required");
  }

  try {
    if (imageUrl) {
      // Step 1: Register upload for image
      const registerResponse = await fetch(
        "https://api.linkedin.com/v2/assets?action=registerUpload",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
          },
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
              owner: author,
              serviceRelationships: [
                {
                  relationshipType: "OWNER",
                  identifier: "urn:li:userGeneratedContent",
                },
              ],
            },
          }),
        }
      );

      if (!registerResponse.ok) {
        const error = await registerResponse.json();
        throw new Error(`LinkedIn register error: ${error.message || registerResponse.statusText}`);
      }

      const registerData = await registerResponse.json();
      const uploadUrl = registerData.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
      const asset = registerData.value.asset;

      // Step 2: Upload image to LinkedIn
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();

      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
        body: imageBuffer,
      });

      if (!uploadResponse.ok) {
        throw new Error(`LinkedIn image upload error: ${uploadResponse.statusText}`);
      }

      // Step 3: Create post with image
      const postResponse = await fetch(
        "https://api.linkedin.com/v2/ugcPosts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
          },
          body: JSON.stringify({
            author,
            lifecycleState: "PUBLISHED",
            specificContent: {
              "com.linkedin.ugc.ShareContent": {
                shareCommentary: {
                  text,
                },
                shareMediaCategory: "IMAGE",
                media: [
                  {
                    status: "READY",
                    media: asset,
                  },
                ],
              },
            },
            visibility: {
              "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
            },
          }),
        }
      );

      if (!postResponse.ok) {
        const error = await postResponse.json();
        throw new Error(`LinkedIn post error: ${error.message || postResponse.statusText}`);
      }

      const postData = await postResponse.json();
      return { 
        status: "success", 
        postId: postData.id,
        message: "Posted with image"
      };
    } else {
      // Post text-only
      const postResponse = await fetch(
        "https://api.linkedin.com/v2/ugcPosts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
          },
          body: JSON.stringify({
            author,
            lifecycleState: "PUBLISHED",
            specificContent: {
              "com.linkedin.ugc.ShareContent": {
                shareCommentary: {
                  text,
                },
                shareMediaCategory: "NONE",
              },
            },
            visibility: {
              "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
            },
          }),
        }
      );

      if (!postResponse.ok) {
        const error = await postResponse.json();
        throw new Error(`LinkedIn post error: ${error.message || postResponse.statusText}`);
      }

      const postData = await postResponse.json();
      return { 
        status: "success", 
        postId: postData.id,
        message: "Posted as text"
      };
    }
  } catch (err) {
    const error = err as Error;
    throw new Error(`LinkedIn sharing failed: ${error.message}`);
  }
}

// Instagram sharing
async function shareToInstagram(account: any, text: string, imageUrl: string) {
  const { instagramBusinessAccountId, pageAccessToken } = account.config;

  if (!instagramBusinessAccountId || !pageAccessToken) {
    throw new Error("Instagram configuration incomplete: Business Account ID and Page Access Token required");
  }

  if (!imageUrl) {
    throw new Error("Instagram requires an image - text-only posts are not supported");
  }

  try {
    // Step 1: Create media container
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramBusinessAccountId}/media`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: text,
          access_token: pageAccessToken,
        }),
      }
    );

    if (!containerResponse.ok) {
      const error = await containerResponse.json();
      throw new Error(`Instagram container error: ${error.error?.message || containerResponse.statusText}`);
    }

    const containerData = await containerResponse.json();
    const creationId = containerData.id;

    // Step 2: Check container status (optional but recommended)
    let attempts = 0;
    let containerReady = false;
    
    while (attempts < 10 && !containerReady) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const statusResponse = await fetch(
        `https://graph.facebook.com/v18.0/${creationId}?fields=status_code&access_token=${pageAccessToken}`
      );
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.status_code === "FINISHED") {
          containerReady = true;
        } else if (statusData.status_code === "ERROR") {
          throw new Error("Instagram media container processing failed");
        }
      }
      
      attempts++;
    }

    // Step 3: Publish container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramBusinessAccountId}/media_publish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: pageAccessToken,
        }),
      }
    );

    if (!publishResponse.ok) {
      const error = await publishResponse.json();
      throw new Error(`Instagram publish error: ${error.error?.message || publishResponse.statusText}`);
    }

    const publishData = await publishResponse.json();
    return { 
      status: "success", 
      postId: publishData.id,
      message: "Published to Instagram"
    };
  } catch (err) {
    const error = err as Error;
    throw new Error(`Instagram sharing failed: ${error.message}`);
  }
}
