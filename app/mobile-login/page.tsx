"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MobileLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/mobile/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setMessage(data.message);
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/mobile/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: `+91${mobile}`,
          otp,
          name: name || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify OTP");
      }

      // Save token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect and force refresh
      setMessage("Login successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/mobile/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend OTP");
      }

      setMessage("OTP resent successfully!");
      setOtp("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {step === "mobile" ? "Welcome Back!" : "Verify OTP"}
          </h1>
          <p className="text-gray-600">
            {step === "mobile"
              ? "Login or signup with your mobile number"
              : "Enter the OTP sent to your WhatsApp"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {message}
          </div>
        )}

        {step === "mobile" ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="flex gap-2">
                <div className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-700 font-medium">
                  +91
                </div>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) setMobile(value);
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="9876543210"
                  required
                  maxLength={10}
                  pattern="[6-9][0-9]{9}"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                We'll send an OTP to your WhatsApp
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || mobile.length !== 10}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 6) setOtp(value);
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-center text-2xl tracking-widest focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="000000"
                required
                maxLength={6}
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                Sent to +91 {mobile}
              </p>
            </div>

            {isNewUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("mobile");
                  setOtp("");
                  setError("");
                  setMessage("");
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Change Number
              </button>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-3">Or continue with</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              Email Login
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/signup"
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              Email Signup
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
