"use client";

import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <img 
            src="/logo.png" 
            alt="Raahi Auction Logo" 
            className="h-12 w-auto mb-4"
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
            <li><a href="/join" className="hover:text-green-600 transition">Join as a agent</a></li>
            <li><a href="/contact" className="hover:text-green-600 transition">Contact</a></li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mt-12 pt-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Socials */}
          <div className="flex gap-4">
            <a href="#" aria-label="Facebook" className="text-gray-500 hover:text-green-600 transition">
              <Facebook size={18} />
            </a>
            <a href="#" aria-label="Twitter" className="text-gray-500 hover:text-green-600 transition">
              <Twitter size={18} />
            </a>
            <a href="#" aria-label="Instagram" className="text-gray-500 hover:text-green-600 transition">
              <Instagram size={18} />
            </a>
            <a href="#" aria-label="LinkedIn" className="text-gray-500 hover:text-green-600 transition">
              <Linkedin size={18} />
            </a>
            <a href="#" aria-label="Email" className="text-gray-500 hover:text-green-600 transition">
              <Mail size={18} />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-gray-500 text-sm text-center md:text-right">
            © {new Date().getFullYear()} Raahi Auction Private Limited. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
