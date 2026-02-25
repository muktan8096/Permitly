const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function authHeaders() {
    const token = localStorage.getItem("token");
    if (!token) return {}; // ✅ don't send Bearer null
    return { Authorization: `Bearer ${token}` };
}

async function handle(res, fallbackMsg) {
    if (res.ok) {
        // unread-count returns number
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch {
            return text;
        }
    }
    const errorText = await res.text();
    throw new Error(errorText || fallbackMsg);
}

export async function getMyNotifications() {
    const res = await fetch(`${BASE_URL}/api/notifications/my`, {
        headers: { ...authHeaders() },
    });
    return handle(res, "Failed to load notifications");
}

export async function getUnreadCount() {
    const res = await fetch(`${BASE_URL}/api/notifications/unread-count`, {
        headers: { ...authHeaders() },
    });
    return handle(res, "Failed to load unread count");
}

export async function markNotificationAsRead(id) {
    const res = await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { ...authHeaders() },
    });
    return handle(res, "Failed to mark as read");
}
