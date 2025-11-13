"use client";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import PropertyCard from "@/components/ui/PropertyCard";

interface Property {
  id: string;
  name: string;
  location: string;
  state: string;
  reservePrice: number;
  images: string[];
}

export default function Profile() {
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const [wishlistProperties, setWishlistProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProperties = async () => {
      if (wishlist.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const promises = wishlist.map(id => 
          fetch(`/api/properties/${id}`).then(res => res.json())
        );
        const results = await Promise.all(promises);
        setWishlistProperties(results.filter(r => r.property).map(r => r.property));
      } catch (err) {
        console.error("Failed to fetch wishlist properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProperties();
  }, [wishlist]);

  return (
    <section className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            My Profile
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your account and view your saved properties
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-gray-200 rounded-2xl p-8 max-w-xl mx-auto"
        >
          {user ? (
            <>
              <div className="mb-6 text-left">
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold text-gray-900">Name:</span>{" "}
                  {user.name}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">Email:</span>{" "}
                  {user.email}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="/profile/edit"
                  className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition"
                >
                  Edit Profile
                </Link>
                <button
                  onClick={() => logout()}
                  className="bg-gray-100 border border-gray-200 text-gray-700 px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition"
                  aria-label="Log out"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center">
              No user data available. Please{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                log in
              </Link>{" "}
              to continue.
            </p>
          )}
        </motion.div>

        {/* Wishlist Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Your Wishlist
            </h2>
            <p className="text-gray-600">
              Properties you've saved for later
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            </div>
          ) : wishlistProperties.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <p className="text-gray-500 mb-4">
                Your wishlist is currently empty. Start exploring properties and
                save your favorites!
              </p>
              <Link
                href="/properties"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
              >
                Browse Properties
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistProperties.map((p) => (
                <PropertyCard
                  key={p.id}
                  id={p.id}
                  title={p.name}
                  location={`${p.location}, ${p.state}`}
                  price={`₹${(p.reservePrice / 10000000).toFixed(2)}Cr`}
                  image={p.images[0] || "/image.png"}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
