import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getMyNotifications, markNotificationAsRead } from "../../api/notification";


export default function Home() {
    const { decrementUnreadCount, refreshUnreadCount } = useOutletContext() || {};
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    async function load() {
        setLoading(true);
        setErr("");
        try {
            const data = await getMyNotifications();

            // sort newest first
            const sorted = [...data].sort(
                (a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
            );

            setItems(sorted);
        } catch (e) {
            setErr("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleClick(n) {
        if (n.read) return;

        // Optimistic UI update
        setItems((prev) =>
            prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
        );
        decrementUnreadCount?.(1);

        try {
            await markNotificationAsRead(n.id);
        } catch (e) {
            await load();
            await refreshUnreadCount?.();
        }
    }

    return (
        <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
                Message Board
            </h2>

            <p className="text-slate-600 mt-2 mb-6">
                Your system notifications appear below.
            </p>

            {loading && (
                <p className="text-slate-500 text-sm">Loading...</p>
            )}

            {err && (
                <p className="text-red-600 text-sm">{err}</p>
            )}

            {!loading && items.length === 0 && (
                <p className="text-slate-500 text-sm">
                    No notifications yet.
                </p>
            )}

            <div className="space-y-3">
                {items.map((n) => (
                    <div
                        key={n.id}
                        onClick={() => handleClick(n)}
                        className={`rounded-2xl border p-4 cursor-pointer transition ${
                            n.read
                                ? "bg-white border-slate-200"
                                : "bg-blue-50 border-blue-300"
                        }`}
                    >
                        <div className="text-sm font-semibold text-slate-900">
                            {n.message}
                        </div>

                        <div className="text-xs text-slate-500 mt-1">
                            {new Date(
                                n.createdAt
                            ).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
