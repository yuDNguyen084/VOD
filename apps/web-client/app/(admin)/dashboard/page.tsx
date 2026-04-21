"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Users", value: 1240 },
    { label: "Total Videos", value: 532 },
    { label: "Reports", value: 12 },
  ];

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-black text-white p-10">
        <h1 className="text-3xl font-bold mb-10">Admin Dashboard</h1>

        <div className="grid grid-cols-3 gap-6 mb-10">
          {stats.map((s, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-neutral-900 border border-white/10"
            >
              <p className="text-sm text-neutral-400">{s.label}</p>
              <p className="text-2xl font-bold mt-2">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-neutral-900 rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Recent Videos</h2>

          <div className="space-y-3">
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-black p-4 rounded-lg"
              >
                <span>Video #{i + 1}</span>
                <button className="text-red-500 hover:underline">Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
