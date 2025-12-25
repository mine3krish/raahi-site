"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Eye, Award, Users, Mail, Phone, User, Linkedin } from "lucide-react";
import Loading from "@/components/ui/Loading";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  email: string;
  phone: string;
  bio: string;
  linkedin?: string;
  order: number;
}

export default function AboutPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    aboutTitle: "About Raahi Auction",
    aboutDescription: "",
    missionStatement: "",
    visionStatement: "",
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings({
          aboutTitle: data.aboutTitle || settings.aboutTitle,
          aboutDescription: data.aboutDescription || settings.aboutDescription,
          missionStatement: data.missionStatement || settings.missionStatement,
          visionStatement: data.visionStatement || settings.visionStatement,
        });
        const members = data.teamMembers || [];
        setTeamMembers(members.sort((a: TeamMember, b: TeamMember) => a.order - b.order));
      }
    } catch (error) {
      console.error("Error fetching about data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-0">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{settings.aboutTitle}</h1>
              {settings.aboutDescription && (
                <p className="text-xl text-green-50 leading-relaxed">
                  {settings.aboutDescription}
                </p>
              )}
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Mission */}
              {settings.missionStatement && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl shadow-lg p-8"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Target className="text-green-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Our Mission</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{settings.missionStatement}</p>
                </motion.div>
              )}

              {/* Vision */}
              {settings.visionStatement && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl shadow-lg p-8"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Eye className="text-blue-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Our Vision</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{settings.visionStatement}</p>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Stats/Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Why Choose Raahi Auction
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Your trusted partner in finding the perfect property
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full mb-4">
                  <Award className="text-green-600" size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Bank Verified</h3>
                <p className="text-gray-600">
                  All properties are verified by banks ensuring authenticity and security
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-full mb-4">
                  <Users className="text-blue-600" size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Expert Team</h3>
                <p className="text-gray-600">
                  Professional team dedicated to helping you find your dream property
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="inline-flex items-center justify-center p-4 bg-purple-100 rounded-full mb-4">
                  <Target className="text-purple-600" size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Transparent Process</h3>
                <p className="text-gray-600">
                  Clear and transparent auction process with no hidden charges
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Team Members Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Meet Our Team
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                The dedicated professionals who make Raahi Auction possible
              </p>
            </motion.div>

            {teamMembers.length === 0 ? (
              <div className="text-center py-12">
                <User className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-500">Our team information will be available soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {/* Member Image */}
                    <div className="relative h-64 bg-gray-200">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-400 to-green-600">
                          <User className="h-24 w-24 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Member Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                      <p className="text-green-600 font-medium mb-3">{member.role}</p>
                      
                      {member.bio && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{member.bio}</p>
                      )}

                      {/* Contact Info */}
                      <div className="space-y-2 pt-4 border-t border-gray-100">
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition"
                          >
                            <Mail size={16} />
                            <span className="truncate">{member.email}</span>
                          </a>
                        )}
                        {member.phone && (
                          <a
                            href={`tel:${member.phone.replace(/\s/g, "")}`}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition"
                          >
                            <Phone size={16} />
                            <span>{member.phone}</span>
                          </a>
                        )}
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-700 transition"
                          >
                            <Linkedin size={16} />
                            <span>LinkedIn</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-green-600 to-green-700">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center text-white"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Find Your Dream Property?
              </h2>
              <p className="text-xl text-green-50 mb-8 max-w-2xl mx-auto">
                Browse our extensive collection of verified properties across India
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="/properties"
                  className="px-8 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                >
                  Browse Properties
                </a>
                <a
                  href="/contact"
                  className="px-8 py-3 bg-green-800 text-white rounded-lg font-semibold hover:bg-green-900 transition-colors"
                >
                  Contact Us
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
