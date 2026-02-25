function authHeadersJson() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

function authHeadersNoContentType() {
    const token = localStorage.getItem("token");
    return {
        Authorization: `Bearer ${token}`,
    };
}

export async function getTeacherPersonas() {
    const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/teacher/personas`,
        {
            method: "GET",
            headers: authHeadersJson(),
        }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load teacher personas");
    }

    return res.json();
}

export async function createTeacherPersona(formData) {
    const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/teacher/personas`,
        {
            method: "POST",
            headers: authHeadersNoContentType(), // IMPORTANT
            body: formData,
        }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create teacher persona");
    }

    return res.json();
}