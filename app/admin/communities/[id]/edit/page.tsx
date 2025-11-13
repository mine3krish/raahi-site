"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { INDIAN_STATES } from "@/lib/constants";

export default function EditCommunityPage() {
  const router = useRouter();
  const params = useParams();
  const communityId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    state: "",
    memberCount: "0",
    whatsappLink: "",
    active: true,
  });

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/admin/communities/${communityId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch community");
        }

        const data = await response.json();
        const community = data.community || data;

        setFormData({
          id: community.id,
          name: community.name,
          description: community.description || "",
          state: community.state,
          memberCount: community.memberCount?.toString() || "0",
          whatsappLink: community.whatsappLink,
          active: community.active,
        });

        setExistingImage(community.image || "");
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load community");
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [communityId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.name) return "Community name is required";
    if (!formData.state) return "State is required";
    if (!formData.whatsappLink) return "WhatsApp link is required";
    if (!formData.whatsappLink.includes("whatsapp.com") && !formData.whatsappLink.includes("wa.me")) {
      return "Please enter a valid WhatsApp link";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSaving(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });

      // Add existing image if no new image
      if (!imageFile && existingImage) {
        formDataToSend.append("existingImage", existingImage);
      }

      // Add new image if exists
      if (imageFile) {
        formDataToSend.append("image_file", imageFile);
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/communities/${communityId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update community");
      }

      router.push("/admin/communities");
    } catch (err: any) {
      setError(err.message || "Failed to update community");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="max-w-3xl mx-auto p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading community...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto p-8">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-800 mb-6"
      >
        Edit Community
      </motion.h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-gray-200 rounded-2xl p-6">
        {/* Community ID - Read Only */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Community ID</label>
          <input
            type="text"
            value={formData.id}
            disabled
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </div>

        {/* Community Name */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Community Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">State *</label>
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* Member Count */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Member Count</label>
          <input
            type="number"
            name="memberCount"
            value={formData.memberCount}
            onChange={handleChange}
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* WhatsApp Link */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">WhatsApp Group Link *</label>
          <input
            type="url"
            name="whatsappLink"
            value={formData.whatsappLink}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Community Image */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Community Image</label>
          {existingImage && !imagePreview && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Current Image:</p>
              <img src={existingImage} alt="Current" className="w-32 h-32 object-cover rounded-lg" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          {imagePreview && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">New Image Preview:</p>
              <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
            </div>
          )}
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Active (visible to users)</span>
          </label>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update Community"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/communities")}
            className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
