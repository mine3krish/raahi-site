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
    inspectionDate: "",
    agentMobile: "+91 848 884 8874",
    youtubeVideo: "",
    // All Excel import fields
    newListingId: "",
    schemeName: "",
    category: "",
    city: "",
    areaTown: "",
    date: "",
    emd: "",
    incrementBid: "",
    bankName: "",
    branchName: "",
    contactDetails: "",
    description: "",
    address: "",
    note: "",
    publishingDate: "",
    listingId: "",
    auctionType: "",
    notice: "",
    source: "",
    url: "",
    fingerprint: "",
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
          bestDeal: property.bestDeal || false,
          premium: property.premium || false,
          status: property.status,
          assetCategory: property.assetCategory || "",
          assetAddress: property.assetAddress || "",
          assetCity: property.assetCity || "",
          borrowerName: property.borrowerName || "",
          publicationDate: property.publicationDate || "",
          auctionStartDate: property.auctionStartDate || "",
          auctionEndTime: property.auctionEndTime || "",
          applicationSubmissionDate: property.applicationSubmissionDate || "",
          inspectionDate: property.inspectionDate || "",
          agentMobile: property.agentMobile || "+91 848 884 8874",
          youtubeVideo: property.youtubeVideo || "",
          // Excel import fields
          newListingId: property.newListingId || "",
          schemeName: property.schemeName || "",
          category: property.category || "",
          city: property.city || "",
          areaTown: property.areaTown || "",
          date: property.date || "",
          emd: property.emd?.toString() || "",
          incrementBid: property.incrementBid || "",
          bankName: property.bankName || "",
          branchName: property.branchName || "",
          contactDetails: property.contactDetails || "",
          description: property.description || "",
          address: property.address || "",
          note: property.note || "",
          publishingDate: property.publishingDate || "",
          listingId: property.listingId || "",
          auctionType: property.auctionType || "",
          notice: property.notice || "",
          source: property.source || "",
          url: property.url || "",
          fingerprint: property.fingerprint || "",
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
    const totalImages = existingImages.length + files.length;
    
    if (totalImages > 5) {
      alert(`You can only upload up to 5 images total. You have ${existingImages.length} existing images.`);
      return;
    }
    
    setImageFiles(files);
  };

  const handleNoticeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNoticeFile(file);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
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

        {/* Property Images Management */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">Property Images (Max 5 total)</label>
          <p className="text-xs text-gray-500 mb-3">
            Total: {existingImages.length + imageFiles.length} / 5 images. First image will be the main image.
          </p>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Current Images</p>
              <div className="grid grid-cols-5 gap-2">
                {existingImages.map((img, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                      <img src={img} alt={`Property ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
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
            </div>
          )}

          {/* Add New Images */}
          {(existingImages.length + imageFiles.length) < 5 && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Add More Images</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          )}

          {/* New Images Preview */}
          {imageFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">New Images to Upload</p>
              <div className="grid grid-cols-5 gap-2">
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-green-200 bg-gray-100">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
                    >
                      ×
                    </button>
                    <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">New</span>
                  </div>
                ))}
              </div>
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

          {/* Inspection Date */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Inspection Date</label>
            <input
              type="text"
              name="inspectionDate"
              value={formData.inspectionDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="DD-MM-YYYY or 'Not Available'"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty or enter 'Not Available' to show call button instead</p>
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

          {/* Excel Import Fields */}
          <div className="col-span-2 mt-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Excel Import Data</h3>
          </div>

          {/* New Listing ID */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">New Listing ID</label>
            <input
              type="text"
              name="newListingId"
              value={formData.newListingId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="New listing identifier"
            />
          </div>

          {/* Scheme Name */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Scheme Name</label>
            <input
              type="text"
              name="schemeName"
              value={formData.schemeName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Scheme name"
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Property category"
            />
          </div>

          {/* City */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="City name"
            />
          </div>

          {/* Area/Town */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Area/Town</label>
            <input
              type="text"
              name="areaTown"
              value={formData.areaTown}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Area or town"
            />
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Date</label>
            <input
              type="text"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Date from Excel"
            />
          </div>

          {/* EMD (lowercase) */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">emd (lowercase)</label>
            <input
              type="number"
              name="emd"
              value={formData.emd}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="EMD amount (Excel field)"
            />
          </div>

          {/* Increment Bid */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Increment Bid</label>
            <input
              type="text"
              name="incrementBid"
              value={formData.incrementBid}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Bid increment amount"
            />
          </div>

          {/* Bank Name */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Bank Name</label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Bank name"
            />
          </div>

          {/* Branch Name */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Branch Name</label>
            <input
              type="text"
              name="branchName"
              value={formData.branchName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Branch name"
            />
          </div>

          {/* Contact Details */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Contact Details</label>
            <textarea
              name="contactDetails"
              value={formData.contactDetails}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Contact information"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Property description"
            />
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Full address"
            />
          </div>

          {/* Note */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Note</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Additional notes"
            />
          </div>

          {/* Publishing Date */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Publishing Date</label>
            <input
              type="text"
              name="publishingDate"
              value={formData.publishingDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Publishing date"
            />
          </div>

          {/* Listing ID */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Listing ID</label>
            <input
              type="text"
              name="listingId"
              value={formData.listingId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Listing identifier"
            />
          </div>

          {/* Auction Type */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Auction Type</label>
            <input
              type="text"
              name="auctionType"
              value={formData.auctionType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Type of auction"
            />
          </div>

          {/* Notice */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Notice</label>
            <input
              type="text"
              name="notice"
              value={formData.notice}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Notice file URL"
            />
          </div>

          {/* Source */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Source</label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Data source"
            />
          </div>

          {/* URL */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">URL</label>
            <input
              type="text"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Source URL"
            />
          </div>

          {/* Fingerprint */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Fingerprint</label>
            <input
              type="text"
              name="fingerprint"
              value={formData.fingerprint}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Unique fingerprint"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Automatically generated for duplicate detection</p>
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
              <option value="Vehicle">Vehicle</option>
              <option value="Gold">Gold</option>
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
