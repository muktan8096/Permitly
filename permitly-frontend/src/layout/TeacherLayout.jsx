import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function TeacherLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const personaId = localStorage.getItem("teacherPersonaId");
    const personaName = localStorage.getItem("teacherPersonaName");
    const personaPhotoUrl = localStorage.getItem("teacherPersonaPhotoUrl");

    const theme = {
        primary: "#005461",
        hover: "#0C7779",
        soft: "#E7F7F5",
        accent: "#249E94",
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        if (!personaId && location.pathname !== "/teacher/select-persona") {
            navigate("/teacher/select-persona");
        }
    }, [navigate, personaId, location.pathname]);

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const Item = ({ to, label, emoji }) => (
        <NavLink
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
                cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition",
                    isActive
                        ? "text-white shadow"
                        : "text-slate-700 hover:bg-slate-50"
                )
            }
            style={({ isActive }) =>
                isActive
                    ? { backgroundColor: theme.primary }
                    : undefined
            }
        >
            <span className="text-base">{emoji}</span>
            <span>{label}</span>
        </NavLink>
    );

    return (
        <div
            className="min-h-screen"
            style={{
                background: `linear-gradient(135deg, ${theme.soft} 0%, #ffffff 60%, ${theme.soft} 100%)`,
            }}
        >

            {/* Top bar */}
            <div className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
                <div className="mx-auto max-w-7xl px-4 lg:px-6 py-3 flex items-center justify-between">

                    {/* Left side */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setOpen((v) => !v)}
                            className="lg:hidden rounded-lg px-3 py-2 text-sm font-semibold text-white"
                            style={{ backgroundColor: theme.primary }}
                        >
                            ☰
                        </button>

                        <div
                            className="text-lg font-bold"
                            style={{ color: theme.primary }}
                        >
                            Teacher Panel
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-right">
                            <div className="text-xs text-slate-500">Signed in as</div>
                            <div
                                className="text-sm font-bold"
                                style={{ color: theme.primary }}
                            >
                                {personaName || "Teacher"}
                            </div>
                        </div>

                        <div
                            className="h-10 w-10 overflow-hidden rounded-xl ring-2"
                            style={{ ringColor: theme.accent }}
                        >
                            <img
                                src={personaPhotoUrl || "https://placehold.co/200x200"}
                                alt="teacher"
                                className="h-full w-full object-cover"
                                onError={(e) =>
                                    (e.currentTarget.src = "https://placehold.co/200x200")
                                }
                            />
                        </div>

                        <button
                            onClick={logout}
                            className="hidden sm:inline-flex rounded-xl px-3 py-2 text-sm font-semibold text-white transition"
                            style={{ backgroundColor: theme.hover }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile overlay */}
            {open && (
                <button
                    aria-label="Close overlay"
                    className="lg:hidden fixed inset-0 z-30 bg-black/30"
                    onClick={() => setOpen(false)}
                />
            )}

            <div className="mx-auto max-w-7xl px-4 lg:px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">

                    {/* Sidebar */}
                    <aside
                        className={cn(
                            "lg:sticky lg:top-6 lg:translate-x-0 lg:static lg:h-auto lg:w-auto lg:block",
                            "rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 p-4",
                            "fixed lg:relative z-40 lg:z-auto left-0",
                            "top-[60px] lg:top-auto",
                            "h-[calc(100vh-60px)] lg:h-auto w-72",
                            open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                            "transition-transform duration-200"
                        )}
                    >
                        <div className="space-y-2">
                            <div className="px-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
                                Teacher Menu
                            </div>

                            <Item to="/teacher/dashboard" label="Requests" emoji="📩" />
                            <Item to="/teacher/history" label="History" emoji="🗂️" />
                            <Item to="/teacher/settings" label="Settings" emoji="⚙️" />
                        </div>


                    </aside>

                    {/* Main content */}
                    <main className="min-w-0">
                        <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-slate-200/70">
                            <Outlet />
                        </div>
                    </main>

                </div>
            </div>
        </div>
    );
}