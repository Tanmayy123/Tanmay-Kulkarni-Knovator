"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api";

export default function HomePage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/logs`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const id = setInterval(fetchLogs, 10000);
    return () => clearInterval(id);
  }, [fetchLogs]);

  const onTrigger = useCallback(async () => {
    try {
      setTriggering(true);
      await fetch(`${API_BASE}/import/trigger`, { method: "POST" });
      await fetchLogs();
    } finally {
      setTriggering(false);
    }
  }, [fetchLogs]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onTrigger}
          disabled={triggering}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {triggering ? "Triggering..." : "Trigger Import"}
        </button>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="overflow-x-auto border rounded bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Timestamp</th>
              <th className="text-left p-3">fileName</th>
              <th className="text-left p-3">Total</th>
              <th className="text-left p-3">New</th>
              <th className="text-left p-3">Updated</th>
              <th className="text-left p-3">Failed</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l._id} className="border-t">
                <td className="p-3">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="p-3 whitespace-pre-wrap break-all">{l.fileName}</td>
                <td className="p-3">{l.totalImported ?? 0}</td>
                <td className="p-3 text-green-700">{l.newJobs ?? 0}</td>
                <td className="p-3 text-blue-700">{l.updatedJobs ?? 0}</td>
                <td className="p-3 text-red-700">{l.failedJobs ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


