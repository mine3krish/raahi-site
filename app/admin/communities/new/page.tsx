"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { INDIAN_STATES } from "@/lib/constants";

export default function AddCommunityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
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
    if (!formData.id) return "Community ID is required";
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
    setLoading(true);
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });

      // Add image if exists
      if (imageFile) {
        formDataToSend.append("image_file", imageFile);
      }

      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/communities", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create community");
      }

      router.push("/admin/communities");
    } catch (err: any) {
      setError(err.message || "Failed to create community");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto p-8">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-800 mb-6"
      >
        Add New Community
      </motion.h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-gray-200 rounded-2xl p-6">
        {/* Community ID */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Community ID * <span className="text-xs text-gray-500">(unique identifier)</span>
          </label>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="e.g., MH-MUMBAI-001"
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
            placeholder="Mumbai Property Investors"
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
            placeholder="A community for property investors in Mumbai..."
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
          <label className="block text-sm text-gray-700 mb-1">
            Member Count <span className="text-xs text-gray-500">(approximate)</span>
          </label>
          <input
            type="number"
            name="memberCount"
            value={formData.memberCount}
            onChange={handleChange}
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="0"
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
            placeholder="https://chat.whatsapp.com/..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the WhatsApp group invite link
          </p>
        </div>

        {/* Community Image */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Community Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          {imagePreview && (
            <div className="mt-3">
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
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Community"}
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
