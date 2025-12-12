'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface VisibleFields {
  id: boolean;
  name: boolean;
  location: boolean;
  state: boolean;
  type: boolean;
  reservePrice: boolean;
  EMD: boolean;
  AuctionDate: boolean;
  area: boolean;
  images: boolean;
  status: boolean;
  description: boolean;
  note: boolean;
  inspectionDate: boolean;
  assetAddress: boolean;
  agentMobile: boolean;
  youtubeVideo: boolean;
  newListingId: boolean;
  schemeName: boolean;
  category: boolean;
  city: boolean;
  areaTown: boolean;
  date: boolean;
  emd: boolean;
  incrementBid: boolean;
  bankName: boolean;
  branchName: boolean;
  contactDetails: boolean;
  address: boolean;
  borrowerName: boolean;
  publishingDate: boolean;
  applicationSubmissionDate: boolean;
  auctionStartDate: boolean;
  auctionEndTime: boolean;
  auctionType: boolean;
  listingId: boolean;
  notice: boolean;
  source: boolean;
  url: boolean;
  fingerprint: boolean;
  assetCategory: boolean;
  assetCity: boolean;
  publicationDate: boolean;
}

interface PropertyTemplate {
  _id: string;
  name: string;
  state?: string;
  isDefault: boolean;
  visibleFields: Partial<VisibleFields>;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const FIELD_GROUPS = {
  'Core Fields': [
    'id', 'name', 'location', 'state', 'type', 'reservePrice', 'EMD', 
    'AuctionDate', 'area', 'images', 'status', 'youtubeVideo'
  ],
  'Excel Import Fields': [
    'newListingId', 'schemeName', 'category', 'city', 'areaTown', 'date',
    'emd', 'incrementBid', 'bankName', 'branchName', 'contactDetails',
    'address', 'borrowerName', 'publishingDate', 'applicationSubmissionDate',
    'auctionStartDate', 'auctionEndTime', 'auctionType', 'listingId', 'notice'
  ],
  'Description & Notes': [
    'description', 'note', 'inspectionDate', 'assetAddress', 'agentMobile'
  ],
  'Advanced Fields': [
    'source', 'url', 'fingerprint', 'assetCategory', 'assetCity', 'publicationDate'
  ]
};

export default function TemplateManagerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<PropertyTemplate[]>([]);
  const [defaultTemplate, setDefaultTemplate] = useState<PropertyTemplate | null>(null);
  const [selectedState, setSelectedState] = useState<string>('');
  const [editingTemplate, setEditingTemplate] = useState<PropertyTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    visibleFields: {} as Partial<VisibleFields>
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/property-templates');
      const data = await response.json();
      
      const defaultTemp = data.templates.find((t: PropertyTemplate) => t.isDefault && !t.state);
      setDefaultTemplate(defaultTemp || null);
      setTemplates(data.templates.filter((t: PropertyTemplate) => t.state));
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setIsLoading(false);
    }
  };

  const handleEditTemplate = (template: PropertyTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      state: template.state || '',
      visibleFields: template.visibleFields
    });
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      state: '',
      visibleFields: defaultTemplate?.visibleFields || {}
    });
  };

  const handleFieldToggle = (field: string) => {
    setFormData(prev => ({
      ...prev,
      visibleFields: {
        ...prev.visibleFields,
        [field]: !prev.visibleFields[field as keyof VisibleFields]
      }
    }));
  };

  const handleToggleAll = (groupFields: string[], value: boolean) => {
    const updates: Partial<VisibleFields> = {};
    groupFields.forEach(field => {
      updates[field as keyof VisibleFields] = value;
    });
    setFormData(prev => ({
      ...prev,
      visibleFields: {
        ...prev.visibleFields,
        ...updates
      }
    }));
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('Please enter a template name');
      return;
    }

    setIsSaving(true);
    try {
      const url = '/api/admin/property-templates';
      const method = editingTemplate ? 'PUT' : 'POST';
      const body = editingTemplate
        ? { id: editingTemplate._id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        await fetchTemplates();
        setEditingTemplate(null);
        setFormData({ name: '', state: '', visibleFields: {} });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`/api/admin/property-templates?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchTemplates();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Property Template Manager</h1>
        <button
          onClick={handleNewTemplate}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          + New State Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Template List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Templates</h2>
            
            {/* Default Template */}
            {defaultTemplate && (
              <div className="mb-4">
                <div
                  onClick={() => handleEditTemplate(defaultTemplate)}
                  className="p-4 border-2 border-blue-500 rounded-lg cursor-pointer hover:bg-blue-50"
                >
                  <div className="font-semibold text-blue-600">Default Template</div>
                  <div className="text-sm text-gray-600">{defaultTemplate.name}</div>
                </div>
              </div>
            )}

            {/* State Templates */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">State-Specific Templates</h3>
              {templates.length === 0 ? (
                <div className="text-sm text-gray-500 italic">No state templates yet</div>
              ) : (
                templates.map(template => (
                  <div
                    key={template._id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                  >
                    <div onClick={() => handleEditTemplate(template)}>
                      <div className="font-medium">{template.state}</div>
                      <div className="text-sm text-gray-600">{template.name}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(template._id);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">
              {editingTemplate ? `Edit: ${editingTemplate.name}` : 'Create New Template'}
            </h2>

            {/* Form Fields */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Template Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="e.g., Maharashtra Template"
                />
              </div>

              {!editingTemplate?.isDefault && (
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Visible Fields */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Visible Fields</h3>
              
              {Object.entries(FIELD_GROUPS).map(([groupName, fields]) => (
                <div key={groupName} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">{groupName}</h4>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleToggleAll(fields, true)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => handleToggleAll(fields, false)}
                        className="text-sm text-gray-600 hover:underline"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {fields.map(field => (
                      <label key={field} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!formData.visibleFields[field as keyof VisibleFields]}
                          onChange={() => handleFieldToggle(field)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{field}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setEditingTemplate(null);
                  setFormData({ name: '', state: '', visibleFields: {} });
                }}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isSaving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
