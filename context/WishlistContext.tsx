"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  wishlist: string[];
  isInWishlist: (propertyId: string) => boolean;
  addToWishlist: (propertyId: string) => Promise<void>;
  removeFromWishlist: (propertyId: string) => Promise<void>;
  toggleWishlist: (propertyId: string) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { token, isAuthenticated } = useAuth();

  // Fetch wishlist on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [isAuthenticated, token]);

  const fetchWishlist = async () => {
    if (!token) return;
    
    try {
      const response = await fetch("/api/wishlist", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(data.propertyIds || []);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  };

  const isInWishlist = (propertyId: string) => {
    return wishlist.includes(propertyId);
  };

  const addToWishlist = async (propertyId: string) => {
    if (!token) {
      alert("Please login to add to wishlist");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ propertyId }),
      });

      if (response.ok) {
        setWishlist(prev => [...prev, propertyId]);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to add to wishlist");
      }
    } catch (err: any) {
      console.error("Add to wishlist error:", err);
      alert(err.message || "Failed to add to wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (propertyId: string) => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/wishlist?propertyId=${propertyId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setWishlist(prev => prev.filter(id => id !== propertyId));
      } else {
        throw new Error("Failed to remove from wishlist");
      }
    } catch (err: any) {
      console.error("Remove from wishlist error:", err);
      alert(err.message || "Failed to remove from wishlist");
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (propertyId: string) => {
    if (isInWishlist(propertyId)) {
      await removeFromWishlist(propertyId);
    } else {
      await addToWishlist(propertyId);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
};
