"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";

export default function AddPremiumProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [brochureFile, setBrochureFile] = useState<File | null>(null);

  // New states for arrays
  const [variants, setVariants] = useState<any[]>([]);
  const [whyBuy, setWhyBuy] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);

  // Refs for textareas
  const featuresRef = useRef<HTMLTextAreaElement>(null);
  const whyBuyRef = useRef<HTMLTextAreaElement>(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    location: "",
    description: "",
    price: "",
    builder: "",
    status: "Active",
    featured: false,
    agentNumber: "",
    variants: [] as any[],
    whyBuy: [] as string[],
    features: [] as string[],
    ytVideoLink: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBrochureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBrochureFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const submitData = new FormData();

      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value.toString());
      });

      // Get current values from refs
      const featuresValue = featuresRef.current ? featuresRef.current.value : '';
      const featuresArray = featuresValue === '' ? [] : featuresValue.split('\n').map(line => line.trim()).filter(line => line);

      const whyBuyValue = whyBuyRef.current ? whyBuyRef.current.value : '';
      const whyBuyArray = whyBuyValue === '' ? [] : whyBuyValue.split('\n').map(line => line.trim()).filter(line => line);

      // Add arrays as JSON
      submitData.append("variants", JSON.stringify(variants));
      submitData.append("whyBuy", JSON.stringify(whyBuyArray));
      submitData.append("features", JSON.stringify(featuresArray));

      // Add images
      imageFiles.forEach((file, index) => {
        submitData.append(`image_${index}`, file);
      });

      // Add brochure
      if (brochureFile) {
        submitData.append("brochure", brochureFile);
      }

      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/premium-projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      if (response.ok) {
        router.push("/admin/premium-projects");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create premium project");
      }
    } catch (err) {
      setError("Failed to create premium project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Premium Project</h1>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project ID *
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="e.g., ₹1.5 Cr - ₹2.5 Cr"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Builder
              </label>
              <input
                type="text"
                name="builder"
                value={formData.builder}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="Sold Out">Sold Out</option>
                <option value="Upcoming">Upcoming</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Featured Project
            </label>
          </div>

          {/* Agent Number */}
          <div className="mb-4">
            <label htmlFor="agentNumber" className="block text-sm font-medium text-gray-700 mb-1">Agent Number</label>
            <input
              type="text"
              name="agentNumber"
              id="agentNumber"
              value={formData.agentNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter agent's contact number"
            />
          </div>

          {/* YouTube Video Link */}
          <div className="mb-4">
            <label htmlFor="ytVideoLink" className="block text-sm font-medium text-gray-700 mb-1">YouTube Video Link</label>
            <input
              type="url"
              name="ytVideoLink"
              id="ytVideoLink"
              value={formData.ytVideoLink}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          {/* Features */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
            <textarea
              ref={featuresRef}
              defaultValue={features.join('\n')}
              onBlur={() => {
                const value = featuresRef.current?.value || '';
                if (value === '') {
                  setFeatures([]);
                } else {
                  setFeatures(value.split('\n').map(line => line.trim()).filter(line => line));
                }
              }}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Swimming Pool
Gym
Parking
..."
            />
          </div>

          {/* Why Buy */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Why You Should Buy (one per line)</label>
            <textarea
              ref={whyBuyRef}
              defaultValue={whyBuy.join('\n')}
              onBlur={() => {
                const value = whyBuyRef.current?.value || '';
                if (value === '') {
                  setWhyBuy([]);
                } else {
                  setWhyBuy(value.split('\n').map(line => line.trim()).filter(line => line));
                }
              }}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Prime location
Modern amenities
Investment potential
..."
            />
          </div>

          {/* Variants */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Variable Products (Variants)</label>
            {variants.map((variant, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Type (e.g., 2 BHK)"
                    value={variant.type || ''}
                    onChange={(e) => {
                      const newVariants = [...variants];
                      newVariants[index].type = e.target.value;
                      setVariants(newVariants);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Property Type (e.g., Apartment)"
                    value={variant.propertyType || ''}
                    onChange={(e) => {
                      const newVariants = [...variants];
                      newVariants[index].propertyType = e.target.value;
                      setVariants(newVariants);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Area (e.g., 1200 sq.ft.)"
                    value={variant.area || ''}
                    onChange={(e) => {
                      const newVariants = [...variants];
                      newVariants[index].area = e.target.value;
                      setVariants(newVariants);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Price (e.g., ₹ 50 Lac)"
                    value={variant.price || ''}
                    onChange={(e) => {
                      const newVariants = [...variants];
                      newVariants[index].price = e.target.value;
                      setVariants(newVariants);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setVariants(variants.filter((_, i) => i !== index))}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove Variant
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setVariants([...variants, { type: '', propertyType: '', area: '', price: '' }])}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Add Variant
            </button>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Images
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="image-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                  >
                    <span>Upload images</span>
                    <input
                      id="image-upload"
                      name="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>

            {/* Image Preview */}
            {imageFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="h-24 w-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Brochure Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brochure (PDF)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="brochure-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                  >
                    <span>Upload brochure</span>
                    <input
                      id="brochure-upload"
                      name="brochure"
                      type="file"
                      accept=".pdf"
                      onChange={handleBrochureUpload}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF up to 10MB</p>
              </div>
            </div>

            {brochureFile && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {brochureFile.name}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}