"use client";
import { motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function WhatsAppButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const message = "Hi, I'm interested in your auction properties.";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          const number = data.whatsappNumber || "+918488848874";
          // Remove all non-numeric characters
          setPhoneNumber(number.replace(/[^0-9]/g, ''));
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        setPhoneNumber("918488848874");
      }
    };
    fetchSettings();
  }, []);

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // Don't render if no phone number configured
  if (!phoneNumber) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          className="absolute bottom-20 right-0 bg-white rounded-lg shadow-xl p-4 w-64 mb-2"
        >
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={16} />
          </button>
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
              <MessageCircle className="text-green-600" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Need Help?</h4>
              <p className="text-sm text-gray-600 mb-3">
                Chat with us on WhatsApp for quick assistance!
              </p>
              <button
                onClick={handleClick}
                className="bg-green-600 text-white text-sm px-4 py-2 rounded-full hover:bg-green-700 transition w-full"
              >
                Start Chat
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        onHoverStart={() => setIsExpanded(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl transition-all duration-300 group relative"
        aria-label="Chat on WhatsApp"
      >
        {/* Ripple effect */}
        <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></span>
        
        <MessageCircle size={28} className="relative z-10" />
        
        {/* Online indicator */}
        <span className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full border-2 border-green-500"></span>
      </motion.button>
    </div>
  );
}
