import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
    const navigate = useNavigate();

    // We’ll reuse the email saved during login
    const email = localStorage.getItem("permitly_email") || "";

    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");

    const handleChange = async (e) => {
        e.preventDefault();
        setErr("");
        setMsg("");

        if (!email) {
            setErr("Email missing. Please login again.");
            return;
        }
        if (newPassword.length < 6) {
            setErr("Password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirm) {
            setErr("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            // NOTE: Your backend endpoint is: POST /api/auth/change-password?email=...
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/auth/change-password?email=${encodeURIComponent(email)}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    // IMPORTANT: match your ChangePasswordRequest DTO field names if different
                    body: JSON.stringify({
                        newPassword: newPassword,
                    }),
                }
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Password change failed");
            }

            setMsg("Password updated ✅ Please login again.");
            // Clear token if you want a clean re-login
            localStorage.removeItem("permitly_token");

            setTimeout(() => navigate("/login"), 800);
        } catch (error) {
            setErr(error.message || "Password change failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-100">
            <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white/90 backdrop-blur shadow-xl p-7">
                <h1 className="text-2xl font-bold text-slate-900">Set your password</h1>
                <p className="text-sm text-slate-500 mt-1">
                    This is required after temporary login.
                </p>

                {msg && <p className="text-sm text-emerald-700 mt-4">{msg}</p>}
                {err && <p className="text-sm text-red-600 mt-4">Error: {err}</p>}

                <form onSubmit={handleChange} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Email
                        </label>
                        <input
                            value={email}
                            disabled
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 bg-slate-100 text-slate-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            New password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                            placeholder="New password"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Confirm password
                        </label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                            placeholder="Confirm new password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full rounded-2xl py-3 font-semibold transition-all ${
                            loading
                                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                                : "bg-slate-900 text-white hover:shadow-lg hover:-translate-y-0.5"
                        }`}
                    >
                        {loading ? "Updating…" : "Update password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
