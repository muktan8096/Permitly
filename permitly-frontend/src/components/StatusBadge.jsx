export default function StatusBadge({ status }) {
    const s = (status || "").toUpperCase();

    const base =
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";

    const styles = {
        PENDING: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        APPROVED: "bg-green-100 text-green-800 border border-green-200",
        REJECTED: "bg-red-100 text-red-800 border border-red-200",
    };

    const labelMap = {
        PENDING: "Pending",
        APPROVED: "Approved",
        REJECTED: "Rejected",
    };

    const cls = styles[s] || "bg-gray-100 text-gray-700 border border-gray-200";
    const label = labelMap[s] || status || "Unknown";

    return <span className={`${base} ${cls}`}>{label}</span>;
}
