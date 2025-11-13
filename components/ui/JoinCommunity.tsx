"use client";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import Link from "next/link";

export default function JoinCommunity() {
  return (
    <section className="relative overflow-hidden py-20 bg-blue-600 text-white">
      {/* Subtle checkerboard background pattern */}
      <div
        className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.05)_75%,rgba(255,255,255,0.05)),linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.05)_75%,rgba(255,255,255,0.05))] bg-[length:40px_40px] opacity-20"
      />

      <div className="relative max-w-6xl mx-auto px-6 text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <Users className="h-12 w-12 text-white mb-4" />
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Join Our Community
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto mb-10 text-base md:text-lg">
            Connect with verified buyers, agents, and investors across India.  
            Get instant updates, auction alerts, and market discussions in your city.
          </p>
        </motion.div>

        {/* Join Button */}
        <Link href="/communities">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white text-blue-700 font-medium px-8 py-3 rounded-full hover:bg-blue-50 transition"
          >
            Join Community
          </motion.button>
        </Link>

        {/* Footer Note */}
        <p className="mt-8 text-blue-100 text-sm">
          Choose your city and connect with local property experts and buyers.
        </p>
      </div>
    </section>
  );
}
