"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Save, Plus, Trash2, Upload, X, Settings as SettingsIcon,
  Mail, Phone, MapPin, Clock, Users, Award, Globe, DollarSign, Share2
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

interface Testimonial {
  name: string;
  location: string;
  image: string;
  rating: number;
  message: string;
  order: number;
}

interface SocialAccount {
  _id?: string;
  platform: string;
  name: string;
  enabled: boolean;
  config: any;
}

interface PostTemplate {
  _id?: string;
  platform: string;
  name: string;
  template: string;
  includeImage: boolean;
  includeLink: boolean;
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
    testimonials: [] as Testimonial[],
  });

  // Social Sharing State
  const [socialSharingTab, setSocialSharingTab] = useState<"accounts" | "templates">("accounts");
  const [socialConfig, setSocialConfig] = useState<any>({ accounts: [], templates: [] });
  const [loadingSocialConfig, setLoadingSocialConfig] = useState(false);
  const [savingSocialConfig, setSavingSocialConfig] = useState(false);
  
  // Account form
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SocialAccount | null>(null);
  const [accountForm, setAccountForm] = useState<SocialAccount>({
    platform: "whatsapp",
    name: "",
    enabled: true,
    config: {},
  });

  // WhatsApp group loading
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  
  // WAHA session management
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [sessionStatus, setSessionStatus] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [qrInterval, setQrInterval] = useState<NodeJS.Timeout | null>(null);

  // Template form
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PostTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState<PostTemplate>({
    platform: "whatsapp",
    name: "",
    template: "",
    includeImage: true,
    includeLink: true,
  });

  useEffect(() => {
    fetchSettings();
    fetchSocialConfig();
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

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to upload image");

    const data = await response.json();
    return data.url;
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImage(file);
      callback(url);
      setMessage("Image uploaded successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error uploading image");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Social Sharing Functions
  const fetchSocialConfig = async () => {
    try {
      setLoadingSocialConfig(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/social-config", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch configuration");

      const data = await response.json();
      console.log("Fetched social config:", data.config);
      setSocialConfig(data.config || { accounts: [], templates: [] });
    } catch (err: any) {
      console.error("Fetch social config error:", err);
      alert(err.message);
    } finally {
      setLoadingSocialConfig(false);
    }
  };

  const saveSocialConfig = async () => {
    setSavingSocialConfig(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/social-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(socialConfig),
      });

      if (!response.ok) throw new Error("Failed to save configuration");

      alert("Social configuration saved successfully!");
      fetchSocialConfig();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingSocialConfig(false);
    }
  };

  const openAccountForm = (account?: SocialAccount) => {
    if (account) {
      setEditingAccount(account);
      setAccountForm({ ...account });
    } else {
      setEditingAccount(null);
      setAccountForm({
        platform: "whatsapp",
        name: "",
        enabled: true,
        config: {},
      });
    }
    setShowAccountForm(true);
    setAvailableGroups([]);
  };

  const saveAccount = async () => {
    const accounts = socialConfig.accounts || [];
    
    if (editingAccount) {
      const index = accounts.findIndex((a: any) => 
        a.platform === editingAccount.platform && a.name === editingAccount.name
      );
      if (index >= 0) {
        accounts[index] = { ...accountForm };
      } else {
        accounts.push({ ...accountForm });
      }
    } else {
      accounts.push({ ...accountForm });
    }

    const updatedConfig = { ...socialConfig, accounts };
    console.log("Saving social config:", updatedConfig);
    
    // Save to database FIRST, then update UI
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/social-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedConfig),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error("Save error response:", error);
        throw new Error(error.error || "Failed to save");
      }
      
      const result = await response.json();
      console.log("Save result:", result);
      
      // Update state and close modal AFTER successful save
      setSocialConfig(updatedConfig);
      setShowAccountForm(false);
      alert("Account saved successfully!");
    } catch (err: any) {
      console.error("Save account error:", err);
      alert("Failed to save: " + err.message);
    }
  };

  const deleteAccount = async (index: number) => {
    if (!confirm("Delete this account?")) return;
    
    const accounts = socialConfig.accounts.filter((_: any, i: number) => i !== index);
    const updatedConfig = { ...socialConfig, accounts };
    setSocialConfig(updatedConfig);
    
    // Save to database
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/admin/social-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedConfig),
      });
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    }
  };

  const fetchWahaGroups = async () => {
    setLoadingGroups(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/waha/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          wahaBaseUrl: accountForm.config.wahaBaseUrl,
          wahaApiKey: accountForm.config.wahaApiKey,
          sessionName: accountForm.config.sessionName,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch groups");

      const data = await response.json();
      setAvailableGroups(data.groups);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingGroups(false);
    }
  };

  const toggleGroup = (groupId: string) => {
    const groups = accountForm.config.groups || [];
    const existingIndex = groups.findIndex((g: any) => g.id === groupId);
    
    if (existingIndex >= 0) {
      groups[existingIndex].enabled = !groups[existingIndex].enabled;
    } else {
      const group = availableGroups.find(g => g.id === groupId);
      groups.push({ ...group, enabled: true });
    }
    
    setAccountForm({
      ...accountForm,
      config: { ...accountForm.config, groups },
    });
  };

  const checkSessionStatus = async (wahaBaseUrl: string, wahaApiKey: string, sessionName: string) => {
    try {
      setCheckingStatus(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        wahaBaseUrl,
        sessionName,
      });
      if (wahaApiKey) params.set("wahaApiKey", wahaApiKey);

      const response = await fetch(`/api/admin/waha/status?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to check status");

      const data = await response.json();
      setSessionStatus(data);
      return data;
    } catch (err) {
      console.error("Status check error:", err);
      return null;
    } finally {
      setCheckingStatus(false);
    }
  };

  const startSession = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/waha/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          wahaBaseUrl: accountForm.config.wahaBaseUrl,
          wahaApiKey: accountForm.config.wahaApiKey,
          sessionName: accountForm.config.sessionName,
        }),
      });

      const data = await response.json();

      // If session already exists (422), just show QR scanner
      if (response.status === 422 || !response.ok && data.statusCode === 422) {
        showQRScanner();
        return;
      }

      if (!response.ok) throw new Error(data.error || "Failed to start session");

      alert("Session started successfully! Now scan the QR code.");
      showQRScanner();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const showQRScanner = async () => {
    setShowQRModal(true);
    setQrCode("");
    await fetchQRCode();
    
    const interval = setInterval(() => {
      fetchQRCode();
    }, 5000);
    
    setQrInterval(interval);
  };

  const fetchQRCode = async () => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        wahaBaseUrl: accountForm.config.wahaBaseUrl,
        sessionName: accountForm.config.sessionName,
      });
      if (accountForm.config.wahaApiKey) {
        params.set("wahaApiKey", accountForm.config.wahaApiKey);
      }

      const response = await fetch(`/api/admin/waha/qr?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const status = await checkSessionStatus(
          accountForm.config.wahaBaseUrl,
          accountForm.config.wahaApiKey,
          accountForm.config.sessionName
        );
        
        if (status?.status === "WORKING") {
          if (qrInterval) clearInterval(qrInterval);
          setShowQRModal(false);
          alert("Successfully authenticated with WhatsApp!");
        }
        return;
      }

      const data = await response.json();
      if (data.qr) {
        setQrCode(data.qr);
      }
    } catch (err) {
      console.error("QR fetch error:", err);
    }
  };

  const closeQRModal = () => {
    if (qrInterval) clearInterval(qrInterval);
    setShowQRModal(false);
    setQrCode("");
  };

  const logoutSession = async () => {
    if (!confirm("Are you sure you want to logout from WhatsApp?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/waha/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          wahaBaseUrl: accountForm.config.wahaBaseUrl,
          wahaApiKey: accountForm.config.wahaApiKey,
          sessionName: accountForm.config.sessionName,
        }),
      });

      if (!response.ok) throw new Error("Failed to logout");

      alert("Logged out successfully!");
      setSessionStatus(null);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const stopSession = async () => {
    if (!confirm("Are you sure you want to stop this session?")) return;

    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        wahaBaseUrl: accountForm.config.wahaBaseUrl,
        sessionName: accountForm.config.sessionName,
      });
      if (accountForm.config.wahaApiKey) {
        params.set("wahaApiKey", accountForm.config.wahaApiKey);
      }

      const response = await fetch(`/api/admin/waha/sessions?${params.toString()}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to stop session");

      alert("Session stopped successfully!");
      setSessionStatus(null);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const deleteSession = async () => {
    if (!confirm("Are you sure you want to delete this session? You will need to scan QR code again to reconnect.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        wahaBaseUrl: accountForm.config.wahaBaseUrl,
        sessionName: accountForm.config.sessionName,
      });

      const response = await fetch(`/api/admin/waha/delete-session?${params.toString()}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete session");

      alert("Session deleted successfully! You can now create a new session.");
      setSessionStatus(null);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const openTemplateForm = (template?: PostTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({ ...template });
    } else {
      setEditingTemplate(null);
      setTemplateForm({
        platform: "whatsapp",
        name: "",
        template: socialConfig?.defaultTemplate || "",
        includeImage: true,
        includeLink: true,
      });
    }
    setShowTemplateForm(true);
  };

  const saveTemplate = async () => {
    const templates = socialConfig.templates || [];
    
    if (editingTemplate) {
      const index = templates.findIndex((t: any) => 
        t.platform === editingTemplate.platform && t.name === editingTemplate.name
      );
      if (index >= 0) {
        templates[index] = { ...templateForm };
      } else {
        templates.push({ ...templateForm });
      }
    } else {
      templates.push({ ...templateForm });
    }

    const updatedConfig = { ...socialConfig, templates };
    setSocialConfig(updatedConfig);
    setShowTemplateForm(false);
    
    // Save to database
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/admin/social-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedConfig),
      });
    } catch (err: any) {
      alert("Failed to save template: " + err.message);
    }
  };

  const deleteTemplate = async (index: number) => {
    if (!confirm("Delete this template?")) return;
    
    const templates = socialConfig.templates.filter((_: any, i: number) => i !== index);
    const updatedConfig = { ...socialConfig, templates };
    setSocialConfig(updatedConfig);
    
    // Save to database
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/admin/social-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedConfig),
      });
    } catch (err: any) {
      alert("Failed to delete template: " + err.message);
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
        if (key === "teamMembers" || key === "partners" || key === "propertyBanners" || key === "testimonials") {
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

  const addTestimonial = () => {
    setSettings({
      ...settings,
      testimonials: [
        ...settings.testimonials,
        { name: "", location: "", image: "", rating: 5, message: "", order: settings.testimonials.length },
      ],
    });
  };

  const removeTestimonial = (index: number) => {
    setSettings({
      ...settings,
      testimonials: settings.testimonials.filter((_, i) => i !== index),
    });
  };

  const updateTestimonial = (index: number, field: keyof Testimonial, value: string | number) => {
    const updated = [...settings.testimonials];
    updated[index] = { ...updated[index], [field]: value };
    setSettings({ ...settings, testimonials: updated });
  };

  const tabs = [
    { id: "hero", label: "Hero Section", icon: Upload },
    { id: "contact", label: "Contact Info", icon: Mail },
    { id: "about", label: "About Us", icon: Users },
    { id: "team", label: "Team Members", icon: Users },
    { id: "partners", label: "Partners", icon: Award },
    { id: "banners", label: "Property Banners", icon: Upload },
    { id: "testimonials", label: "Testimonials", icon: Users },
    { id: "socialLinks", label: "Social Links", icon: Globe },
    { id: "socialSharing", label: "Social Sharing", icon: Share2 },
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
                    Hero Background Image
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.heroImage}
                      onChange={(e) => setSettings({ ...settings, heroImage: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="/Ahemdabad_Skyline.jpg"
                    />
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (url) => setSettings({ ...settings, heroImage: url }))}
                      />
                      <div className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                        <Upload size={18} />
                        Upload
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Upload an image or enter URL</p>
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
                      Default Property Placeholder Image
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settings.propertyPlaceholderImage}
                        onChange={(e) => setSettings({ ...settings, propertyPlaceholderImage: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="/image.png"
                      />
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, (url) => setSettings({ ...settings, propertyPlaceholderImage: url }))}
                        />
                        <div className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                          <Upload size={18} />
                          Upload
                        </div>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Upload an image or enter URL - used when a property has no images</p>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={member.image}
                            onChange={(e) => updateTeamMember(index, "image", e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="URL or upload"
                          />
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, (url) => updateTeamMember(index, "image", url))}
                            />
                            <div className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                              <Upload size={16} />
                            </div>
                          </label>
                        </div>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={partner.logo}
                            onChange={(e) => updatePartner(index, "logo", e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="URL or upload"
                          />
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, (url) => updatePartner(index, "logo", url))}
                            />
                            <div className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                              <Upload size={16} />
                            </div>
                          </label>
                        </div>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={banner.image}
                            onChange={(e) => updateBanner(index, "image", e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="URL or upload (square recommended)"
                          />
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(e, (url) => updateBanner(index, "image", url))}
                            />
                            <div className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                              <Upload size={16} />
                            </div>
                          </label>
                        </div>
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
            {activeTab === "socialLinks" && (
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

            {/* Testimonials Tab */}
            {activeTab === "testimonials" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">Happy Customers</h2>
                  <button
                    onClick={addTestimonial}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Plus size={18} />
                    Add Testimonial
                  </button>
                </div>

                {settings.testimonials.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No testimonials added yet. Click &quot;Add Testimonial&quot; to get started.
                  </div>
                )}

                <div className="space-y-4">
                  {settings.testimonials.map((testimonial, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">Testimonial #{index + 1}</h3>
                        <button
                          onClick={() => removeTestimonial(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                          <input
                            type="text"
                            value={testimonial.name}
                            onChange={(e) => updateTestimonial(index, "name", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="John Doe"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <input
                            type="text"
                            value={testimonial.location}
                            onChange={(e) => updateTestimonial(index, "location", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Mumbai, India"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={testimonial.image}
                              onChange={(e) => updateTestimonial(index, "image", e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="URL or upload"
                            />
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, (url) => updateTestimonial(index, "image", url))}
                              />
                              <div className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                <Upload size={16} />
                              </div>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                          <select
                            value={testimonial.rating}
                            onChange={(e) => updateTestimonial(index, "rating", parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value={5}>5 Stars</option>
                            <option value={4}>4 Stars</option>
                            <option value={3}>3 Stars</option>
                            <option value={2}>2 Stars</option>
                            <option value={1}>1 Star</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                          <input
                            type="number"
                            value={testimonial.order}
                            onChange={(e) => updateTestimonial(index, "order", parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Testimonial Message</label>
                        <textarea
                          value={testimonial.message}
                          onChange={(e) => updateTestimonial(index, "message", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-24"
                          placeholder="Share your experience..."
                        />
                      </div>

                      {testimonial.image && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-2">Preview:</p>
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Sharing Tab */}
            {activeTab === "socialSharing" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Social Media Sharing Configuration</h2>
                    <p className="text-gray-600 mt-1">Configure social media accounts and post templates for property sharing</p>
                  </div>
                  <button
                    onClick={saveSocialConfig}
                    disabled={savingSocialConfig}
                    className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {savingSocialConfig ? "Saving..." : "💾 Save Social Config"}
                  </button>
                </div>

                {loadingSocialConfig ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600"></div>
                  </div>
                ) : (
                  <>
                    {/* Quick Setup Guide for First Time */}
                    {(!socialConfig?.accounts || socialConfig.accounts.length === 0) && (
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">🚀 Quick Setup Guide</h3>
                        
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-2">Step 1: Install WAHA (For WhatsApp)</h4>
                            <div className="bg-gray-900 rounded p-3 mb-2">
                              <code className="text-green-400 text-sm font-mono">
                                docker run -d -p 3000:3000 --name waha devlikeapro/waha
                              </code>
                            </div>
                            <p className="text-sm text-gray-600">
                              Or with API key security:
                            </p>
                            <div className="bg-gray-900 rounded p-3 mt-2">
                              <code className="text-green-400 text-sm font-mono">
                                docker run -d -p 3000:3000 -e WHATSAPP_API_KEY=your_secret_key --name waha devlikeapro/waha
                              </code>
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-2">Step 2: Add Social Accounts</h4>
                            <p className="text-sm text-gray-600">
                              Click &quot;Add Account&quot; below → Select platform → Configure credentials → Start sharing!
                            </p>
                            <ul className="text-sm text-gray-600 mt-2 ml-4 list-disc space-y-1">
                              <li><strong>WhatsApp:</strong> WAHA server + QR code authentication</li>
                              <li><strong>Facebook:</strong> Page Access Token + Page ID</li>
                              <li><strong>LinkedIn:</strong> Access Token (Personal/Organization)</li>
                              <li><strong>Instagram:</strong> Access Token + Instagram Business Account ID</li>
                            </ul>
                          </div>

                          <div className="mt-4 flex gap-3">
                            <a
                              href="/SOCIAL_SHARING_GUIDE.md"
                              target="_blank"
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              📖 WAHA Setup Guide →
                            </a>
                            <a
                              href="/SOCIAL_MEDIA_API_SETUP.md"
                              target="_blank"
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              🔑 API Setup Guide →
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sub-tabs for Accounts and Templates */}
                    <div className="flex gap-4 mb-6 border-b border-gray-200">
                      <button
                        onClick={() => setSocialSharingTab("accounts")}
                        className={`pb-3 px-4 font-medium transition ${
                          socialSharingTab === "accounts"
                            ? "border-b-2 border-green-600 text-green-600"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        Social Accounts ({socialConfig?.accounts?.length || 0})
                      </button>
                      <button
                        onClick={() => setSocialSharingTab("templates")}
                        className={`pb-3 px-4 font-medium transition ${
                          socialSharingTab === "templates"
                            ? "border-b-2 border-green-600 text-green-600"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        Post Templates ({socialConfig?.templates?.length || 0})
                      </button>
                    </div>

                    {/* Accounts Sub-tab */}
                    {socialSharingTab === "accounts" && (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-gray-600">Manage your social media accounts (WhatsApp, Facebook, LinkedIn, Instagram)</p>
                          <button
                            onClick={() => openAccountForm()}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                          >
                            + Add Account
                          </button>
                        </div>

                        <div className="grid gap-4">
                          {socialConfig?.accounts?.map((account: SocialAccount, index: number) => (
                            <motion.div
                              key={account._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="bg-gray-50 border border-gray-200 rounded-xl p-6"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-800">{account.name}</h3>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                                      {account.platform}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                      account.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                                    }`}>
                                      {account.enabled ? "✓ Enabled" : "✗ Disabled"}
                                    </span>
                                  </div>
                                  
                                  {account.platform === "whatsapp" && (
                                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                                      <p>Session: <span className="font-mono bg-gray-200 px-2 py-0.5 rounded">{account.config.sessionName}</span></p>
                                      <p>Groups: {account.config.groups?.filter((g: any) => g.enabled).length || 0} enabled</p>
                                    </div>
                                  )}
                                  
                                  {account.platform === "facebook" && (
                                    <div className="text-sm text-gray-600 mt-2">
                                      <p>Page ID: {account.config.pageId ? "✓ Configured" : "✗ Not set"}</p>
                                    </div>
                                  )}
                                  
                                  {account.platform === "linkedin" && (
                                    <div className="text-sm text-gray-600 mt-2">
                                      <p>Type: {account.config.isOrganization ? "Organization" : "Personal"}</p>
                                    </div>
                                  )}
                                  
                                  {account.platform === "instagram" && (
                                    <div className="text-sm text-gray-600 mt-2">
                                      <p>Business Account ID: {account.config.instagramBusinessAccountId ? "✓ Configured" : "✗ Not set"}</p>
                                      <p>Page Access Token: {account.config.pageAccessToken ? "✓ Configured" : "✗ Not set"}</p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => openAccountForm(account)}
                                    className="text-green-600 hover:text-green-800 font-medium px-3 py-1"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteAccount(index)}
                                    className="text-red-600 hover:text-red-800 font-medium px-3 py-1"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}

                          {(!socialConfig?.accounts || socialConfig.accounts.length === 0) && (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                              <p className="text-gray-600 mb-3">No accounts configured yet.</p>
                              <p className="text-sm text-gray-500">Click &quot;Add Account&quot; to connect your first social media platform.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Templates Sub-tab */}
                    {socialSharingTab === "templates" && (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-gray-600">Create custom post templates with dynamic variables</p>
                          <button
                            onClick={() => openTemplateForm()}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                          >
                            + Add Template
                          </button>
                        </div>

                        {/* Default Template */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                          <h3 className="font-semibold text-blue-900 mb-3">📝 Default Template</h3>
                          <p className="text-sm text-blue-700 mb-3">Used when no custom template is selected for a platform</p>
                          <textarea
                            value={socialConfig?.defaultTemplate || ""}
                            onChange={(e) => setSocialConfig({ ...socialConfig, defaultTemplate: e.target.value })}
                            className="w-full border border-blue-300 rounded-lg p-3 text-sm font-mono"
                            rows={8}
                            placeholder="🏠 New Property Alert!\n\n📍 {{location}}, {{state}}\n💰 Reserve Price: ₹{{reservePrice}}\n📅 Auction Date: {{auctionDate}}\n📏 Area: {{area}}\n🏷️ Type: {{type}}\n\n🔗 {{link}}"
                          />
                          <p className="text-xs text-blue-600 mt-2">
                            <strong>Available Variables:</strong> {"{{name}}"}, {"{{location}}"}, {"{{state}}"}, {"{{reservePrice}}"}, {"{{auctionDate}}"}, {"{{area}}"}, {"{{type}}"}, {"{{link}}"}
                          </p>
                        </div>

                        <div className="grid gap-4">
                          {socialConfig?.templates?.map((template: PostTemplate, index: number) => (
                            <motion.div
                              key={template._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="bg-gray-50 border border-gray-200 rounded-xl p-6"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-800">{template.name}</h3>
                                  <div className="flex gap-2 mt-2">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                                      {template.platform}
                                    </span>
                                    {template.includeImage && (
                                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                        🖼️ Image
                                      </span>
                                    )}
                                    {template.includeLink && (
                                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                        🔗 Link
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => openTemplateForm(template)}
                                    className="text-green-600 hover:text-green-800 font-medium px-3 py-1"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteTemplate(index)}
                                    className="text-red-600 hover:text-red-800 font-medium px-3 py-1"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                              <pre className="bg-white p-3 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap border border-gray-200">
{template.template}
                              </pre>
                            </motion.div>
                          ))}

                          {(!socialConfig?.templates || socialConfig.templates.length === 0) && (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                              <p className="text-gray-600 mb-3">No custom templates created.</p>
                              <p className="text-sm text-gray-500">The default template will be used for all posts.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Social Account Form Modal */}
        {showAccountForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingAccount ? "Edit Account" : "Add New Account"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform *</label>
                  <select
                    value={accountForm.platform}
                    onChange={(e) => setAccountForm({ ...accountForm, platform: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="whatsapp">WhatsApp (WAHA)</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Name *</label>
                  <input
                    type="text"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g., Main WhatsApp Account"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={accountForm.enabled}
                      onChange={(e) => setAccountForm({ ...accountForm, enabled: e.target.checked })}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Enabled</span>
                  </label>
                </div>

                {/* WhatsApp (WAHA) Configuration */}
                {accountForm.platform === "whatsapp" && (
                  <div className="border-t pt-4 space-y-4">
                    <h3 className="font-semibold text-gray-800">WAHA Configuration</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">WAHA Base URL *</label>
                      <input
                        type="text"
                        value={accountForm.config.wahaBaseUrl || ""}
                        onChange={(e) => setAccountForm({
                          ...accountForm,
                          config: { ...accountForm.config, wahaBaseUrl: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="http://localhost:3000 or https://waha.yourdomain.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">API Key (Optional)</label>
                      <input
                        type="password"
                        value={accountForm.config.wahaApiKey || ""}
                        onChange={(e) => setAccountForm({
                          ...accountForm,
                          config: { ...accountForm.config, wahaApiKey: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Your WAHA API Key"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session Name *</label>
                      <input
                        type="text"
                        value={accountForm.config.sessionName || ""}
                        onChange={(e) => setAccountForm({
                          ...accountForm,
                          config: { ...accountForm.config, sessionName: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="default"
                      />
                    </div>

                    {/* Session Management */}
                    <div className="border-t pt-4 space-y-3">
                      <h4 className="font-medium text-gray-800">Session Management</h4>
                      
                      <button
                        onClick={() => checkSessionStatus(
                          accountForm.config.wahaBaseUrl,
                          accountForm.config.wahaApiKey,
                          accountForm.config.sessionName
                        )}
                        disabled={checkingStatus || !accountForm.config.wahaBaseUrl || !accountForm.config.sessionName}
                        className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition disabled:opacity-50"
                      >
                        {checkingStatus ? "Checking..." : "🔍 Check Session Status"}
                      </button>

                      {sessionStatus && (
                        <div className={`p-3 rounded-lg text-sm ${
                          sessionStatus.status === "WORKING" 
                            ? "bg-green-50 border border-green-200 text-green-800"
                            : sessionStatus.status === "SCAN_QR_CODE"
                            ? "bg-yellow-50 border border-yellow-200 text-yellow-800"
                            : "bg-red-50 border border-red-200 text-red-800"
                        }`}>
                          <p className="font-medium">Status: {sessionStatus.status}</p>
                          {sessionStatus.me && (
                            <p className="text-xs mt-1">
                              Connected as: {sessionStatus.me.pushName} ({sessionStatus.me.id})
                            </p>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        {(!sessionStatus || sessionStatus.status !== "WORKING") && (
                          <button
                            onClick={startSession}
                            disabled={!accountForm.config.wahaBaseUrl || !accountForm.config.sessionName}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                          >
                            ▶️ Start & Scan QR
                          </button>
                        )}
                        
                        {sessionStatus?.status === "WORKING" && (
                          <>
                            <button
                              onClick={logoutSession}
                              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition"
                            >
                              🚪 Logout
                            </button>
                            <button
                              onClick={stopSession}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
                            >
                              ⏹️ Stop Session
                            </button>
                          </>
                        )}
                      </div>

                      {sessionStatus && (
                        <button
                          onClick={deleteSession}
                          className="w-full bg-red-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-800 transition mt-2"
                        >
                          🗑️ Delete Session Permanently
                        </button>
                      )}
                    </div>

                    <button
                      onClick={fetchWahaGroups}
                      disabled={loadingGroups || !accountForm.config.wahaBaseUrl || !accountForm.config.sessionName || sessionStatus?.status !== "WORKING"}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {loadingGroups ? "Loading..." : "🔄 Fetch Groups & Channels"}
                    </button>

                    {availableGroups.length > 0 && (
                      <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                        <h4 className="font-medium text-gray-800 mb-3">
                          Select Groups & Channels ({availableGroups.length} available)
                        </h4>
                        {availableGroups.map((group) => {
                          const isEnabled = accountForm.config.groups?.find((g: any) => g.id === group.id)?.enabled;
                          return (
                            <label key={group.id} className="flex items-center gap-2 py-2 hover:bg-gray-50 px-2 rounded">
                              <input
                                type="checkbox"
                                checked={isEnabled || false}
                                onChange={() => toggleGroup(group.id)}
                                className="w-4 h-4 text-green-600"
                              />
                              <span className="text-sm text-gray-700 flex-1">
                                {group.type === 'channel' ? '📢 ' : '👥 '}
                                {group.name}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Facebook Configuration */}
                {accountForm.platform === "facebook" && (
                  <div className="border-t pt-4 space-y-4">
                    <h3 className="font-semibold text-gray-800">Facebook Configuration</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Page ID *</label>
                      <input
                        type="text"
                        value={accountForm.config.pageId || ""}
                        onChange={(e) => setAccountForm({
                          ...accountForm,
                          config: { ...accountForm.config, pageId: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Your Facebook Page ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Page Access Token *</label>
                      <textarea
                        value={accountForm.config.pageAccessToken || ""}
                        onChange={(e) => setAccountForm({
                          ...accountForm,
                          config: { ...accountForm.config, pageAccessToken: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs"
                        rows={3}
                        placeholder="EAAxxxxxxxxxxxx..."
                      />
                    </div>
                  </div>
                )}

                {/* LinkedIn Configuration */}
                {accountForm.platform === "linkedin" && (
                  <div className="border-t pt-4 space-y-4">
                    <h3 className="font-semibold text-gray-800">LinkedIn Configuration</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Access Token *</label>
                      <textarea
                        value={accountForm.config.accessToken || ""}
                        onChange={(e) => setAccountForm({
                          ...accountForm,
                          config: { ...accountForm.config, accessToken: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs"
                        rows={3}
                        placeholder="AQVxxxxxxxxxxxxxx..."
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={accountForm.config.isOrganization || false}
                          onChange={(e) => setAccountForm({
                            ...accountForm,
                            config: { ...accountForm.config, isOrganization: e.target.checked }
                          })}
                          className="w-4 h-4 text-green-600"
                        />
                        <span className="text-sm font-medium text-gray-700">Post as Organization</span>
                      </label>
                    </div>
                    {accountForm.config.isOrganization ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Organization ID *</label>
                        <input
                          type="text"
                          value={accountForm.config.organizationId || ""}
                          onChange={(e) => setAccountForm({
                            ...accountForm,
                            config: { ...accountForm.config, organizationId: e.target.value }
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="12345678"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">User ID *</label>
                        <input
                          type="text"
                          value={accountForm.config.userId || ""}
                          onChange={(e) => setAccountForm({
                            ...accountForm,
                            config: { ...accountForm.config, userId: e.target.value }
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="Your LinkedIn User ID"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Instagram Configuration */}
                {accountForm.platform === "instagram" && (
                  <div className="border-t pt-4 space-y-4">
                    <h3 className="font-semibold text-gray-800">Instagram Configuration</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Business Account ID *</label>
                      <input
                        type="text"
                        value={accountForm.config.instagramBusinessAccountId || ""}
                        onChange={(e) => setAccountForm({
                          ...accountForm,
                          config: { ...accountForm.config, instagramBusinessAccountId: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="1234567890123456"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Page Access Token *</label>
                      <textarea
                        value={accountForm.config.pageAccessToken || ""}
                        onChange={(e) => setAccountForm({
                          ...accountForm,
                          config: { ...accountForm.config, pageAccessToken: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-xs"
                        rows={3}
                        placeholder="EAAxxxxxxxxxxxx..."
                      />
                      <p className="text-xs text-gray-500 mt-1">Use your Facebook Page Access Token</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6 border-t pt-4">
                  <button
                    onClick={() => setShowAccountForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveAccount}
                    disabled={!accountForm.name || !accountForm.platform}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                  >
                    Save Account
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Template Form Modal */}
        {showTemplateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-3xl w-full my-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingTemplate ? "Edit Template" : "Add New Template"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform *</label>
                  <select
                    value={templateForm.platform}
                    onChange={(e) => setTemplateForm({ ...templateForm, platform: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template Name *</label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g., Premium Properties Template"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template Content *</label>
                  <textarea
                    value={templateForm.template}
                    onChange={(e) => setTemplateForm({ ...templateForm, template: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm"
                    rows={10}
                    placeholder="🏠 New Property: {{name}}&#10;📍 Location: {{location}}, {{state}}&#10;💰 Price: ₹{{reservePrice}}&#10;&#10;🔗 {{link}}"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Variables: {"{{name}}"}, {"{{location}}"}, {"{{state}}"}, {"{{reservePrice}}"}, {"{{auctionDate}}"}, {"{{area}}"}, {"{{type}}"}, {"{{link}}"}
                  </p>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={templateForm.includeImage}
                      onChange={(e) => setTemplateForm({ ...templateForm, includeImage: e.target.checked })}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Include Image</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={templateForm.includeLink}
                      onChange={(e) => setTemplateForm({ ...templateForm, includeLink: e.target.checked })}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Include Link</span>
                  </label>
                </div>

                <div className="flex gap-3 mt-6 border-t pt-4">
                  <button
                    onClick={() => setShowTemplateForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveTemplate}
                    disabled={!templateForm.name || !templateForm.template}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                  >
                    Save Template
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* QR Code Scanner Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Scan QR Code</h2>
                <button
                  onClick={closeQRModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="text-center">
                {qrCode ? (
                  <div className="space-y-4">
                    <img
                      src={qrCode}
                      alt="WhatsApp QR Code"
                      className="w-full max-w-sm mx-auto border-4 border-gray-200 rounded-lg"
                    />
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        📱 Open WhatsApp on your phone → Settings → Linked Devices → Link a Device → Scan this QR code
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading QR code...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
