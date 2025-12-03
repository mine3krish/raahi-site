"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { INDIAN_STATES } from "@/lib/constants";

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [noticeFile, setNoticeFile] = useState<File | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingNotice, setExistingNotice] = useState("");

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
    status: "Active",
    assetCategory: "",
    assetAddress: "",
    assetCity: "",
    borrowerName: "",
    publicationDate: "",
    auctionStartDate: "",
    auctionEndTime: "",
    applicationSubmissionDate: "",
  });

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/admin/properties/${propertyId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch property");
        }

        const data = await response.json();
        const property = data.property || data;

        setFormData({
          id: property.id,
          name: property.name,
          location: property.location,
          state: property.state,
          type: property.type,
          reservePrice: property.reservePrice.toString(),
          EMD: property.EMD.toString(),
          AuctionDate: property.AuctionDate || "",
          area: property.area?.toString() || "",
          featured: property.featured,
          status: property.status,
          assetCategory: property.assetCategory || "",
          assetAddress: property.assetAddress || "",
          assetCity: property.assetCity || "",
          borrowerName: property.borrowerName || "",
          publicationDate: property.publicationDate || "",
          auctionStartDate: property.auctionStartDate || "",
          auctionEndTime: property.auctionEndTime || "",
          applicationSubmissionDate: property.applicationSubmissionDate || "",
        });
        
        setExistingImages(property.images || []);
        setExistingNotice(property.notice || "");
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load property");
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value 
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
  };

  const handleNoticeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNoticeFile(file);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.name) return "Property name is required";
    if (!formData.location) return "Location is required";
    if (!formData.state) return "State is required";
    if (!formData.reservePrice || parseFloat(formData.reservePrice) <= 0) return "Valid reserve price is required";
    if (!formData.EMD || parseFloat(formData.EMD) <= 0) return "Valid EMD is required";
    if (!formData.AuctionDate) return "Auction date is required";
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

      // Add existing images
      formDataToSend.append("existingImages", JSON.stringify(existingImages));

      // Add new images
      imageFiles.forEach((file, index) => {
        formDataToSend.append(`image_${index}`, file);
      });

      // Add notice file if exists
      if (noticeFile) {
        formDataToSend.append('notice_file', noticeFile);
      } else if (existingNotice) {
        formDataToSend.append('existingNotice', existingNotice);
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update property");
      }

      router.push("/admin/properties");
    } catch (err: any) {
      setError(err.message || "Failed to update property");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="max-w-3xl mx-auto p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading property...</p>
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
        Edit Property
      </motion.h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-gray-200 rounded-2xl p-6">
        {/* Property ID - Read Only */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Property ID</label>
          <input
            type="text"
            value={formData.id}
            disabled
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="1200"
          />
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div>
            <label className="block text-sm text-gray-700 mb-1">Existing Images</label>
            <div className="grid grid-cols-3 gap-2">
              {existingImages.map((img, index) => (
                <div key={index} className="relative group">
                  <img src={img} alt={`Property ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Images */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Add New Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          {imageFiles.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {imageFiles.length} new image(s) selected
            </div>
          )}
        </div>

        {/* Notice Upload */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Notice Document</label>
          {existingNotice && !noticeFile && (
            <div className="mb-2 text-sm text-gray-600">
              Current: <a href={existingNotice} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Notice</a>
            </div>
          )}
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleNoticeChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          {noticeFile && (
            <div className="mt-2 text-sm text-gray-600">
              New file: {noticeFile.name}
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
              type="date"
              name="publicationDate"
              value={formData.publicationDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Auction Start Date */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Auction Start Date</label>
            <input
              type="date"
              name="auctionStartDate"
              value={formData.auctionStartDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Auction End Time */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Auction End Time</label>
            <input
              type="datetime-local"
              name="auctionEndTime"
              value={formData.auctionEndTime}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Application Submission Date */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Application Submission Date</label>
            <input
              type="date"
              name="applicationSubmissionDate"
              value={formData.applicationSubmissionDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
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
              <span className="text-sm text-gray-700">Featured Property</span>
            </label>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update Property"}
          </button>
          <button
            type="button"
            onClick={() => window.open(`/properties/${propertyId}`, '_blank')}
            className="px-6 py-2 bg-white border-2 border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition"
          >
            View Property
          </button>
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
