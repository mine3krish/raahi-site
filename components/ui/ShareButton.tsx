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
  agentMobile?: string;
  isPremium?: boolean;
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
  agentMobile = "+91 848 884 8874",
  isPremium = false,
}: ShareButtonProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  
  const generateCaption = () => {
    const locationParts = location?.includes(',') ? location.split(',') : [location];
    const city = locationParts[0]?.trim() || location;
    const stateValue = state || locationParts[1]?.trim() || "";
    
    return `🏛️ Attention Investors! Bank Auction Alert! 🏛️

📋 Listing ID: ${propertyId}
📍 Location: ${city}${stateValue ? `, ${stateValue}` : ''}
🏢 Property Type: ${propertyType || 'Property'}
💰 Reserve Price: ${price}${emd ? `
💳 EMD Amount: ${emd}` : ''}${auctionDate ? `
📅 Auction Date: ${auctionDate}` : ''}

🏠 Property Details:${assetAddress ? `
📌 Location: ${assetAddress}` : ''}

✨ Don't miss out on this fantastic opportunity to own a prime property in ${city}! 

⚡ For more information or to participate in the auction, contact Raahi Auction at:
📞 Phone: ${agentMobile}

🔗 View Full Details: ${shareUrl}

#RealEstate #PropertyAuction ${city ? `#${city.replace(/\s+/g, '')}` : ''} #InvestmentOpportunity #BankAuction #RaahiAuction

📧 Contact Us: 
🌐 For more details, visit: www.raahiauction.com`;
  };

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${isPremium ? '/premium-projects' : '/properties'}/${propertyId}`;
  const caption = generateCaption();

  const handleShareClick = async () => {
    setShowShareModal(true);
  };

  return (
    <>
      {compact ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleShareClick();
          }}
          className="p-2 rounded-full bg-white/90 text-gray-600 hover:bg-green-500 hover:text-white transition-colors duration-200 ease-in-out"
          title="Share Property"
        >
          <Share2 size={18} strokeWidth={2} />
        </button>
      ) : (
        <button
          onClick={handleShareClick}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-green-600 text-green-600 font-semibold hover:bg-green-50 transition"
        >
          <Share2 size={20} />
          Share
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
                            window.open(`https://api.whatsapp.com/send/?text=${encodeURIComponent(caption)}`, '_blank');
                          } catch {
                            window.open(`https://api.whatsapp.com/send/?text=${encodeURIComponent(caption)}`, '_blank');
                          }
                        }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="hover:scale-110 transition-transform duration-200 ease-in-out">
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
                        <div className="hover:scale-110 transition-transform duration-200 ease-in-out">
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
                        <div className="hover:scale-110 transition-transform duration-200 ease-in-out">
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
                        <div className="hover:scale-110 transition-transform duration-200 ease-in-out">
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
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center hover:scale-110 transition-transform duration-200 ease-in-out">
                          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="18" cy="6" r="1.5" fill="currentColor"/>
                          </svg>
                        </div>
                        <span className="text-xs text-gray-600">Instagram</span>
                      </button>
                </div>

                {/* Info Message */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-800">
                    <strong>Caption copied!</strong> Simply click any platform above and paste to share.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
