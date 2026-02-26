import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getPendingLeaveRequests,
    approveLeaveRequest,
    rejectLeaveRequest,
} from "../../api/leaverequest.js";

function StatusPill({ status }) {
    const s = (status || "").toUpperCase();

    const styles = useMemo(() => {
        if (s === "APPROVED") return "bg-green-50 text-green-800 ring-green-200";
        if (s === "REJECTED") return "bg-red-50 text-red-800 ring-red-200";
        return "bg-amber-50 text-amber-800 ring-amber-200";
    }, [s]);

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${styles}`}
        >
            {s || "PENDING"}
        </span>
    );
}

// ✅ Mobile: dot instead of pill
function StatusDot({ status }) {
    const s = (status || "").toUpperCase();
    let color = "bg-amber-400"; // pending default

    if (s === "APPROVED") color = "bg-emerald-500";
    if (s === "REJECTED") color = "bg-red-500";

    return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
}

function formatDateOnly(value) {
    if (!value) return "—";
    try {
        if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return String(value);
        return d.toLocaleDateString();
    } catch {
        return String(value);
    }
}

export default function TeacherDashboard() {
    const navigate = useNavigate();

    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [busyId, setBusyId] = useState(null);

    const API = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const personaId = localStorage.getItem("teacherPersonaId");
        if (!personaId) {
            navigate("/teacher/select-persona");
            return;
        }

        setLoading(true);
        setErr("");

        getPendingLeaveRequests()
            .then((data) => setPendingRequests(Array.isArray(data) ? data : []))
            .catch((e) => {
                console.error("Failed to load pending requests:", e);
                setErr(e.message || "Failed to load pending requests.");
                setPendingRequests([]);
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    const toAbsoluteUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        if (url.startsWith("/")) return `${API}${url}`;
        return `${API}/${url}`;
    };

    const decide = async (id, action) => {
        if (!id || id === "—") return;

        setErr("");
        setBusyId(id);

        const before = pendingRequests;

        // optimistic remove
        setPendingRequests((prev) =>
            prev.filter((r) => (r.id ?? r.requestId ?? r.leaveRequestId) !== id)
        );

        try {
            if (action === "approve") await approveLeaveRequest(id);
            else await rejectLeaveRequest(id);
        } catch (e) {
            console.error(e);
            setPendingRequests(before);
            setErr(e.message || `Failed to ${action}.`);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="text-slate-900">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Requests</h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Review and approve student leave requests.
                    </p>
                </div>

                <div className="text-sm text-slate-600">
                    {loading ? "Loading..." : `${pendingRequests.length} request(s)`}
                </div>
            </div>

            {err && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
                    {err}
                </div>
            )}

            {loading && !err && (
                <div className="mt-5 space-y-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="h-14 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70"
                        />
                    ))}
                </div>
            )}

            {!loading && !err && pendingRequests.length === 0 && (
                <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                    <div className="text-base font-bold">No pending requests 🎉</div>
                    <p className="mt-1 text-sm text-slate-600">
                        When students submit leave requests, they’ll show up here.
                    </p>
                </div>
            )}

            {!loading && !err && pendingRequests.length > 0 && (
                <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
                    <div className="overflow-x-auto">
                        <div className="min-w-full lg:min-w-[1050px]">
                            {/* Desktop header */}
                            <div className="hidden lg:grid sticky top-0 z-10 grid-cols-[200px_180px_110px_140px_1fr_90px_220px] gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 bg-slate-50 border-b border-slate-200/70">
                                <div>Student</div>
                                <div>Company</div>
                                <div>Date</div>
                                <div>Time</div>
                                <div>Reason</div>
                                <div>Proof</div>
                                <div className="text-right">Action</div>
                            </div>

                            <div className="divide-y divide-slate-200/70">
                                {pendingRequests.map((req) => {
                                    const id = req.id ?? req.requestId ?? req.leaveRequestId ?? "—";

                                    const studentName =
                                        req.student_full_name ??
                                        req.studentName ??
                                        req.student?.fullName ??
                                        req.student?.full_name ??
                                        `Student #${req.student_id ?? req.studentId ?? "—"}`;

                                    const company =
                                        req.title ??
                                        req.companyName ??
                                        req.company ??
                                        req.place ??
                                        req.type ??
                                        "—";

                                    const reason =
                                        req.reason ??
                                        req.type ??
                                        req.note ??
                                        req.message ??
                                        "—";

                                    const date = req.date;
                                    const startTime = req.startTime ?? req.start_time ?? "—";
                                    const endTime = req.endTime ?? req.end_time ?? "—";

                                    const proofUrl =
                                        req.proofUrl ??
                                        req.proof_url ??
                                        req.proof ??
                                        req.attachmentUrl ??
                                        req.fileUrl ??
                                        null;

                                    const status = req.status ?? "PENDING";
                                    const isBusy = busyId === id;

                                    return (
                                        <div key={String(id)} className="px-4 py-3">
                                            {/* Desktop row */}
                                            <div className="hidden lg:grid grid-cols-[200px_180px_110px_140px_1fr_90px_220px] gap-3 items-center">
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-slate-900 truncate">{studentName}</div>
                                                    <div className="text-[11px] text-slate-500 font-mono">
                                                        #{String(id).slice(-8)}
                                                    </div>
                                                </div>

                                                <div className="min-w-0 text-sm text-slate-800 truncate">{company}</div>

                                                <div className="text-sm text-slate-800">{formatDateOnly(date)}</div>

                                                <div className="text-sm text-slate-800">
                                                    {startTime && endTime ? (
                                                        <span>
                                                            {startTime} <span className="text-slate-400">→</span> {endTime}
                                                        </span>
                                                    ) : (
                                                        "—"
                                                    )}
                                                </div>

                                                <div className="min-w-0 text-sm text-slate-700 truncate">{reason}</div>

                                                <div>
                                                    {proofUrl ? (
                                                        <a
                                                            href={toAbsoluteUrl(proofUrl)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-sm font-semibold text-blue-700 hover:underline"
                                                        >
                                                            View
                                                        </a>
                                                    ) : (
                                                        <span className="text-sm text-slate-400">—</span>
                                                    )}
                                                </div>

                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() => decide(id, "approve")}
                                                        className={`rounded-xl px-3 py-2 text-sm font-bold transition ${isBusy
                                                                ? "bg-slate-100 text-slate-400 ring-1 ring-slate-200"
                                                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                                                            }`}
                                                    >
                                                        ✓ Approve
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() => decide(id, "reject")}
                                                        className={`rounded-xl px-3 py-2 text-sm font-bold transition ${isBusy
                                                                ? "bg-slate-100 text-slate-400 ring-1 ring-slate-200"
                                                                : "bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
                                                            }`}
                                                    >
                                                        ✕ Reject
                                                    </button>
                                                </div>
                                            </div>

                                            {/* ✅ Mobile row — compact list + dot */}
                                            <div className="lg:hidden border-b border-slate-200 py-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <StatusDot status={status} />
                                                        <div className="font-semibold text-sm truncate">{studentName}</div>
                                                    </div>

                                                    {/* Keep pill off mobile to save space */}
                                                </div>

                                                <div className="text-sm text-slate-700 truncate mt-1">{company}</div>

                                                <div className="text-xs text-slate-500 mt-1">
                                                    {formatDateOnly(date)} • {startTime} → {endTime}
                                                </div>

                                                <div className="mt-2 flex items-center gap-4 text-xs">
                                                    {proofUrl && (
                                                        <a
                                                            href={toAbsoluteUrl(proofUrl)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-blue-600 font-semibold"
                                                        >
                                                            Proof
                                                        </a>
                                                    )}

                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() => decide(id, "approve")}
                                                        className={`font-bold ${isBusy ? "text-slate-400" : "text-emerald-600"
                                                            }`}
                                                    >
                                                        Approve
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() => decide(id, "reject")}
                                                        className={`font-bold ${isBusy ? "text-slate-400" : "text-red-600"
                                                            }`}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
