"use client";

import { Share2, X } from "lucide-react";
import { useState } from "react";
import {
  WhatsappIcon,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
} from "react-share";
import { motion, AnimatePresence } from "framer-motion";

interface ShareButtonProps {
  propertyId: string;
  propertyName: string;
  location: string;
  price: string;
  image: string;
  compact?: boolean;
  propertyType?: string;
  emd?: string;
  auctionDate?: string;
  state?: string;
  area?: string;
  assetAddress?: string;
}

export default function ShareButton({
  propertyId,
  propertyName,
  location,
  price,
  image,
  compact = false,
  propertyType = "",
  emd = "",
  auctionDate = "",
  state = "",
  area = "",
  assetAddress = "",
}: ShareButtonProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string>("");
  
  const generateCaption = () => {
    const locationParts = location.split(',');
    const city = locationParts[0]?.trim() || location;
    const stateValue = state || locationParts[1]?.trim() || "";
    
    return `Attention Investors! Bank Auction Alert!

Location: ${city}${stateValue ? `, ${stateValue}` : ''}
Property Type: ${propertyType || 'Property'}
Reserve Price: ${price}${emd ? `
EMD Amount: ${emd}` : ''}${auctionDate ? `
Auction Date: ${auctionDate}` : ''}
Listing ID: ${propertyId}

Property Details:${assetAddress ? `
- Location: ${assetAddress}` : ''}${area ? `
- Area: ${area} sq ft` : ''}

Don't miss out on this fantastic opportunity to own a prime property in ${city}! 

For more information or to participate in the auction, contact Raahi Auction at:
Phone: +91 8488 8488 74

#RealEstate #PropertyAuction #${city.replace(/\s+/g, '')} #InvestmentOpportunity #BankAuction #RaahiAuction

Contact Us: 
For more details, 
visit: www.raahiauction.com`;
  };

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/properties/${propertyId}`;
  const caption = generateCaption();

  const handleShareClick = async () => {
    setShowShareModal(true);
    if (!posterUrl) {
      await generatePoster();
    }
  };

  const generatePoster = async () => {
    setGenerating(true);
    try {
      // Create a canvas for the poster
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size (High resolution for Instagram)
      canvas.width = 2160;  // 2x for better quality
      canvas.height = 2700;

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load and draw property image
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = image.startsWith("http") ? image : `${window.location.origin}${image}`;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Draw image with shadow and rounded corners (scaled 2x)
      const imgHeight = 1400;
      const imgY = 120;
      const imgX = 80;
      const imgWidth = canvas.width - 160;
      
      // Shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 20;
      
      ctx.save();
      roundRect(ctx, imgX, imgY, imgWidth, imgHeight, 40);
      ctx.clip();
      
      // Calculate image dimensions to cover the area
      const imgAspect = img.width / img.height;
      const boxAspect = imgWidth / imgHeight;
      let drawWidth, drawHeight, drawX, drawY;
      
      if (imgAspect > boxAspect) {
        drawHeight = imgHeight;
        drawWidth = imgHeight * imgAspect;
        drawX = imgX - (drawWidth - imgWidth) / 2;
        drawY = imgY;
      } else {
        drawWidth = imgWidth;
        drawHeight = drawWidth / imgAspect;
        drawX = imgX;
        drawY = imgY - (drawHeight - imgHeight) / 2;
      }
      
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();
      
      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Property ID badge (scaled 2x)
      const boxY = imgY + imgHeight + 100;
      ctx.fillStyle = "#2563eb";
      ctx.beginPath();
      ctx.roundRect(140, boxY - 20, 400, 100, 50);
      ctx.fill();
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 56px Arial, sans-serif";
      ctx.fillText(`#${propertyId}`, 180, boxY + 46);

      // Property Name (scaled 2x)
      ctx.fillStyle = "#1f2937";
      ctx.font = "bold 88px Arial, sans-serif";
      wrapText(ctx, propertyName, 140, boxY + 200, canvas.width - 280, 104);

      // Location with icon background (scaled 2x)
      ctx.fillStyle = "#f3f4f6";
      ctx.beginPath();
      ctx.roundRect(140, boxY + 360, canvas.width - 280, 100, 20);
      ctx.fill();
      
      ctx.fillStyle = "#6b7280";
      ctx.font = "60px Arial, sans-serif";
      ctx.fillText(location, 180, boxY + 430);

      // Price with background (scaled 2x)
      ctx.fillStyle = "#eff6ff";
      ctx.beginPath();
      ctx.roundRect(140, boxY + 520, canvas.width - 280, 140, 20);
      ctx.fill();
      
      ctx.fillStyle = "#2563eb";
      ctx.font = "bold 100px Arial, sans-serif";
      ctx.fillText(price, 180, boxY + 620);

      // Footer divider (scaled 2x)
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(140, boxY + 760);
      ctx.lineTo(canvas.width - 140, boxY + 760);
      ctx.stroke();

      // Footer (scaled 2x)
      ctx.fillStyle = "#1f2937";
      ctx.font = "bold 76px Arial, sans-serif";
      ctx.fillText("Raahi Auction", 140, boxY + 880);
      
      ctx.fillStyle = "#2563eb";
      ctx.font = "bold 64px Arial, sans-serif";
      ctx.fillText("+91 84888 48874", 140, boxY + 980);

      // Convert to blob and create URL
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        setPosterUrl(url);
      }, "image/png");
    } catch (error) {
      console.error("Error generating poster:", error);
      alert("Failed to generate poster. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // Helper function for rounded rectangles
  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  // Helper function for text wrapping
  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    const words = text.split(" ");
    let line = "";
    let lines = [];

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        lines.push(line);
        line = words[i] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    // Only show first 2 lines
    lines = lines.slice(0, 2);
    if (text.length > 50 && lines.length === 2) {
      lines[1] = lines[1].trim() + "...";
    }

    lines.forEach((line, i) => {
      ctx.fillText(line, x, y + i * lineHeight);
    });
  }

  return (
    <>
      {compact ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleShareClick();
          }}
          disabled={generating}
          className={`p-2 rounded-full bg-white/90 text-gray-600 hover:bg-green-500 hover:text-white transition-all ${
            generating ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title="Share Property"
        >
          <Share2 size={18} strokeWidth={2} />
        </button>
      ) : (
        <button
          onClick={handleShareClick}
          disabled={generating}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-green-600 text-green-600 font-semibold hover:bg-green-50 transition ${
            generating ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Share2 size={20} />
          {generating ? "Generating..." : "Share"}
        </button>
      )}

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowShareModal(false)}
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-w-2xl mx-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Share Property</h3>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <X size={24} />
                  </button>
                </div>

                {generating && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600"></div>
                    <span className="ml-3 text-gray-600">Generating poster...</span>
                  </div>
                )}

                {!generating && (
                  <>
                    {/* Property Info */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-1">{propertyName}</h4>
                      <p className="text-sm text-gray-600">{location}</p>
                      <p className="text-lg font-bold text-green-600 mt-2">{price}</p>
                    </div>

                    {/* Share Buttons */}
                    <div className="grid grid-cols-5 gap-4 mb-6">
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(caption);
                            window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, '_blank');
                          } catch {
                            window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, '_blank');
                          }
                        }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="hover:scale-110 transition">
                          <WhatsappIcon size={56} round />
                        </div>
                        <span className="text-xs text-gray-600">WhatsApp</span>
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(caption);
                          } catch {}
                          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(caption)}`, '_blank');
                        }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="hover:scale-110 transition">
                          <FacebookIcon size={56} round />
                        </div>
                        <span className="text-xs text-gray-600">Facebook</span>
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(caption);
                          } catch {}
                          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
                        }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="hover:scale-110 transition">
                          <TwitterIcon size={56} round />
                        </div>
                        <span className="text-xs text-gray-600">Twitter</span>
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(caption);
                          } catch {}
                          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
                        }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="hover:scale-110 transition">
                          <LinkedinIcon size={56} round />
                        </div>
                        <span className="text-xs text-gray-600">LinkedIn</span>
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(caption);
                            alert("Caption copied to clipboard!\n\nPaste it on Instagram along with the poster image.");
                          } catch {
                            alert("Please copy the caption manually and share on Instagram.");
                          }
                        }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center hover:scale-110 transition">
                          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="18" cy="6" r="1.5" fill="currentColor"/>
                          </svg>
                        </div>
                        <span className="text-xs text-gray-600">Instagram</span>
                      </button>
                    </div>

                    {/* Download Poster Button */}
                    {posterUrl && (
                      <button
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = posterUrl;
                          a.download = `raahi-auction-${propertyId}.png`;
                          a.click();
                        }}
                        className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition mb-4"
                      >
                        Download Poster Image
                      </button>
                    )}

                    {/* Info Message */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="text-sm text-green-800">
                        <strong>How to share:</strong>
                      </p>
                      <ol className="text-sm text-green-800 mt-2 ml-4 list-decimal space-y-1">
                        <li>Download the poster image using the button above</li>
                        <li>Click on your preferred social media platform</li>
                        <li>The caption will be copied automatically</li>
                        <li>Attach the downloaded image and paste the caption</li>
                      </ol>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
