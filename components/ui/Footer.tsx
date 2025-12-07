"use client";

import { useEffect, useState } from "react";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
  const [settings, setSettings] = useState({
    facebookUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
    footerText: `© ${new Date().getFullYear()} Raahi Auction Private Limited. All rights reserved.`,
  });

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings({
          facebookUrl: data.facebookUrl || "",
          twitterUrl: data.twitterUrl || "",
          instagramUrl: data.instagramUrl || "",
          linkedinUrl: data.linkedinUrl || "",
          youtubeUrl: data.youtubeUrl || "",
          footerText: data.footerText || settings.footerText,
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <img 
            src="/logo.png" 
            alt="Raahi Auction Logo" 
            className="h-20 w-auto mb-4"
          />
          <p className="text-gray-600 text-sm leading-relaxed">
            Discover, bid, and own verified properties across India.
            Bank-financed listings with transparent auctions and trusted agents.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-gray-800 font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li><a href="/" className="hover:text-green-600 transition">Home</a></li>
            <li><a href="/properties" className="hover:text-green-600 transition">Properties</a></li>
            <li><a href="/about" className="hover:text-green-600 transition">About Us</a></li>
            <li><a href="/join" className="hover:text-green-600 transition">Join as Member</a></li>
            <li><a href="/contact" className="hover:text-green-600 transition">Contact</a></li>
            <li><a href="/privacy-policy" className="hover:text-green-600 transition">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mt-12 pt-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Socials */}
          <div className="flex gap-4">
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-500 hover:text-green-600 transition">
                <Facebook size={18} />
              </a>
            )}
            {settings.twitterUrl && (
              <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-gray-500 hover:text-green-600 transition">
                <Twitter size={18} />
              </a>
            )}
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-500 hover:text-green-600 transition">
                <Instagram size={18} />
              </a>
            )}
            {settings.linkedinUrl && (
              <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-500 hover:text-green-600 transition">
                <Linkedin size={18} />
              </a>
            )}
            {settings.youtubeUrl && (
              <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-gray-500 hover:text-green-600 transition">
                <Youtube size={18} />
              </a>
            )}
          </div>

          {/* Copyright */}
          <p className="text-gray-500 text-sm text-center md:text-right">
            {settings.footerText}
          </p>
        </div>
      </div>
    </footer>
  );
}
