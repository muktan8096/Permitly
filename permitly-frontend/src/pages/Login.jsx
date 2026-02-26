import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";

export default function Login() {
    const navigate = useNavigate();
    const [isTeacherMode, setIsTeacherMode] = useState(false);

    // Student fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Teacher fields (REAL email + password)
    const [teacherEmail, setTeacherEmail] = useState("");
    const [teacherPassword, setTeacherPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [showSuccessGif, setShowSuccessGif] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErr("");
        setLoading(true);

        try {
            const payload = isTeacherMode
                ? { email: teacherEmail, password: teacherPassword }
                : { email, password };

            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Login failed");
            }

            const data = await res.json();

            if (!data?.token) {
                throw new Error("No token received from backend.");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("permitly_email", payload.email);
            if (data.fullName) {
                localStorage.setItem("fullName", data.fullName);
            }
            localStorage.setItem(
                "mustChangePassword",
                String(!!data.mustChangePassword)
            );

            if (data.mustChangePassword) {
                navigate("/change-password");
                return;
            }

            // Show GIF loading screen
            setShowSuccessGif(true);

            setTimeout(() => {
                if (data?.role === "TEACHER") {
                    navigate("/teacher/select-persona");
                } else {
                    navigate("/dashboard");
                }
            }, 2500); // Wait 2.5 seconds to show the GIF

        } catch (error) {
            setErr(error.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    /* 🎨 COLOR PALETTES */
    const teacher = {
        primary: "#005461",
        hover: "#0C7779",
        bg: "from-[#005461] via-[#0C7779] to-[#249E94]",
    };

    const student = {
        primary: "#944E63",
        hover: "#B47B84",
        bg: "from-[#944E63] via-[#B47B84] to-[#CAA6A6]",
    };

    const theme = isTeacherMode ? teacher : student;

    // Loading overlay
    if (showSuccessGif) {
        return (
            <div className={`min-h-[100dvh] flex flex-col items-center justify-center px-4 bg-white`}>
                <img
                    src="/gif/permitly.gif"
                    alt="Loading..."
                    className="w-64 h-auto object-contain"
                />
            </div>
        );
    }

    return (
        <div
            className={`min-h-[100dvh] flex items-start sm:items-center justify-center px-4 py-8 bg-gradient-to-br ${theme.bg}`}
        >
            <div className="w-full max-w-md rounded-3xl bg-white/90 backdrop-blur shadow-xl px-6 py-6">
                {/* Small Mode Tab */}
                <div className="flex justify-end mb-3">
                    <button
                        type="button"
                        onClick={() => {
                            setIsTeacherMode((v) => !v);
                            setErr("");
                        }}
                        className="rounded-full border px-3 py-1 text-[11px] font-semibold"
                        style={{ borderColor: theme.primary, color: theme.primary }}
                    >
                        {isTeacherMode ? "Teacher" : "Student"}
                    </button>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-slate-900">
                    {isTeacherMode ? "Teacher Login" : "Student Login"}
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                    {isTeacherMode
                        ? "Login with your staff account."
                        : "Use the temporary password you received by email."}
                </p>

                {err && <p className="text-sm text-red-600 mt-3">{err}</p>}

                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                    {/* EMAIL */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700">
                            Email
                        </label>

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 pl-11 text-[13px] outline-none focus:ring-2 focus:ring-black/5"
                                type="email"
                                value={isTeacherMode ? teacherEmail : email}
                                onChange={(e) =>
                                    isTeacherMode
                                        ? setTeacherEmail(e.target.value)
                                        : setEmail(e.target.value)
                                }
                                placeholder="name@school.ac.jp"
                                required
                            />
                        </div>
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700">
                            Password
                        </label>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 pl-11 text-[13px] outline-none focus:ring-2 focus:ring-black/5"
                                type="password"
                                value={isTeacherMode ? teacherPassword : password}
                                onChange={(e) =>
                                    isTeacherMode
                                        ? setTeacherPassword(e.target.value)
                                        : setPassword(e.target.value)
                                }
                                placeholder={
                                    isTeacherMode ? "Teacher account password" : "Temporary password"
                                }
                                required
                            />
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-2xl py-3 text-white font-semibold shadow-md transition-all active:scale-[0.98]"
                        style={{ backgroundColor: theme.primary }}
                        onMouseOver={(e) =>
                            (e.currentTarget.style.backgroundColor = theme.hover)
                        }
                        onMouseOut={(e) =>
                            (e.currentTarget.style.backgroundColor = theme.primary)
                        }
                    >
                        {loading ? "Logging in…" : "Login"}
                    </button>

                    {/* Student only link */}
                    {!isTeacherMode && (
                        <div className="text-center pt-2">
                            <Link
                                to="/activate"
                                className="text-xs font-medium"
                                style={{ color: theme.primary }}
                            >
                                Don’t have a temporary password? Activate your account →
                            </Link>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}