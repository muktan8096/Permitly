import { useEffect, useMemo, useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import { getMyLeaveRequests, updateLeaveRequest } from "../../api/leaverequest.js";

export default function Attendance() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [busyId, setBusyId] = useState(null);

    // ✅ sort state
    const [sortOrder, setSortOrder] = useState("newest"); // newest | oldest

    // edit modal state
    const [editOpen, setEditOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [proofViewerUrl, setProofViewerUrl] = useState(null);

    // edit form fields
    const [title, setTitle] = useState("");
    const [type, setType] = useState("SEMINAR");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    async function load() {
        setErr("");
        setLoading(true);
        try {
            const data = await getMyLeaveRequests();
            const list = Array.isArray(data) ? data : [];
            setItems(list); // ✅ don't sort here, we sort in useMemo so filter works live
        } catch (e) {
            setErr(e.message || "Failed to load requests");
            setItems([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    // ✅ helper: pick best sortable time
    const getSortKey = (r) => {
        // Best: createdAt from backend (LocalDateTime) -> ISO-like string
        if (r?.createdAt) {
            const t = new Date(r.createdAt).getTime();
            if (!Number.isNaN(t)) return t;
        }

        // Fallback: date + startTime
        const d = r?.date || "";
        const st = r?.startTime || "00:00:00";
        const t2 = new Date(`${d}T${st}`).getTime();
        if (!Number.isNaN(t2)) return t2;

        // Last fallback
        return 0;
    };

    // ✅ always render sorted version based on dropdown
    const sortedItems = useMemo(() => {
        const copy = [...items];
        copy.sort((a, b) => {
            const A = getSortKey(a);
            const B = getSortKey(b);
            return sortOrder === "newest" ? B - A : A - B;
        });
        return copy;
    }, [items, sortOrder]);

    const openEdit = (r) => {
        setEditItem(r);
        setTitle(r.title || "");
        setType(r.type || "SEMINAR");
        setDate(r.date || "");
        setStartTime(r.startTime || "");
        setEndTime(r.endTime || "");
        setEditOpen(true);
    };

    const closeEdit = () => {
        setEditOpen(false);
        setEditItem(null);
    };

    const canEdit = (r) => String(r.status || "").toUpperCase() === "PENDING";

    const handleSave = async () => {
        if (!editItem?.id) return;

        setErr("");
        setBusyId(editItem.id);

        try {
            const updated = await updateLeaveRequest(editItem.id, {
                title,
                type,
                date,
                startTime,
                endTime,
            });

            // update list locally
            setItems((prev) =>
                prev.map((x) => (x.id === editItem.id ? { ...x, ...updated } : x))
            );

            closeEdit();
        } catch (e) {
            setErr(e.message || "Failed to update request");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="w-full">
            <div className="px-3 sm:px-6 py-4 sm:py-6">
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            Your Requests
                        </h1>
                        <p className="text-sm text-slate-600 mt-1">
                            View your request history. You can edit only while it is pending.
                        </p>
                    </div>

                    <button
                        onClick={load}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Refresh
                    </button>
                </div>

                {err && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {err}
                    </div>
                )}

                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Request History
                            </h2>
                            <div className="text-sm text-slate-600 mt-1">
                                {loading ? "Loading..." : `${items.length} item(s)`}
                            </div>
                        </div>

                        {/* ✅ Sort dropdown */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600">Sort:</span>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                <option value="newest">old → new</option>
                                <option value="oldest">new → old</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4">
                        {loading ? (
                            <p className="text-sm text-slate-600">Loading…</p>
                        ) : sortedItems.length === 0 ? (
                            <p className="text-sm text-slate-600">No requests yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {sortedItems.map((r) => (
                                    <div
                                        key={r.id}
                                        className="rounded-xl border border-slate-200 p-3 sm:p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="font-semibold text-slate-900 truncate">
                                                    {r.title}
                                                </div>

                                                <div className="text-xs sm:text-sm text-slate-600 mt-1">
                                                    {r.date} • {r.startTime} - {r.endTime} • {r.type}
                                                </div>

                                                {/* Optional: show createdAt if you want */}
                                                {r.createdAt && (
                                                    <div className="text-[11px] text-slate-500 mt-1">
                                                        Submitted: {new Date(r.createdAt).toLocaleString()}
                                                    </div>
                                                )}

                                                {String(r.status).toUpperCase() === "REJECTED" &&
                                                    r.rejectReason && (
                                                        <div className="text-sm text-red-600 mt-1">
                                                            Reason: {r.rejectReason}
                                                        </div>
                                                    )}

                                                {r.proofUrl && (
                                                    <button
                                                        type="button"
                                                        className="inline-block mt-2 text-xs sm:text-sm font-medium text-blue-700 hover:underline text-left"
                                                        onClick={() => setProofViewerUrl(`${import.meta.env.VITE_API_BASE_URL}${r.proofUrl}`)}
                                                    >
                                                        View proof 📎
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                <StatusBadge status={r.status} />

                                                {canEdit(r) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(r)}
                                                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Modal */}
                {editOpen && editItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-3">
                        <div className="absolute inset-0 bg-black/30" onClick={closeEdit} />
                        <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xl">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-sm text-slate-500">Edit request</div>
                                    <div className="text-lg font-semibold text-slate-900">
                                        {editItem.title}
                                    </div>
                                </div>
                                <button
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                    onClick={closeEdit}
                                >
                                    Close
                                </button>
                            </div>

                            <div className="mt-4 grid gap-3 sm:gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">
                                        Title
                                    </label>
                                    <input
                                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">
                                            Type
                                        </label>
                                        <select
                                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                        >
                                            <option value="SEMINAR">Seminar</option>
                                            <option value="INTERVIEW">Interview</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-700">
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-700">
                                            Start time
                                        </label>
                                        <input
                                            type="time"
                                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-700">
                                            End time
                                        </label>
                                        <input
                                            type="time"
                                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-end pt-2">
                                    <button
                                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                        onClick={closeEdit}
                                        disabled={busyId === editItem.id}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className={`rounded-xl px-4 py-2 text-sm font-semibold ${busyId === editItem.id
                                                ? "bg-slate-200 text-slate-500"
                                                : "bg-slate-900 text-white hover:bg-slate-800"
                                            }`}
                                        onClick={handleSave}
                                        disabled={busyId === editItem.id}
                                    >
                                        {busyId === editItem.id ? "Saving..." : "Save"}
                                    </button>
                                </div>

                                <p className="text-xs text-slate-500">
                                    You can only edit while status is <b>PENDING</b>.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Proof Viewer Modal */}
                {proofViewerUrl && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setProofViewerUrl(null)} />
                        <div className="relative w-full max-w-4xl flex flex-col items-center">
                            <div className="w-full flex justify-end mb-3">
                                <button
                                    onClick={() => setProofViewerUrl(null)}
                                    className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 backdrop-blur-md transition-all flex items-center gap-2"
                                >
                                    ✕ Close Proof
                                </button>
                            </div>
                            <img
                                src={proofViewerUrl}
                                alt="Proof"
                                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/10"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
