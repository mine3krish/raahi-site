"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { INDIAN_STATES } from "@/lib/constants";

export default function AddPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [noticeFile, setNoticeFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    location: "",
    state: "",
    type: "Residential",
    reservePrice: "",
    EMD: "",
    AuctionDate: "",
    area: "",
    featured: false,
    bestDeal: false,
    premium: false,
    status: "Active",
    assetCategory: "",
    assetAddress: "",
    assetCity: "",
    borrowerName: "",
    publicationDate: "",
    auctionStartDate: "",
    auctionEndTime: "",
    applicationSubmissionDate: "",
    agentMobile: "+91 848 884 8874",
    note: "",
    youtubeVideo: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value 
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5); // Limit to 5 images
    setImageFiles(files);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleNoticeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNoticeFile(file);
  };

  const validateForm = () => {
    if (!formData.id) return "Property ID is required";
    if (!formData.name) return "Property name is required";
    if (!formData.location) return "Location is required";
    if (!formData.state) return "State is required";
    if (!formData.reservePrice || parseFloat(formData.reservePrice) <= 0) return "Valid reserve price is required";
    if (!formData.EMD || parseFloat(formData.EMD) <= 0) return "Valid EMD is required";
    if (!formData.AuctionDate) return "Auction date is required";
    if (imageFiles.length === 0) return "At least one image is required";
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

      // Add images
      imageFiles.forEach((file, index) => {
        formDataToSend.append(`image_${index}`, file);
      });

      // Add notice file if exists
      if (noticeFile) {
        formDataToSend.append('notice_file', noticeFile);
      }

      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/properties", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add property");
      }

      router.push("/admin/properties");
    } catch (err: any) {
      setError(err.message || "Failed to add property");
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
        Add New Property
      </motion.h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-gray-200 rounded-2xl p-6">
        {/* Property ID */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Property ID *</label>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="PROP001"
          />
        </div>

        {/* Property Name */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Property Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Luxury Apartment in Mumbai"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Location *</label>
          <textarea
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Enter detailed location/address..."
          />
        </div>

        {/* State Dropdown */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">State *</label>
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        {/* Reserve Price */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Reserve Price (₹) *</label>
          <input
            type="number"
            name="reservePrice"
            value={formData.reservePrice}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="5000000"
          />
        </div>

        {/* EMD */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">EMD Amount (₹) *</label>
          <input
            type="number"
            name="EMD"
            value={formData.EMD}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="500000"
          />
        </div>

        {/* Auction Date */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Auction Date *</label>
          <input
            type="text"
            name="AuctionDate"
            value={formData.AuctionDate}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="DD-MM-YYYY or any format"
          />
        </div>

        {/* Area */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Area (sq ft)</label>
          <input
            type="number"
            name="area"
            value={formData.area}
            onChange={handleChange}
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="1200"
          />
        </div>

        {/* Multiple Images Upload */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Property Images * (Max 5)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <p className="text-xs text-gray-500 mt-1">Select up to 5 images. First image will be the main image.</p>
          
          {imageFiles.length > 0 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {imageFiles.map((file, index) => (
                <div key={index} className="relative">
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
                  >
                    ×
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded">Main</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* YouTube Video */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">YouTube Video URL (Optional)</label>
          <input
            type="url"
            name="youtubeVideo"
            value={formData.youtubeVideo}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <p className="text-xs text-gray-500 mt-1">Paste YouTube video URL to embed a property tour video</p>
        </div>

        {/* Notice Upload */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Notice Document</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleNoticeChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          {noticeFile && (
            <div className="mt-2 text-sm text-gray-600">
              Selected: {noticeFile.name}
            </div>
          )}
        </div>

        {/* Additional Auction Details Section */}
        <div className="border-t pt-5 mt-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Auction Details</h3>
          
          {/* Asset Category */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Asset Category</label>
            <input
              type="text"
              name="assetCategory"
              value={formData.assetCategory}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="e.g., Residential Property, Commercial Building"
            />
          </div>

          {/* Asset Address */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Asset Address</label>
            <textarea
              name="assetAddress"
              value={formData.assetAddress}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Full asset address"
            />
          </div>

          {/* Asset City */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Asset City</label>
            <input
              type="text"
              name="assetCity"
              value={formData.assetCity}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="City name"
            />
          </div>

          {/* Borrower Name */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Borrower Name</label>
            <input
              type="text"
              name="borrowerName"
              value={formData.borrowerName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Name of borrower"
            />
          </div>

          {/* Publication Date */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Publication Date</label>
            <input
              type="text"
              name="publicationDate"
              value={formData.publicationDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="DD-MM-YYYY or any format"
            />
          </div>

          {/* Auction Start Date */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Auction Start Date</label>
            <input
              type="text"
              name="auctionStartDate"
              value={formData.auctionStartDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="DD-MM-YYYY or any format"
            />
          </div>

          {/* Auction End Time */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Auction End Time</label>
            <input
              type="text"
              name="auctionEndTime"
              value={formData.auctionEndTime}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="DD-MM-YYYY HH:MM or any format"
            />
          </div>

          {/* Application Submission Date */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Application Submission Date</label>
            <input
              type="text"
              name="applicationSubmissionDate"
              value={formData.applicationSubmissionDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="DD-MM-YYYY or any format"
            />
          </div>

          {/* Agent Mobile */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Agent Mobile Number *</label>
            <input
              type="text"
              name="agentMobile"
              value={formData.agentMobile}
              onChange={handleChange}
              required
              placeholder="+91 848 884 8874"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
        </div>

        {/* Note Field */}
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">Note (Optional)</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Add any additional notes or information about this property..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        {/* Type, Status & Featured */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Property Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Land">Land</option>
              <option value="Industrial">Industrial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="Active">Active</option>
              <option value="Sold">Sold</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Featured</span>
            </label>
          </div>
        </div>

        {/* Property Flags */}
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="bestDeal"
              checked={formData.bestDeal}
              onChange={handleChange}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Best Deal</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="premium"
              checked={formData.premium}
              onChange={handleChange}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Premium Property</span>
          </label>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Add Property"}
          </button>
          {formData.id && (
            <button
              type="button"
              onClick={() => window.open(`/properties/${formData.id}`, '_blank')}
              className="px-6 py-2 bg-white border-2 border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition"
            >
              View Property
            </button>
          )}
          <button
            type="button"
            onClick={() => router.push("/admin/properties")}
            className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

