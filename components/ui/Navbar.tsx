"use client";
import { use, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface NavLink {
  name: string;
  href: string;
}

const Links: NavLink[] = [
  { name: "Home", href: "/" },
  { name: "Properties", href: "/properties" },
  { name: "About Us", href: "/about" },
  { name: "Communities", href: "/communities" },
  { name: "Newspaper", href: "/newspaper" },
  { name: "Join as Agent", href: "/join" },
  { name: "Contact Us", href: "/contact" },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");

  const toggleMenu = () => setMobileOpen((prev) => !prev);
  const toggleSearch = () => setSearchOpen((prev) => !prev);
  const closeMenu = () => setMobileOpen(false);

  const handleSearch = (e: React.FormEvent, isMobile: boolean = false) => {
    e.preventDefault();
    const query = isMobile ? mobileSearchQuery : searchQuery;
    if (query.trim()) {
      router.push(`/properties?search=${encodeURIComponent(query.trim())}`);
      setSearchQuery("");
      setMobileSearchQuery("");
      if (isMobile) {
        setSearchOpen(false);
      }
    }
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    router.push("/");
  };

  return (
    <nav className="w-full bg-white sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main navbar */}
        <div className="flex justify-between h-16 items-center">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <img 
                src="/logo.png" 
                alt="Raahi Auction Logo" 
                className="h-15 w-auto md:h-15"
              />
            </Link>
          </div>

          {/* Center: Desktop search bar */}
          <div className="hidden md:flex items-center flex-1 mx-6 max-w-md">
            <form onSubmit={(e) => handleSearch(e, false)} className="relative w-full">
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full pl-10 pr-4 py-2 bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
              <button
                type="submit"
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 hover:text-green-600 transition"
              >
                <Search strokeWidth={2} />
              </button>
            </form>
          </div>

          {/* Right: Desktop links + Mobile search */}
          <div className="flex items-center space-x-4">
            {/* Desktop links */}
            <div className="hidden md:flex items-center space-x-6">
              {Links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-700 hover:text-green-600 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              {!isAuthenticated ? 
                <Link
                  href="/login"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-all"
                >
                  Login
                </Link>
                :
                <Link
                  href="/profile"
                  className="px-4 py-2 rounded-md hover:text-gray-600 transition-all"
                >
                  {user?.name || "Profile"}
                </Link>
              }
            </div>

            {/* Mobile icons */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={toggleSearch}
                className="p-2 text-gray-700 focus:outline-none transition-all hover:bg-gray-100 rounded-full"
                aria-label="Search"
              >
                <Search size={22} />
              </button>
              <button
                onClick={toggleMenu}
                className="p-2 text-gray-700 focus:outline-none transition-all hover:bg-gray-100 rounded-full"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Mobile Search Drawer */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-gradient-to-b from-white to-gray-50 border-t border-gray-200"
          >
            <div className="px-4 py-4">
              <form onSubmit={(e) => handleSearch(e, true)} className="relative">
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full rounded-xl pl-12 pr-4 py-3 bg-white border-2 border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  type="submit"
                  className="absolute left-4 top-3.5 text-gray-400 hover:text-green-600 transition"
                  aria-label="Search"
                >
                  <Search size={20} strokeWidth={2} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-gradient-to-b from-white to-gray-50 border-t border-gray-200"
          >
            <nav className="px-4 py-4 space-y-2">
              <Link
                href="/properties"
                onClick={closeMenu}
                className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-white rounded-xl transition-all"
              >
                Properties
              </Link>
              <Link
                href="/communities"
                onClick={closeMenu}
                className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-white rounded-xl transition-all"
              >
                Communities
              </Link>
              <Link
                href="/join"
                onClick={closeMenu}
                className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-white rounded-xl transition-all"
              >
                Join as agent
              </Link>
              <Link
                href="/contact"
                onClick={closeMenu}
                className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-white rounded-xl transition-all"
              >
                Contact Us
              </Link>
              {user && user.isAdmin && (
                <Link
                  href="/admin"
                  onClick={closeMenu}
                  className="flex items-center px-4 py-3 text-base font-medium text-green-600 hover:bg-green-50 rounded-xl transition-all"
                >
                  Admin
                </Link>
              )}
              
              <div className="pt-3 mt-3 border-t border-gray-200">
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={closeMenu}
                      className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-white rounded-xl transition-all"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      onClick={closeMenu}
                      className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-white rounded-xl transition-all text-center"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={closeMenu}
                      className="block px-4 py-3 text-base font-semibold bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 rounded-xl transition-all text-center"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
