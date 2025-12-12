"use client";
import LoadingOverlay from "@/components/ui/Loading";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();
    const router = useRouter();

    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return false;
        }

        // Password: 8+ chars, 1 number, 1 letter
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            setError(
                "Password must be at least 8 characters long and contain at least one letter and one number."
            );
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validateForm()) return;

        setLoading(true);
        try {
            const res = await apiRequest("/auth/login", { email, password });
            login(res.token, res.user);
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Something went wrong, please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8"
            >
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
                    Email Login
                </h2>
                <p className="text-gray-500 text-center mb-8">
                    Log in with your email address
                </p>

                <form className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                            placeholder="you@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="text-green-600" /> Remember me
                        </label>
                        <Link href="/forgot-password" className="text-green-600 hover:underline">
                            Forgot password?
                        </Link>
                    </div>

                    {error && (
                        <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition"
                        onClick={handleSubmit}
                    >
                        Log In
                    </button>

                    <LoadingOverlay show={loading} text="Logging in..." />

                </form>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-center text-gray-600 text-sm mb-3">
                        Prefer mobile login?
                    </p>
                    <Link
                        href="/mobile-login"
                        className="block w-full bg-white border-2 border-green-600 text-green-600 py-2 rounded-lg font-medium hover:bg-green-50 transition text-center"
                    >
                        📱 Login with Mobile Number
                    </Link>
                </div>

                <p className="text-center text-gray-600 mt-6 text-sm">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-green-600 hover:underline font-medium">
                        Email Signup
                    </Link>
                    {" or "}
                    <Link href="/mobile-login" className="text-green-600 hover:underline font-medium">
                        Mobile Signup
                    </Link>
                </p>
            </motion.div>
        </section>
    );
}
