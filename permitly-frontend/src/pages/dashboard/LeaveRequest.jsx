import { useState } from "react";
import { createLeaveRequest, uploadProof } from "../../api/leaverequest";

export default function LeaveRequest() {
    // form
    const [title, setTitle] = useState("");
    const [type, setType] = useState("SEMINAR");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [proofFile, setProofFile] = useState(null);

    const [err, setErr] = useState("");
    const [msg, setMsg] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        setMsg("");

        if (!title || !type || !date || !startTime || !endTime) {
            setErr("Please fill all fields.");
            return;
        }

        if (!proofFile) {
            setErr("Please upload proof (screenshot).");
            return;
        }

        setSubmitting(true);
        try {
            const created = await createLeaveRequest({
                title,
                type,
                date,
                startTime,
                endTime,
            });

            await uploadProof(created.id, proofFile);

            setMsg("Submitted successfully ✅");

            setTitle("");
            setType("SEMINAR");
            setDate("");
            setStartTime("");
            setEndTime("");
            setProofFile(null);
        } catch (e) {
            setErr(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            {/* Full width container, less wasted space */}
            <div className="px-1 sm:px-3 py-4 sm:py-3">
                <div className="flex flex-col gap-1">
                    <p className="text-sm text-slate-600">
                        Submit a request with proof. Keep it short and clear.
                    </p>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-8 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Submit a request
                        </h2>
                        <div className="text-xs text-slate-500">Required: proof screenshot</div>
                    </div>

                    {err && (
                        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {err}
                        </div>
                    )}
                    {msg && (
                        <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                            {msg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700">Company Name</label>
                            <input
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="株式会社。。。。"
                            />
                        </div>

                        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Type</label>
                                <select
                                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option value="SEMINAR">Seminar</option>
                                    <option value="INTERVIEW">Interview</option>
                                    <option value="EXAMS">Exams</option>
                                    <option value="MENDAN">Mendan</option>
                                    <option value="DISCUSSION">Discussion</option>
                                    <option value="OTHERS">Other</option>

                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Date</label>
                                <input
                                    type="date"
                                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">Start time</label>
                                <input
                                    type="time"
                                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700">End time</label>
                                <input
                                    type="time"
                                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">Proof (screenshot)</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
                                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Upload screenshot of email/message as proof.
                            </p>
                        </div>

                        <div className="pt-1">
                            <button
                                disabled={submitting}
                                className={`w-full sm:w-auto rounded-xl px-5 py-3 text-sm font-semibold ${
                                    submitting
                                        ? "bg-slate-200 text-slate-500"
                                        : "bg-slate-900 text-white hover:bg-slate-800"
                                }`}
                            >
                                {submitting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
