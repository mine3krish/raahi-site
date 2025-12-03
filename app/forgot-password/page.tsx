"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ForgotPasswordPage() {
    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8"
            >
                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
                    Forgot Password
                </h2>
                <p className="text-gray-500 text-center mb-8 text-sm md:text-base">
                    Enter your registered email address and we’ll send you a link to reset your password.
                </p>

                {/* Form */}
                <form className="space-y-5">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Email Address</label>
                        <input
                            type="email"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition"
                    >
                        Send Reset Link
                    </button>
                </form>

                {/* Footer links */}
                <div className="text-center mt-6">
                    <Link
                        href="/login"
                        className="text-green-600 hover:underline font-medium text-sm"
                    >
                        Back to Login
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
