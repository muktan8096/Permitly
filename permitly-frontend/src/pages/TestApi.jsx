import { useEffect, useState } from "react";
import axios from "axios";

export default function TestApi() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        axios

            .get(`${import.meta.env.VITE_API_BASE_URL}/api/hello`)
            .then((res) => setData(res.data))
            .catch((err) => setError(err?.message || "Request failed"));

    }, []);

    return (
        <div style={{ padding: 24 }}>
            <h2>Frontend ➜ Backend Test</h2>

            {error && <p style={{ color: "red" }}>Error: {error}</p>}

            <pre style={{ background: "#f3f3f3", padding: 12, borderRadius: 8 }}>
        {data ? JSON.stringify(data, null, 2) : "Loading..."}
      </pre>
        </div>
    );
}
