"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Search,
  Eye,
  Trash2,
  Clock,
  X,
} from "lucide-react";

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "read";
  createdAt: string;
  updatedAt: string;
}

interface Counts {
  all: number;
  new: number;
  read: number;
  responded: number;
  archived: number;
}

export default function AdminContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [counts, setCounts] = useState<Counts>({
    all: 0,
    new: 0,
    read: 0,
    responded: 0,
    archived: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [searchQuery, statusFilter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/admin/contacts?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      setContacts(data.contacts);
      setCounts(data.counts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchContacts();
        if (selectedContact?._id === id) {
          setSelectedContact({ ...selectedContact, status: status as any });
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        fetchContacts();
        setShowModal(false);
        setSelectedContact(null);
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const openModal = (contact: Contact) => {
    setSelectedContact(contact);
    setShowModal(true);
    if (contact.status === "new") {
      updateStatus(contact._id, "read");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      new: "bg-blue-100 text-blue-700 border-blue-200",
      read: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };

    const icons = {
      new: <Clock size={14} />,
      read: <Eye size={14} />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
          styles[status as keyof typeof styles]
        }`}
      >
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const statusOptions = [
    { value: "all", label: "All", count: counts.all },
    { value: "new", label: "New", count: counts.new },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Contact Messages
          </h1>
          <p className="text-gray-600">
            Manage and respond to customer inquiries
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                statusFilter === option.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="text-2xl font-bold text-gray-900">
                {option.count}
              </div>
              <div className="text-sm text-gray-600">{option.label}</div>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name, email, subject, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Contacts List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Mail className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No contacts found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <motion.div
                key={contact._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl border-2 p-6 transition-all cursor-pointer ${
                  contact.status === "new"
                    ? "border-blue-200 bg-blue-50/30"
                    : "border-gray-200"
                }`}
                onClick={() => openModal(contact)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {contact.name}
                      </h3>
                      {getStatusBadge(contact.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{contact.email}</p>
                    <p className="text-sm text-gray-600 mb-2">{contact.phone}</p>
                    <p className="font-medium text-gray-800 mb-2">
                      {contact.subject}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {contact.message}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500 flex-shrink-0">
                    {new Date(contact.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {showModal && selectedContact && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Contact Details
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {["new", "read", "responded", "archived"].map((status) => (
                        <button
                          key={status}
                          onClick={() =>
                            updateStatus(selectedContact._id, status)
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            selectedContact.status === status
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Name
                    </label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {selectedContact.name}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <a
                      href={`mailto:${selectedContact.email}`}
                      className="mt-1 text-blue-600 hover:underline block"
                    >
                      {selectedContact.email}
                    </a>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Phone
                    </label>
                    <a
                      href={`tel:${selectedContact.phone}`}
                      className="mt-1 text-blue-600 hover:underline block"
                    >
                      {selectedContact.phone}
                    </a>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Subject
                    </label>
                    <p className="mt-1 text-lg font-medium text-gray-900">
                      {selectedContact.subject}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Message
                    </label>
                    <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                      {selectedContact.message}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-gray-500">Received</label>
                      <p className="text-gray-900">
                        {new Date(selectedContact.createdAt).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-500">Updated</label>
                      <p className="text-gray-900">
                        {new Date(selectedContact.updatedAt).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => deleteContact(selectedContact._id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold"
                    >
                      <Trash2 size={20} />
                      Delete Contact
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
