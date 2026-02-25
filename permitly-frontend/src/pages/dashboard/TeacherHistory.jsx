import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTeacherDecisionHistory } from "../../api/leaverequest";

function StatusPill({ status }) {
  const s = (status || "").toUpperCase();

  const styles = useMemo(() => {
    if (s === "APPROVED") return "bg-green-50 text-green-800 ring-green-200";
    if (s === "REJECTED") return "bg-red-50 text-red-800 ring-red-200";
    return "bg-slate-50 text-slate-700 ring-slate-200";
  }, [s]);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${styles}`}
    >
      {s || "UNKNOWN"}
    </span>
  );
}

export default function TeacherHistory() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const personaId = localStorage.getItem("teacherPersonaId");
    if (!personaId) {
      navigate("/teacher/select-persona");
      return;
    }

    setLoading(true);
    setErr("");

    getTeacherDecisionHistory()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((e) => {
        console.error("Failed to load decision history:", e);
        setErr(e.message || "Failed to load decision history.");
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div className="text-slate-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Decision History
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            See all leave requests you and other teachers have approved or
            rejected.
          </p>
        </div>

        <div className="text-sm text-slate-600">
          {loading ? "Loading..." : `${items.length} decision(s)`}
        </div>
      </div>

      {err && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
          {err}
        </div>
      )}

      {loading && !err && (
        <div className="mt-5 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70"
            />
          ))}
        </div>
      )}

      {!loading && !err && items.length === 0 && (
        <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
          <div className="text-base font-bold">
            No decisions recorded yet.
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Once teachers start approving or rejecting requests, they will
            appear here.
          </p>
        </div>
      )}

      {!loading && !err && items.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
          <div className="hidden md:grid sticky top-0 z-10 grid-cols-[130px_180px_220px_140px_1fr] gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 bg-slate-50">
            <div>Student ID</div>
            <div>Student</div>
            <div>Title</div>
            <div>Status</div>
            <div>Decided By</div>
          </div>

          <div className="divide-y divide-slate-200/70">
            {items.map((row) => {
              const id = row.requestId ?? row.id ?? "—";
              const studentId = row.studentId ?? "—";
              const studentName = row.studentName ?? "—";
              const title = row.title ?? "—";
              const status = row.status ?? "UNKNOWN";
              const decidedBy = row.decidedByName ?? "—";

              return (
                <div key={String(id)} className="px-4 py-3">
                  {/* Desktop / tablet row */}
                  <div className="hidden md:grid grid-cols-[130px_180px_220px_140px_1fr] gap-3 items-center">
                    <div className="text-sm text-slate-800 font-mono truncate">
                      {studentId}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">
                        {studentName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        #{String(id).slice(-8)}
                      </div>
                    </div>

                    <div className="min-w-0 text-sm text-slate-800 truncate">
                      {title}
                    </div>

                    <div>
                      <StatusPill status={status} />
                    </div>

                    <div className="text-sm text-slate-800">{decidedBy}</div>
                  </div>

                  {/* Mobile row */}
                  <div className="md:hidden">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="text-[11px] text-slate-500 font-mono mb-0.5">
                          {studentId}
                        </div>
                        <div className="font-semibold text-sm truncate">
                          {studentName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          #{String(id).slice(-8)}
                        </div>
                      </div>
                      <StatusPill status={status} />
                    </div>

                    <div className="mt-1 text-sm text-slate-800 truncate">
                      {title}
                    </div>

                    <div className="mt-1 text-xs text-slate-600">
                      By <span className="font-semibold">{decidedBy}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

