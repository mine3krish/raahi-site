"use client";
import { motion } from "framer-motion";
import { ShieldCheck, Banknote, Home, ScrollText } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Property Titles",
    desc: "Every property is verified with bank and legal documentation for your peace of mind.",
  },
  {
    icon: Banknote,
    title: "Deep Discounted Prices",
    desc: "Get access to properties priced 20–50% below market value through auctions.",
  },
  {
    icon: Home,
    title: "Bank-Financed & Trusted",
    desc: "Partnered with leading banks for transparent foreclosure and financed listings.",
  },
  {
    icon: ScrollText,
    title: "Easy Loan Assistance",
    desc: "Avail quick loans from trusted financial partners directly through our platform.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
        >
          Why Buy With Us?
        </motion.h2>

        <p className="text-gray-600 max-w-2xl mx-auto mb-12">
          We make property buying secure, affordable, and transparent — empowering
          you to build your real estate portfolio confidently.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl border border-gray-200 transition p-6 flex flex-col items-center text-center"
            >
              <item.icon className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
