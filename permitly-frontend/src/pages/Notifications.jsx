import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
    getMyNotifications,
    markNotificationAsRead,
} from "../api/notification";

export default function Notifications() {
    const { decrementUnreadCount, refreshUnreadCount } = useOutletContext() || {};
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const didLoadRef = useRef(false);

    async function load() {
        setLoading(true);
        setErr("");
        try {
            const data = await getMyNotifications();
            setItems(Array.isArray(data) ? data : []);
        } catch (e) {
            setErr("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (didLoadRef.current) return;
        didLoadRef.current = true;
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
            // If the API call fails, reload to keep UI consistent
            await load();
            await refreshUnreadCount?.();
        }
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Notifications</h1>

            {loading && <p>Loading...</p>}
            {err && <p className="text-red-600">{err}</p>}

            <div className="space-y-2">
                {items.map((n) => (
                    <div
                        key={n.id}
                        onClick={() => handleClick(n)}
                        className={`p-4 rounded-xl border cursor-pointer ${
                            n.read
                                ? "bg-white border-slate-200"
                                : "bg-blue-50 border-blue-300"
                        }`}
                    >
                        <div className="text-sm font-medium">
                            {n.message}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            {new Date(n.createdAt).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
