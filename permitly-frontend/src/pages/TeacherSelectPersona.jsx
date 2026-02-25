import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTeacherPersonas, createTeacherPersona } from "../api/teacherPersonas";

export default function TeacherSelectPersona() {
    const navigate = useNavigate();

    const [personas, setPersonas] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [mounted, setMounted] = useState(false);

    // ✅ create UI toggle
    const [showCreate, setShowCreate] = useState(false);

    // create form state
    const [newName, setNewName] = useState("");
    const [newPhoto, setNewPhoto] = useState(null);
    const [creating, setCreating] = useState(false);

    // 👩‍🏫 Teacher palette (Teal)
    const theme = useMemo(
        () => ({
            primary: "#005461",
            hover: "#0C7779",
            accent: "#249E94",
            soft: "#3BC1A8",
            bg: "from-[#E7F7F5] via-white to-[#E9FBF8]",
            ring: "#249E94",
        }),
        []
    );

    async function loadPersonas() {
        try {
            setErr("");
            const data = await getTeacherPersonas();
            setPersonas(data);
        } catch (e) {
            setErr(e.message || "Failed to load personas");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setMounted(true);

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        loadPersonas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    const handleContinue = () => {
        if (!selected) {
            setErr("Please select a teacher.");
            return;
        }

        localStorage.setItem("teacherPersonaId", String(selected.id));
        localStorage.setItem("teacherPersonaName", selected.name);
        localStorage.setItem("teacherPersonaPhotoUrl", selected.photoUrl);

        navigate("/teacher/dashboard");
    };

    const handleCreatePersona = async (e) => {
        e.preventDefault();
        setErr("");

        if (!newName.trim()) return setErr("Please enter a name.");
        if (!newPhoto) return setErr("Please choose a photo.");

        setCreating(true);

        try {
            const form = new FormData();
            form.append("name", newName.trim());
            form.append("photo", newPhoto);

            const created = await createTeacherPersona(form);

            // reload list
            await loadPersonas();

            // auto-select new persona (best case: backend returns created object)
            if (created?.id) {
                setSelected(created);
            } else {
                // fallback: try select by name
                const found = personas.find((p) => p.name === newName.trim());
                if (found) setSelected(found);
            }

            // reset form
            setNewName("");
            setNewPhoto(null);
            const fileInput = document.getElementById("persona-photo-input");
            if (fileInput) fileInput.value = "";

            // close panel so user can pick/continue immediately
            setShowCreate(false);
        } catch (e2) {
            setErr(e2.message || "Failed to create persona");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br ${theme.bg} text-slate-900`}>
            {/* top glow */}
            <div className="pointer-events-none fixed inset-0">
                <div
                    className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full blur-3xl"
                    style={{ backgroundColor: "rgba(36, 158, 148, 0.18)" }}
                />
                <div
                    className="absolute top-32 right-[-6rem] h-72 w-72 rounded-full blur-3xl"
                    style={{ backgroundColor: "rgba(12, 119, 121, 0.14)" }}
                />
            </div>

            <div
                className={`relative mx-auto w-full max-w-5xl px-5 py-10 transition-all duration-500 ${
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                            Select your teacher profile
                        </h1>
                        {/*<p className="mt-2 text-slate-600">*/}
                        {/*    Choose your persona. Your name will be shown when you approve/reject.*/}
                        {/*</p>*/}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* ✅ Create persona toggle button */}
                        <button
                            type="button"
                            onClick={() => {
                                setErr("");
                                setShowCreate((v) => !v);
                            }}
                            className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99]"
                            style={{ backgroundColor: theme.primary }}
                        >
                            {showCreate ? "Close" : "+ Create persona"}
                        </button>

                        {/* Teacher badge */}
                        <div className="hidden sm:flex items-center gap-2 rounded-full border bg-white/70 px-4 py-2 text-sm text-slate-600 shadow-sm backdrop-blur">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.accent }} />
                            Teacher mode
                        </div>
                    </div>
                </div>

                {/* ✅ Create Panel (only opens when button clicked) */}
                {showCreate && (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="font-semibold text-slate-900">Create a new persona</div>
                                <p className="text-sm text-slate-600 mt-1">
                                    Add your display name and photo. You can create more anytime 🙂
                                </p>
                            </div>

                            <div
                                className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                                style={{
                                    backgroundColor: "rgba(36, 158, 148, 0.12)",
                                    color: theme.primary,
                                    border: `1px solid rgba(36, 158, 148, 0.25)`,
                                }}
                            >
                                Fast add
                            </div>
                        </div>

                        <form onSubmit={handleCreatePersona} className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div className="sm:col-span-1">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Name
                                </label>
                                <input
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g. 山田先生"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2"
                                    style={{
                                        boxShadow: "0 6px 18px rgba(0, 84, 97, 0.08)",
                                    }}
                                />
                            </div>

                            <div className="sm:col-span-1">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Photo
                                </label>
                                <input
                                    id="persona-photo-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setNewPhoto(e.target.files?.[0] || null)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                                />
                                <p className="text-xs text-slate-500 mt-1">JPG/PNG is fine.</p>
                            </div>

                            <div className="sm:col-span-1 flex items-end gap-2">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className={`w-full inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold text-white shadow-sm transition active:scale-[0.99]
                    ${creating ? "bg-slate-400 cursor-not-allowed" : ""}`}
                                    style={!creating ? { backgroundColor: theme.hover } : undefined}
                                >
                                    {creating ? "Creating…" : "Add"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {err && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                        {err}
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && (
                    <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="rounded-2xl border border-slate-200 bg-white/70 p-3 shadow-sm backdrop-blur"
                            >
                                <div className="aspect-square w-full rounded-xl bg-slate-200 animate-pulse" />
                                <div className="mt-3 h-4 w-2/3 rounded bg-slate-200 animate-pulse" />
                                <div className="mt-2 h-3 w-1/2 rounded bg-slate-200 animate-pulse" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Persona grid */}
                {!loading && (
                    <>
                        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {personas.map((p) => {
                                const active = selected?.id === p.id;

                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => {
                                            setSelected(p);
                                            setErr("");
                                        }}
                                        className={[
                                            "group rounded-2xl border bg-white/70 p-3 text-left shadow-sm backdrop-blur",
                                            "transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
                                            active
                                                ? "ring-2"
                                                : "border-slate-200 hover:border-slate-300",
                                        ].join(" ")}
                                        style={
                                            active
                                                ? { borderColor: theme.accent, boxShadow: "0 10px 28px rgba(0,84,97,0.12)", outline: "none", ringColor: theme.soft }
                                                : undefined
                                        }
                                    >
                                        <div className="relative">
                                            <div
                                                className="aspect-square w-full overflow-hidden rounded-xl border"
                                                style={{ borderColor: active ? "rgba(36,158,148,0.35)" : "rgba(148,163,184,0.35)" }}
                                            >
                                                <img
                                                    src={p.photoUrl}
                                                    alt={p.name}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                                    onError={(e) => {
                                                        e.currentTarget.src = "https://placehold.co/400x400";
                                                    }}
                                                />
                                            </div>

                                            <div
                                                className="absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-semibold"
                                                style={
                                                    active
                                                        ? { backgroundColor: theme.hover, color: "white" }
                                                        : {
                                                            backgroundColor: "rgba(255,255,255,0.85)",
                                                            color: "#475569",
                                                            border: "1px solid rgba(148,163,184,0.4)",
                                                        }
                                                }
                                            >
                                                {active ? "Selected" : "Tap"}
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between gap-2">
                                            <div className="font-semibold leading-tight">{p.name}</div>
                                        </div>

                                        {/*<div className="mt-1 text-xs text-slate-600">*/}
                                        {/*    Click to choose this profile*/}
                                        {/*</div>*/}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={handleContinue}
                                className="inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold text-white shadow-sm transition active:scale-[0.99]"
                                style={{ backgroundColor: theme.primary }}
                            >
                                Continue
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    localStorage.removeItem("teacherPersonaId");
                                    localStorage.removeItem("teacherPersonaName");
                                    localStorage.removeItem("teacherPersonaPhotoUrl");
                                    setSelected(null);
                                }}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/70 px-5 py-3 font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
                            >
                                Clear selection
                            </button>

                            <div className="sm:ml-auto text-sm text-slate-600 flex items-center gap-2">
                                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: theme.accent }} />
                                Tip: create first, then select 🙂
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}