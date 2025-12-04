"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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

export default function SocialSharingConfig() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"accounts" | "templates">("accounts");
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/social-config", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch configuration");

      const data = await response.json();
      setConfig(data.config);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/social-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error("Failed to save configuration");

      alert("Configuration saved successfully!");
      fetchConfig();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
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

  const saveAccount = () => {
    const accounts = config.accounts || [];
    
    if (editingAccount && editingAccount._id) {
      const index = accounts.findIndex((a: any) => a._id === editingAccount._id);
      accounts[index] = { ...accountForm };
    } else {
      accounts.push({ ...accountForm, _id: Date.now().toString() });
    }

    setConfig({ ...config, accounts });
    setShowAccountForm(false);
  };

  const deleteAccount = (accountId: string) => {
    if (!confirm("Delete this account?")) return;
    
    const accounts = config.accounts.filter((a: any) => a._id !== accountId);
    setConfig({ ...config, accounts });
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

  // Check WAHA session status
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
      const error = err as Error;
      console.error("Status check error:", error);
      return null;
    } finally {
      setCheckingStatus(false);
    }
  };

  // Start WAHA session
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

      if (!response.ok) throw new Error("Failed to start session");

      alert("Session started successfully! Now scan the QR code.");
      showQRScanner();
    } catch (err) {
      const error = err as Error;
      alert(error.message);
    }
  };

  // Show QR code scanner
  const showQRScanner = async () => {
    setShowQRModal(true);
    setQrCode("");
    await fetchQRCode();
    
    // Poll for QR code updates every 5 seconds
    const interval = setInterval(() => {
      fetchQRCode();
    }, 5000);
    
    setQrInterval(interval);
  };

  // Fetch QR code
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
          // Successfully authenticated
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
      const error = err as Error;
      console.error("QR fetch error:", error);
    }
  };

  // Close QR modal
  const closeQRModal = () => {
    if (qrInterval) clearInterval(qrInterval);
    setShowQRModal(false);
    setQrCode("");
  };

  // Logout from WhatsApp
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
      const error = err as Error;
      alert(error.message);
    }
  };

  // Stop session
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
      const error = err as Error;
      alert(error.message);
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
        template: config?.defaultTemplate || "",
        includeImage: true,
        includeLink: true,
      });
    }
    setShowTemplateForm(true);
  };

  const saveTemplate = () => {
    const templates = config.templates || [];
    
    if (editingTemplate && editingTemplate._id) {
      const index = templates.findIndex((t: any) => t._id === editingTemplate._id);
      templates[index] = { ...templateForm };
    } else {
      templates.push({ ...templateForm, _id: Date.now().toString() });
    }

    setConfig({ ...config, templates });
    setShowTemplateForm(false);
  };

  const deleteTemplate = (templateId: string) => {
    if (!confirm("Delete this template?")) return;
    
    const templates = config.templates.filter((t: any) => t._id !== templateId);
    setConfig({ ...config, templates });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600"></div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Social Media Configuration</h1>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/admin/properties?bulkShare=true")}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            📤 Bulk Share Properties
          </button>
          <button
            onClick={saveConfig}
            disabled={saving}
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "💾 Save Configuration"}
          </button>
        </div>
      </div>

      {/* Quick Setup Guide */}
      {(!config?.accounts || config.accounts.length === 0) && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🚀 Quick Setup Guide</h2>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Step 1: Install WAHA</h3>
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
              <h3 className="font-semibold text-gray-800 mb-2">Step 2: Add WhatsApp Account</h3>
              <p className="text-sm text-gray-600">
                Click &quot;Add Account&quot; → Select WhatsApp → Enter your WAHA server URL (e.g., http://localhost:3000)
              </p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Step 3: Authenticate</h3>
              <p className="text-sm text-gray-600">
                Click &quot;Start & Scan QR&quot; → Scan the QR code with WhatsApp → Fetch groups → Start sharing!
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <a
              href="https://github.com/devlikeapro/waha"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              📖 WAHA Documentation →
            </a>
            <a
              href="https://waha.devlike.pro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              🌐 WAHA Website →
            </a>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("accounts")}
          className={`pb-3 px-4 font-medium transition ${
            activeTab === "accounts"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Social Accounts
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`pb-3 px-4 font-medium transition ${
            activeTab === "templates"
              ? "border-b-2 border-green-600 text-green-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Post Templates
        </button>
      </div>

      {/* Accounts Tab */}
      {activeTab === "accounts" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">Manage your social media accounts and WhatsApp groups</p>
            <button
              onClick={() => openAccountForm()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
            >
              + Add Account
            </button>
          </div>

          <div className="grid gap-4">
            {config?.accounts?.map((account: SocialAccount) => (
              <motion.div
                key={account._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-gray-200 rounded-xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{account.name}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {account.platform}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        account.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}>
                        {account.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    
                    {account.platform === "whatsapp" && (
                      <div className="text-sm text-gray-600 mt-2">
                        <p>Session: <span className="font-mono">{account.config.sessionName}</span></p>
                        <p>Groups: {account.config.groups?.filter((g: any) => g.enabled).length || 0} enabled</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => openAccountForm(account)}
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteAccount(account._id!)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {(!config?.accounts || config.accounts.length === 0) && (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-600">No accounts configured yet. Add your first account to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">Create custom post templates for different platforms</p>
            <button
              onClick={() => openTemplateForm()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
            >
              + Add Template
            </button>
          </div>

          {/* Default Template */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">Default Template</h3>
            <p className="text-sm text-blue-700 mb-3">This template is used when no custom template is selected</p>
            <textarea
              value={config?.defaultTemplate || ""}
              onChange={(e) => setConfig({ ...config, defaultTemplate: e.target.value })}
              className="w-full border border-blue-300 rounded-lg p-3 text-sm font-mono"
              rows={8}
            />
            <p className="text-xs text-blue-600 mt-2">
              Variables: {"{"}{"{"} name {"}"}{"}"}, {"{"}{"{"} location {"}"}{"}"}, {"{"}{"{"} state {"}"}{"}"}, {"{"}{"{"} reservePrice {"}"}{"}"}, {"{"}{"{"} auctionDate {"}"}{"}"}, {"{"}{"{"} area {"}"}{"}"}, {"{"}{"{"} type {"}"}{"}"}, {"{"}{"{"} link {"}"}{"}"}
            </p>
          </div>

          <div className="grid gap-4">
            {config?.templates?.map((template: PostTemplate) => (
              <motion.div
                key={template._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-gray-200 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{template.name}</h3>
                    <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {template.platform}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openTemplateForm(template)}
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTemplate(template._id!)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <pre className="bg-gray-50 p-3 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                  {template.template}
                </pre>
              </motion.div>
            ))}

            {(!config?.templates || config.templates.length === 0) && (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-600">No custom templates. The default template will be used for all posts.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Account Form Modal - Continued in next message due to length */}
      {showAccountForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-3xl w-full my-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingAccount ? "Edit Account" : "Add New Account"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name *
                </label>
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

              {/* WhatsApp Configuration */}
              {accountForm.platform === "whatsapp" && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold text-gray-800">WAHA Configuration</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WAHA Base URL *
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key (Optional)
                    </label>
                    <input
                      type="password"
                      value={accountForm.config.wahaApiKey || ""}
                      onChange={(e) => setAccountForm({
                        ...accountForm,
                        config: { ...accountForm.config, wahaApiKey: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Your WAHA API Key (for security)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Set WHATSAPP_API_KEY in your WAHA environment variables
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Name *
                    </label>
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
                  </div>

                  <button
                    onClick={fetchWahaGroups}
                    disabled={loadingGroups || !accountForm.config.wahaBaseUrl || !accountForm.config.sessionName || sessionStatus?.status !== "WORKING"}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loadingGroups ? "Loading Groups..." : "🔄 Fetch WhatsApp Groups"}
                  </button>

                  {sessionStatus?.status !== "WORKING" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-xs text-yellow-800">
                        ⚠️ Session must be authenticated (WORKING status) before fetching groups
                      </p>
                    </div>
                  )}

                  {availableGroups.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <h4 className="font-medium text-gray-800 mb-3">
                        Select Groups to Share ({availableGroups.length} available)
                      </h4>
                      <div className="mb-3 flex gap-2">
                        <button
                          onClick={() => {
                            const groups = availableGroups.map(g => ({ ...g, enabled: true }));
                            setAccountForm({
                              ...accountForm,
                              config: { ...accountForm.config, groups },
                            });
                          }}
                          className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Select All
                        </button>
                        <button
                          onClick={() => {
                            setAccountForm({
                              ...accountForm,
                              config: { ...accountForm.config, groups: [] },
                            });
                          }}
                          className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Clear All
                        </button>
                      </div>
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
                            <span className="text-sm text-gray-700 flex-1">{group.name}</span>
                            <span className="text-xs text-gray-500 font-mono">{group.id.split('@')[0]}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Webhook Configuration (Advanced) */}
                  <details className="border-t pt-4">
                    <summary className="font-medium text-gray-800 cursor-pointer hover:text-green-600">
                      Advanced: Webhook Configuration
                    </summary>
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Webhook URL
                        </label>
                        <input
                          type="text"
                          value={accountForm.config.webhookUrl || ""}
                          onChange={(e) => setAccountForm({
                            ...accountForm,
                            config: { ...accountForm.config, webhookUrl: e.target.value }
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          placeholder="https://yourdomain.com/webhook"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Receive incoming message notifications
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Webhook Events
                        </label>
                        <div className="space-y-2">
                          {['message', 'message.any', 'state.change', 'group.join', 'group.leave'].map(event => (
                            <label key={event} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={accountForm.config.webhookEvents?.includes(event) || false}
                                onChange={(e) => {
                                  const events = accountForm.config.webhookEvents || [];
                                  const newEvents = e.target.checked
                                    ? [...events, event]
                                    : events.filter((ev: string) => ev !== event);
                                  setAccountForm({
                                    ...accountForm,
                                    config: { ...accountForm.config, webhookEvents: newEvents }
                                  });
                                }}
                                className="w-4 h-4 text-green-600"
                              />
                              <span className="text-sm text-gray-700 font-mono">{event}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={accountForm.config.nowait || false}
                            onChange={(e) => setAccountForm({
                              ...accountForm,
                              config: { ...accountForm.config, nowait: e.target.checked }
                            })}
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="text-sm font-medium text-gray-700">No Wait Mode</span>
                        </label>
                        <p className="text-xs text-gray-500 ml-6">
                          Don't wait for session to start, create it immediately
                        </p>
                      </div>
                    </div>
                  </details>
                </div>
              )}

              {/* Facebook Configuration */}
              {accountForm.platform === "facebook" && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold text-gray-800">Facebook Configuration</h3>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <p className="font-medium text-blue-900 mb-1">How to get credentials:</p>
                    <ol className="text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline">Facebook Developers</a></li>
                      <li>Create an App → Add &quot;Facebook Login&quot; product</li>
                      <li>Get Page Access Token from Graph API Explorer</li>
                      <li>Find Page ID in Page Settings → About</li>
                    </ol>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook Page ID *
                    </label>
                    <input
                      type="text"
                      value={accountForm.config.pageId || ""}
                      onChange={(e) => setAccountForm({
                        ...accountForm,
                        config: { ...accountForm.config, pageId: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="1234567890123456"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Your Facebook Page ID (Settings → About)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Access Token *
                    </label>
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
                    <p className="text-xs text-gray-500 mt-1">
                      Long-lived Page Access Token (never expires)
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800">
                      <strong>Required Permissions:</strong> pages_manage_posts, pages_read_engagement
                    </p>
                  </div>
                </div>
              )}

              {/* LinkedIn Configuration */}
              {accountForm.platform === "linkedin" && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold text-gray-800">LinkedIn Configuration</h3>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <p className="font-medium text-blue-900 mb-1">How to get credentials:</p>
                    <ol className="text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Go to <a href="https://www.linkedin.com/developers" target="_blank" rel="noopener noreferrer" className="underline">LinkedIn Developers</a></li>
                      <li>Create App → Add &quot;Share on LinkedIn&quot; product</li>
                      <li>Set redirect URL and get OAuth tokens</li>
                      <li>Get User/Organization URN from profile</li>
                    </ol>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Token *
                    </label>
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
                    <p className="text-xs text-gray-500 mt-1">
                      OAuth 2.0 Access Token (valid for 60 days)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Post As
                    </label>
                    <select
                      value={accountForm.config.postAs || "person"}
                      onChange={(e) => setAccountForm({
                        ...accountForm,
                        config: { ...accountForm.config, postAs: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="person">Personal Profile</option>
                      <option value="organization">Organization Page</option>
                    </select>
                  </div>

                  {accountForm.config.postAs === "person" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        User ID (Person URN) *
                      </label>
                      <input
                        type="text"
                        value={accountForm.config.userId || ""}
                        onChange={(e) => setAccountForm({
                          ...accountForm,
                          config: { ...accountForm.config, userId: e.target.value }
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="ABCDEFGHij"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Your LinkedIn Person ID (from /v2/me API)
                      </p>
                    </div>
                  )}

                  {accountForm.config.postAs === "organization" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization ID *
                      </label>
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
                      <p className="text-xs text-gray-500 mt-1">
                        Your LinkedIn Organization ID (from company page)
                      </p>
                    </div>
                  )}

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800">
                      <strong>Required Scopes:</strong> w_member_social, w_organization_social (for company pages)
                    </p>
                  </div>
                </div>
              )}

              {/* Instagram Configuration */}
              {accountForm.platform === "instagram" && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold text-gray-800">Instagram Configuration</h3>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <p className="font-medium text-blue-900 mb-1">How to get credentials:</p>
                    <ol className="text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Convert to Instagram Business/Creator Account</li>
                      <li>Link to Facebook Page</li>
                      <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline">Facebook Developers</a></li>
                      <li>Create App → Add &quot;Instagram Graph API&quot;</li>
                      <li>Get Page Access Token and IG Business Account ID</li>
                    </ol>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram Business Account ID *
                    </label>
                    <input
                      type="text"
                      value={accountForm.config.instagramBusinessAccountId || ""}
                      onChange={(e) => setAccountForm({
                        ...accountForm,
                        config: { ...accountForm.config, instagramBusinessAccountId: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="17841400000000000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Your Instagram Business Account ID (from Graph API)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Access Token *
                    </label>
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
                    <p className="text-xs text-gray-500 mt-1">
                      Facebook Page Access Token (same as linked Page)
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800">
                      <strong>Required Permissions:</strong> instagram_basic, instagram_content_publish, pages_read_engagement
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs text-red-800">
                      <strong>Note:</strong> Instagram requires images. Text-only posts are not supported. Posts may take 20-30 seconds to process.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAccountForm(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveAccount}
                disabled={!accountForm.name || !accountForm.platform}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                Save Account
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Template Form Modal */}
      {showTemplateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingTemplate ? "Edit Template" : "Add New Template"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name *</label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., WhatsApp Premium Properties"
                />
              </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Content *</label>
                <textarea
                  value={templateForm.template}
                  onChange={(e) => setTemplateForm({ ...templateForm, template: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm"
                  rows={10}
                  placeholder="Use variables like {{name}}, {{location}}, {{state}}, {{reservePrice}}, etc."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available variables: {"{"}{"{"} name {"}"}{"}"}, {"{"}{"{"} location {"}"}{"}"}, {"{"}{"{"} state {"}"}{"}"}, {"{"}{"{"} reservePrice {"}"}{"}"}, {"{"}{"{"} auctionDate {"}"}{"}"}, {"{"}{"{"} area {"}"}{"}"}, {"{"}{"{"} type {"}"}{"}"}, {"{"}{"{"} link {"}"}{"}"}
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
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowTemplateForm(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveTemplate}
                disabled={!templateForm.name || !templateForm.template}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                Save Template
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* QR Code Scanner Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Scan QR Code with WhatsApp
            </h2>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  1. Open WhatsApp on your phone<br />
                  2. Tap Menu or Settings and select Linked Devices<br />
                  3. Tap on Link a Device<br />
                  4. Point your phone to this screen to capture the code
                </p>
              </div>

              {qrCode ? (
                <div className="flex justify-center bg-white p-4 rounded-lg border-2 border-gray-200">
                  <img 
                    src={qrCode} 
                    alt="WhatsApp QR Code" 
                    className="w-64 h-64"
                  />
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-green-600 mx-auto mb-3"></div>
                    <p className="text-gray-600">Loading QR code...</p>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  ⚠️ QR code refreshes automatically. Once scanned successfully, this window will close automatically.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeQRModal}
                className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
