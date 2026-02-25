import { Link, Outlet, NavLink } from "react-router-dom";
import {
    ClipboardList,
    CalendarCheck,
    Briefcase,
    User,
    Settings,
    Menu,
    X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getUnreadCount } from "../api/notification";

export default function DashboardLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // 🌸 Student palette (Pink)
    const theme = {
        primary: "#944E63",
        hover: "#B47B84",
        soft: "#FFE7E7",
        ring: "#CAA6A6",
    };

    // smaller + responsive typography
    const navItem =
        "flex items-center justify-between px-4 py-3 rounded-2xl transition text-[13px] sm:text-sm font-medium";
    const navActive = "text-white shadow";
    const navIdle = "text-slate-700 hover:bg-slate-100";

    const displayName =
        localStorage.getItem("fullName") ||
        localStorage.getItem("name") ||
        localStorage.getItem("email") ||
        "User";

    async function refreshUnreadCount() {
        try {
            const count = await getUnreadCount();
            setUnreadCount(count);
        } catch (e) {
            console.error("Failed to load unread count");
        }
    }

    useEffect(() => {
        refreshUnreadCount();
    }, []);

    function decrementUnreadCount(by = 1) {
        setUnreadCount((c) => Math.max(0, c - by));
    }

    const Sidebar = () => (
        <aside className="w-64 p-4 border-r border-slate-200 bg-white min-h-[calc(100vh-64px)]">
            <div className="mb-5 text-[12px] sm:text-xs text-slate-700">
                <span className="text-slate-500">Logged in as:</span>{" "}
                <span className="font-semibold text-slate-900">{displayName}</span>
            </div>

            <nav className="space-y-2">
                <NavLink
                    to="/dashboard"
                    end
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                        `${navItem} ${isActive ? navActive : navIdle}`
                    }
                    style={({ isActive }) =>
                        isActive ? { backgroundColor: theme.primary } : undefined
                    }
                >
                    <div className="flex items-center gap-3">
                        <ClipboardList size={18} />
                        Message Board
                    </div>

                    {unreadCount > 0 && (
                        <span
                            className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-2 text-[11px] font-bold text-white rounded-full"
                            style={{ backgroundColor: theme.primary }}
                        >
              {unreadCount}
            </span>
                    )}
                </NavLink>

                <NavLink
                    to="/dashboard/leave-request"
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                        `${navItem} ${isActive ? navActive : navIdle}`
                    }
                    style={({ isActive }) =>
                        isActive ? { backgroundColor: theme.primary } : undefined
                    }
                >
                    <div className="flex items-center gap-3">
                        <ClipboardList size={18} />
                        Leave Request
                    </div>
                </NavLink>

                <NavLink
                    to="/dashboard/attendance"
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                        `${navItem} ${isActive ? navActive : navIdle}`
                    }
                    style={({ isActive }) =>
                        isActive ? { backgroundColor: theme.primary } : undefined
                    }
                >
                    <div className="flex items-center gap-3">
                        <CalendarCheck size={18} />
                        Your Requests
                    </div>
                </NavLink>

                <NavLink
                    to="/dashboard/career"
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                        `${navItem} ${isActive ? navActive : navIdle}`
                    }
                    style={({ isActive }) =>
                        isActive ? { backgroundColor: theme.primary } : undefined
                    }
                >
                    <div className="flex items-center gap-3">
                        <Briefcase size={18} />
                        Your Career
                    </div>
                </NavLink>
            </nav>
        </aside>
    );

    return (
        <div
            className="min-h-screen"
            style={{
                background: `linear-gradient(135deg, ${theme.soft} 0%, #ffffff 55%, ${theme.soft} 100%)`,
            }}
        >
            {/* Top bar */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 relative">
                {/* LEFT */}
                <div className="flex items-center gap-3">
                    <button
                        className="sm:hidden rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open menu"
                        type="button"
                    >
                        <Menu size={18} />
                    </button>
                </div>

                {/* ✅ CENTERED LOGO (no box, no border) */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                    <img
                        src="/icons/Permitly.png"
                        alt="Permitly"
                        className="h-25 sm:h-25 w-auto object-contain"
                    />
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-2">
                    <Link
                        to="/dashboard/profile"
                        className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50"
                        style={{ boxShadow: "0 6px 18px rgba(148,78,99,0.10)" }}
                    >
                        <User size={18} className="text-slate-700" />
                    </Link>

                    <Link
                        to="/dashboard/settings"
                        className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50"
                        style={{ boxShadow: "0 6px 18px rgba(148,78,99,0.10)" }}
                    >
                        <Settings size={18} className="text-slate-700" />
                    </Link>
                </div>
            </div>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 sm:hidden">
                    <div
                        className="absolute inset-0 bg-black/30"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <div className="font-semibold text-slate-900 text-sm">Menu</div>
                            <button
                                className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50"
                                onClick={() => setMobileOpen(false)}
                                type="button"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <Sidebar />
                    </div>
                </div>
            )}

            {/* Layout */}
            <div className="flex">
                <div className="hidden sm:block">
                    <Sidebar />
                </div>

                <main className="flex-1 p-4 sm:p-6">
                    <Outlet
                        context={{
                            unreadCount,
                            setUnreadCount,
                            refreshUnreadCount,
                            decrementUnreadCount,
                        }}
                    />
                </main>
            </div>
        </div>
    );
}