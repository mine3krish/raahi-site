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
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditEmail(user.email || "");
      setEditMobile(user.mobile ? user.mobile.replace("+91", "") : "");
    }
  }, [user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError("");
    setMessage("");
    if (user) {
      setEditName(user.name || "");
      setEditEmail(user.email || "");
      setEditMobile(user.mobile ? user.mobile.replace("+91", "") : "");
    }
  };

  const handleSaveProfile = async () => {
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          email: editEmail || undefined,
          mobile: editMobile ? `+91${editMobile}` : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Update local storage
      localStorage.setItem("user", JSON.stringify(data.user));
      setMessage("Profile updated successfully!");
      setIsEditing(false);
      
      // Force page reload to update user context
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

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
              {message && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {message}
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-700 font-medium">
                        +91
                      </div>
                      <input
                        type="tel"
                        value={editMobile}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 10) setEditMobile(value);
                        }}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="9876543210"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-green-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={handleEditToggle}
                      disabled={saving}
                      className="bg-gray-100 border border-gray-200 text-gray-700 px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6 text-left space-y-2">
                    <p className="text-gray-700">
                      <span className="font-semibold text-gray-900">Name:</span>{" "}
                      {user.name || "Not set"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold text-gray-900">Email:</span>{" "}
                      {user.email || "Not set"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold text-gray-900">Mobile:</span>{" "}
                      {user.mobile || "Not set"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleEditToggle}
                      className="bg-green-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-green-700 transition"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => logout()}
                      className="bg-gray-100 border border-gray-200 text-gray-700 px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition"
                      aria-label="Log out"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center">
              No user data available. Please{" "}
              <Link href="/login" className="text-green-600 hover:underline">
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
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600"></div>
            </div>
          ) : wishlistProperties.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <p className="text-gray-500 mb-4">
                Your wishlist is currently empty. Start exploring properties and
                save your favorites!
              </p>
              <Link
                href="/properties"
                className="inline-block bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition"
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
