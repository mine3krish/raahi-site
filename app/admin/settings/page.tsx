"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Save, Plus, Trash2, Upload, X, Settings as SettingsIcon,
  Mail, Phone, MapPin, Clock, Users, Award, Globe, DollarSign
} from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import { useRouter } from "next/navigation";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  email: string;
  phone: string;
  bio: string;
  order: number;
}

interface Partner {
  name: string;
  logo: string;
  order: number;
}

interface Banner {
  image: string;
  link: string;
  alt: string;
  order: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("contact");

  const [settings, setSettings] = useState({
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    officeHours: "",
    aboutTitle: "",
    aboutDescription: "",
    missionStatement: "",
    visionStatement: "",
    facebookUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
    adsenseClientId: "",
    adsenseSlotHeader: "",
    adsenseSlotSidebar: "",
    adsenseSlotFooter: "",
    adsenseEnabled: false,
    whatsappNumber: "",
    footerText: "",
    siteTitle: "",
    siteDescription: "",
    siteKeywords: "",
    heroImage: "",
    heroTitle: "",
    heroSubtitle: "",
    propertyPlaceholderImage: "",
    teamMembers: [] as TeamMember[],
    partners: [] as Partner[],
    propertyBanners: [] as Banner[],
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/settings", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch settings");

      const data = await response.json();
      setSettings(data.settings || {});
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Add all settings fields
      Object.entries(settings).forEach(([key, value]) => {
        if (key === "teamMembers" || key === "partners" || key === "propertyBanners") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to save settings");

      setMessage("Settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const addTeamMember = () => {
    setSettings({
      ...settings,
      teamMembers: [
        ...settings.teamMembers,
        { name: "", role: "", image: "", email: "", phone: "", bio: "", order: settings.teamMembers.length },
      ],
    });
  };

  const removeTeamMember = (index: number) => {
    setSettings({
      ...settings,
      teamMembers: settings.teamMembers.filter((_, i) => i !== index),
    });
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string | number) => {
    const updated = [...settings.teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setSettings({ ...settings, teamMembers: updated });
  };

  const addPartner = () => {
    setSettings({
      ...settings,
      partners: [
        ...settings.partners,
        { name: "", logo: "", order: settings.partners.length },
      ],
    });
  };

  const removePartner = (index: number) => {
    setSettings({
      ...settings,
      partners: settings.partners.filter((_, i) => i !== index),
    });
  };

  const updatePartner = (index: number, field: keyof Partner, value: string | number) => {
    const updated = [...settings.partners];
    updated[index] = { ...updated[index], [field]: value };
    setSettings({ ...settings, partners: updated });
  };

  const addBanner = () => {
    setSettings({
      ...settings,
      propertyBanners: [
        ...settings.propertyBanners,
        { image: "", link: "", alt: "Banner", order: settings.propertyBanners.length },
      ],
    });
  };

  const removeBanner = (index: number) => {
    setSettings({
      ...settings,
      propertyBanners: settings.propertyBanners.filter((_, i) => i !== index),
    });
  };

  const updateBanner = (index: number, field: keyof Banner, value: string | number) => {
    const updated = [...settings.propertyBanners];
    updated[index] = { ...updated[index], [field]: value };
    setSettings({ ...settings, propertyBanners: updated });
  };

  const tabs = [
    { id: "hero", label: "Hero Section", icon: Upload },
    { id: "contact", label: "Contact Info", icon: Mail },
    { id: "about", label: "About Us", icon: Users },
    { id: "team", label: "Team Members", icon: Users },
    { id: "partners", label: "Partners", icon: Award },
    { id: "banners", label: "Property Banners", icon: Upload },
    { id: "social", label: "Social Media", icon: Globe },
    { id: "adsense", label: "AdSense", icon: DollarSign },
    { id: "seo", label: "SEO", icon: SettingsIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Site Settings</h1>
              <p className="text-gray-600 mt-1">Customize your website content and appearance</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Success Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
            >
              {message}
            </motion.div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="flex overflow-x-auto border-b">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Hero Section Tab */}
            {activeTab === "hero" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Hero Section Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Background Image URL
                  </label>
                  <input
                    type="text"
                    value={settings.heroImage}
                    onChange={(e) => setSettings({ ...settings, heroImage: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="/Ahemdabad_Skyline.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter a full image URL or path (e.g., /image.jpg or https://...)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Title
                  </label>
                  <input
                    type="text"
                    value={settings.heroTitle}
                    onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Find Bank Verified Properties"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Subtitle
                  </label>
                  <textarea
                    value={settings.heroSubtitle}
                    onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-20"
                    placeholder="Discover verified listings and live property auctions across India."
                  />
                </div>

                {settings.heroImage && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <div 
                      className="w-full h-64 bg-cover bg-center rounded-lg relative"
                      style={{ backgroundImage: `url('${settings.heroImage}')` }}
                    >
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                        <div className="text-center text-white px-4">
                          <h3 className="text-2xl font-bold mb-2">{settings.heroTitle || "Hero Title"}</h3>
                          <p className="text-sm">{settings.heroSubtitle || "Hero subtitle"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Property Placeholder Image</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Property Image URL
                    </label>
                    <input
                      type="text"
                      value={settings.propertyPlaceholderImage}
                      onChange={(e) => setSettings({ ...settings, propertyPlaceholderImage: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="/image.png"
                    />
                    <p className="text-xs text-gray-500 mt-1">This image is used when a property has no images uploaded</p>
                  </div>

                  {settings.propertyPlaceholderImage && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                      <img
                        src={settings.propertyPlaceholderImage}
                        alt="Placeholder preview"
                        className="w-48 h-48 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Info Tab */}
            {activeTab === "contact" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail size={16} className="inline mr-2" />
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="contact@raahiauction.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} className="inline mr-2" />
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="+91 848 884 8874"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} className="inline mr-2" />
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={settings.whatsappNumber}
                      onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="+918488848874"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock size={16} className="inline mr-2" />
                      Office Hours
                    </label>
                    <input
                      type="text"
                      value={settings.officeHours}
                      onChange={(e) => setSettings({ ...settings, officeHours: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Mon - Sat: 9:00 AM - 6:00 PM"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-2" />
                    Office Address
                  </label>
                  <textarea
                    value={settings.contactAddress}
                    onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-24"
                    placeholder="Enter your office address..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Footer Text
                  </label>
                  <input
                    type="text"
                    value={settings.footerText}
                    onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="© 2024 Raahi Auction. All rights reserved."
                  />
                </div>
              </div>
            )}

            {/* About Us Tab */}
            {activeTab === "about" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">About Us Content</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About Title
                  </label>
                  <input
                    type="text"
                    value={settings.aboutTitle}
                    onChange={(e) => setSettings({ ...settings, aboutTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="About Raahi Auction"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About Description
                  </label>
                  <textarea
                    value={settings.aboutDescription}
                    onChange={(e) => setSettings({ ...settings, aboutDescription: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-32"
                    placeholder="Tell your story..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mission Statement
                  </label>
                  <textarea
                    value={settings.missionStatement}
                    onChange={(e) => setSettings({ ...settings, missionStatement: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-24"
                    placeholder="Our mission..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vision Statement
                  </label>
                  <textarea
                    value={settings.visionStatement}
                    onChange={(e) => setSettings({ ...settings, visionStatement: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-24"
                    placeholder="Our vision..."
                  />
                </div>
              </div>
            )}

            {/* Team Members Tab */}
            {activeTab === "team" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Team Members</h2>
                    <p className="text-sm text-gray-600">Manage your company team members</p>
                  </div>
                  <button
                    onClick={addTeamMember}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Plus size={18} />
                    Add Member
                  </button>
                </div>

                {settings.teamMembers.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No team members added yet. Click &quot;Add Member&quot; to get started.
                  </div>
                )}

                {settings.teamMembers.map((member, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">Team Member #{index + 1}</h3>
                      <button
                        onClick={() => removeTeamMember(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => updateTeamMember(index, "role", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="CEO"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={member.email}
                          onChange={(e) => updateTeamMember(index, "email", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="john@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="text"
                          value={member.phone}
                          onChange={(e) => updateTeamMember(index, "phone", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="+91 99999 99999"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                        <input
                          type="text"
                          value={member.image}
                          onChange={(e) => updateTeamMember(index, "image", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                        <input
                          type="number"
                          value={member.order}
                          onChange={(e) => updateTeamMember(index, "order", parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        value={member.bio}
                        onChange={(e) => updateTeamMember(index, "bio", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-20"
                        placeholder="Short bio..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Partners Tab */}
            {activeTab === "partners" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Partners</h2>
                    <p className="text-sm text-gray-600">Manage partner logos for homepage scroller</p>
                  </div>
                  <button
                    onClick={addPartner}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Plus size={18} />
                    Add Partner
                  </button>
                </div>

                {settings.partners.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No partners added yet. Click &quot;Add Partner&quot; to get started.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settings.partners.map((partner, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">Partner #{index + 1}</h3>
                        <button
                          onClick={() => removePartner(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Partner Name</label>
                        <input
                          type="text"
                          value={partner.name}
                          onChange={(e) => updatePartner(index, "name", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Company Name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                        <input
                          type="text"
                          value={partner.logo}
                          onChange={(e) => updatePartner(index, "logo", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                        <input
                          type="number"
                          value={partner.order}
                          onChange={(e) => updatePartner(index, "order", parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      {partner.logo && (
                        <div className="mt-2">
                          <img
                            src={partner.logo}
                            alt={partner.name}
                            className="h-16 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Property Banners Tab */}
            {activeTab === "banners" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Property Page Banners</h2>
                    <p className="text-sm text-gray-600">Square banners displayed on property detail pages (max 2 recommended)</p>
                  </div>
                  <button
                    onClick={addBanner}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Plus size={18} />
                    Add Banner
                  </button>
                </div>

                {settings.propertyBanners.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No banners added yet. Click &quot;Add Banner&quot; to get started.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settings.propertyBanners.map((banner, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">Banner #{index + 1}</h3>
                        <button
                          onClick={() => removeBanner(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image URL</label>
                        <input
                          type="text"
                          value={banner.image}
                          onChange={(e) => updateBanner(index, "image", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="https://... (square image recommended)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link URL (optional)</label>
                        <input
                          type="text"
                          value={banner.link}
                          onChange={(e) => updateBanner(index, "link", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="https://... or leave empty"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                        <input
                          type="text"
                          value={banner.alt}
                          onChange={(e) => updateBanner(index, "alt", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Banner description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                        <input
                          type="number"
                          value={banner.order}
                          onChange={(e) => updateBanner(index, "order", parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      {banner.image && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 mb-2">Preview:</p>
                          <img
                            src={banner.image}
                            alt={banner.alt}
                            className="w-full h-48 object-cover rounded border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Media Tab */}
            {activeTab === "social" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Social Media Links</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      value={settings.facebookUrl}
                      onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter URL
                    </label>
                    <input
                      type="url"
                      value={settings.twitterUrl}
                      onChange={(e) => setSettings({ ...settings, twitterUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://twitter.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      value={settings.instagramUrl}
                      onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://instagram.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={settings.linkedinUrl}
                      onChange={(e) => setSettings({ ...settings, linkedinUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://linkedin.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube URL
                    </label>
                    <input
                      type="url"
                      value={settings.youtubeUrl}
                      onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* AdSense Tab */}
            {activeTab === "adsense" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Google AdSense Settings</h2>
                
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="adsenseEnabled"
                    checked={settings.adsenseEnabled}
                    onChange={(e) => setSettings({ ...settings, adsenseEnabled: e.target.checked })}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <label htmlFor="adsenseEnabled" className="text-sm font-medium text-gray-700">
                    Enable Google AdSense on website
                  </label>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AdSense Client ID
                    </label>
                    <input
                      type="text"
                      value={settings.adsenseClientId}
                      onChange={(e) => setSettings({ ...settings, adsenseClientId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Header Ad Slot ID
                    </label>
                    <input
                      type="text"
                      value={settings.adsenseSlotHeader}
                      onChange={(e) => setSettings({ ...settings, adsenseSlotHeader: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="XXXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sidebar Ad Slot ID
                    </label>
                    <input
                      type="text"
                      value={settings.adsenseSlotSidebar}
                      onChange={(e) => setSettings({ ...settings, adsenseSlotSidebar: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="XXXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Footer Ad Slot ID
                    </label>
                    <input
                      type="text"
                      value={settings.adsenseSlotFooter}
                      onChange={(e) => setSettings({ ...settings, adsenseSlotFooter: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="XXXXXXXXXX"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === "seo" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">SEO Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Title
                  </label>
                  <input
                    type="text"
                    value={settings.siteTitle}
                    onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Raahi Auction"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-24"
                    placeholder="Find bank verified properties across India..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords (comma separated)
                  </label>
                  <textarea
                    value={settings.siteKeywords}
                    onChange={(e) => setSettings({ ...settings, siteKeywords: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-20"
                    placeholder="auction, property, real estate, bank auction"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
