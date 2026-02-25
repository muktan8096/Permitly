const API_BASE = import.meta.env.VITE_API_BASE_URL;

function authHeader() {
    const token = localStorage.getItem("token");
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
}

// 1) Get logged-in user's requests
export async function getMyLeaveRequests() {
    const res = await fetch(`${API_BASE}/api/leave-requests/my`, {
        headers: {
            ...authHeader(),
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load leave requests");
    }

    return res.json();
}

// 2) Create a leave request (without proof upload)
export async function createLeaveRequest(payload) {
    const res = await fetch(`${API_BASE}/api/leave-requests`, {
        cache: "no-store",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeader(),
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create leave request");
    }

    return res.json();
}

// 3) Upload proof file (screenshot)
export async function uploadProof(leaveRequestId, file) {
    const form = new FormData();
    form.append("proof", file);

    const res = await fetch(`${API_BASE}/api/leave-requests/${leaveRequestId}/proof`, {
        method: "POST",
        headers: {
            ...authHeader(),
        },
        body: form,
    });

    const text = await res.text();

    if (!res.ok) {
        throw new Error(`Upload failed (${res.status}): ${text}`);
    }

    return true;
}

/* ================================
   ✅ TEACHER FUNCTIONS (ADD THESE)
   ================================ */

// 4) Get pending requests (teacher)
export async function getPendingLeaveRequests() {
    const res = await fetch(`${API_BASE}/api/leave-requests/pending`, {
        headers: {
            ...authHeader(),
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load pending requests");
    }

    return res.json();
}

// 5) Approve request (teacher)
// backend must have: POST /api/leave-requests/{id}/approve
export async function approveLeaveRequest(id) {
    const res = await fetch(`${API_BASE}/api/leave-requests/${id}/approve`, {
        method: "POST",
        headers: {
            ...authHeader(),
        },
    });

    const text = await res.text();

    if (!res.ok) {
        throw new Error(`Approve failed (${res.status}): ${text}`);
    }

    return true;
}

// 6) Reject request (teacher)
// backend must have: POST /api/leave-requests/{id}/reject
export async function rejectLeaveRequest(id) {
    const res = await fetch(`${API_BASE}/api/leave-requests/${id}/reject`, {
        method: "POST",
        headers: {
            ...authHeader(),
        },
    });

    const text = await res.text();

    if (!res.ok) {
        throw new Error(`Reject failed (${res.status}): ${text}`);
    }

    return true;
}

// 7) Teacher decision history
// GET /api/leave-requests/history
export async function getTeacherDecisionHistory() {
    const res = await fetch(`${API_BASE}/api/leave-requests/history`, {
        headers: {
            ...authHeader(),
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load decision history");
    }

    return res.json();
}

// 8) Update a leave request (only if PENDING)
// backend endpoint: PUT /api/leave-requests/{id}
export async function updateLeaveRequest(id, payload) {
    const res = await fetch(`${API_BASE}/api/leave-requests/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...authHeader(),
        },
        body: JSON.stringify(payload),
    });

    const text = await res.text();

    if (!res.ok) {
        throw new Error(`Update failed (${res.status}): ${text}`);
    }

    // return updated object (your backend should return LeaveRequest JSON)
    try {
        return JSON.parse(text);
    } catch {
        return payload;
    }
}

