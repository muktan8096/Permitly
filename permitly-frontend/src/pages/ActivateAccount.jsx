import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, IdCard, User, ArrowRight, CheckCircle2 } from "lucide-react";

// Reusable Input Row Component
function InputRow({
                      icon: Icon,
                      label,
                      value,
                      onChange,
                      type = "text",
                      placeholder,
                      error,
                  }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
                {label}
            </label>

            <div
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition bg-white
          ${
                    error
                        ? "border-red-300 ring-2 ring-red-100"
                        : "border-slate-200 focus-within:ring-2 focus-within:ring-indigo-200 focus-within:border-indigo-300"
                }`}
            >
                <div className={`shrink-0 ${error ? "text-red-500" : "text-slate-500"}`}>
                    <Icon size={18} />
                </div>

                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full outline-none bg-transparent text-slate-900 placeholder:text-slate-400 text-[15px]"
                />
            </div>

            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
    );
}

export default function ActivateAccount() {
    const [fullName, setFullName] = useState("");
    const [schoolId, setSchoolId] = useState("");
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const [errors, setErrors] = useState({});
    const [isSending, setIsSending] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!fullName.trim()) newErrors.fullName = "Full name is required";
        if (!schoolId.trim()) newErrors.schoolId = "School ID is required";
        if (!email.trim()) newErrors.email = "Email is required";
        else if (!email.includes("@")) newErrors.email = "Enter a valid email";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSending(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName,
                    schoolId,
                    email,
                    role: "STUDENT",
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Registration failed");
            }

            setSubmitted(true);
        } catch (err) {
            alert(err.message);
        } finally {
            setIsSending(false);
        }
    };

    const isFormValid =
        fullName.trim() && schoolId.trim() && email.trim() && email.includes("@");

    return (
        <div
            className="
        min-h-[100dvh]
        px-4
        py-6
        sm:py-10
        flex items-start sm:items-center justify-center
        bg-gradient-to-br from-indigo-50 via-white to-sky-100
      "
            style={{
                paddingTop: "max(1.25rem, env(safe-area-inset-top))",
                paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
            }}
        >
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <img
                            src="/icons/Permitly.png"
                            alt="Permitly"
                            className="h-11 w-11 rounded-2xl object-cover shadow-sm ring-1 ring-slate-200 bg-white"
                        />
                        <div>
                            <div className="text-sm font-semibold tracking-wide text-slate-900">
                                Permitly
                            </div>
                            <div className="text-xs text-slate-500">School request system</div>
                        </div>
                    </div>

                    <Link
                        to="/login"
                        className="text-sm font-medium text-indigo-700 hover:text-indigo-900"
                    >
                        Login
                    </Link>
                </div>

                {/* Card */}
                <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur shadow-xl px-5 py-6 sm:px-7 sm:py-7">
                    {!submitted ? (
                        <>
                            <div className="flex items-start justify-between gap-4 mb-5">
                                <div>
                                    <h1 className="text-[22px] sm:text-2xl font-bold text-slate-900 leading-tight">
                                        Activate account
                                    </h1>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Step <span className="font-semibold text-slate-900">1</span> of 2 — we’ll email your temporary password.
                                    </p>
                                </div>

                                <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 bg-white">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    Secure
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <InputRow
                                    icon={User}
                                    label="Full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="e.g. ムクタン　アヌシャ "
                                    error={errors.fullName}
                                />

                                <InputRow
                                    icon={IdCard}
                                    label="School issued ID"
                                    value={schoolId}
                                    onChange={(e) => setSchoolId(e.target.value)}
                                    placeholder="e.g. B-0000"
                                    error={errors.schoolId}
                                />

                                <InputRow
                                    icon={Mail}
                                    label="School email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@school.ac.jp"
                                    error={errors.email}
                                />

                                <button
                                    type="submit"
                                    disabled={!isFormValid || isSending}
                                    className={`w-full rounded-2xl py-3.5 text-[15px] font-semibold transition-all duration-200 flex items-center justify-center gap-2
    ${
                                        !isFormValid || isSending
                                            ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                                            : "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]"
                                    }`}
                                >
                                    {isSending ? (
                                        <>
                                            <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                            Sending…
                                        </>
                                    ) : (
                                        <>
                                            Send temporary password
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>

                                <p className="text-xs text-slate-500 text-center">
                                    Your details must match the school records. We won’t share your email.
                                </p>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-10">
                            <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
                                <CheckCircle2 />
                            </div>

                            <h2 className="text-xl font-bold text-slate-900">Check your email</h2>
                            <p className="text-sm text-slate-600 mt-2">
                                If your details are valid, you’ll receive a temporary password shortly.
                            </p>

                            <div className="mt-6 flex gap-3 justify-center">
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="inline-flex items-center justify-center px-4 py-2 rounded-2xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                                >
                                    Back
                                </button>

                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 hover:shadow-lg transition"
                                >
                                    Go to Login
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Small footer spacing */}
                <div className="h-2" />
            </div>
        </div>
    );
}