"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { authService } from "@/services/authService";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ১. ইউজার ডাটা ফেচ করা
  const fetchUsers = async () => {
    try {
      const res = await api.get("accounts/all-users/");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ২. এডিট হ্যান্ডলার
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ব্যাকএন্ডে আমরা reff_id_input এবং placement_id_input হিসেবে ডাটা পাঠাবো
      const payload = {
        status: selectedUser.status,
        reff_id_input: selectedUser.temp_reff_id || "",
        placement_id_input: selectedUser.temp_placement_id || "",
      };

      await authService.updateUser(selectedUser.id, payload);
      alert("Success: User updated and commission triggered if active!");
      setShowModal(false);
      fetchUsers(); // রিফ্রেশ টেবিল
    } catch (err) {
      alert(err.error || "Update failed! Please check if IDs are correct.");
    } finally {
      setLoading(false);
    }
  };

  // সার্চ ফিল্টারিং
  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm),
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
            MLM MASTER PANEL
          </h1>
          <input
            type="text"
            placeholder="Search by username or phone..."
            className="w-full md:w-80 p-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* --- Table Section --- */}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-gray-400 text-[11px] uppercase tracking-widest font-bold">
                  <th className="p-5">User Details</th>
                  <th className="p-5">Wallet Info</th>
                  <th className="p-5">Direct Referral</th>
                  <th className="p-5">Binary Placement</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-indigo-50/30 transition-colors"
                  >
                    <td className="p-5">
                      <div className="font-bold text-gray-900">
                        {u.username}
                      </div>
                      <div className="text-xs text-gray-400">{u.phone}</div>
                    </td>
                    <td className="p-5">
                      <div className="text-emerald-600 font-black text-sm">
                        ৳{u.balance}
                      </div>
                      <div className="text-[10px] font-bold text-indigo-400">
                        PTS: {u.points}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded inline-block mb-1">
                        {u.reff_id}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        By:{" "}
                        <span className="text-indigo-600">
                          {u.referred_by_username || "Direct"}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded inline-block mb-1">
                        {u.placement_id}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Under:{" "}
                        <span className="text-indigo-600">
                          {u.placement_under_username || "Root"}
                        </span>
                        <span className="ml-1 font-black text-orange-500">
                          ({u.position?.toUpperCase()})
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          u.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser({ ...u });
                          setShowModal(true);
                        }}
                        className="bg-gray-900 text-white text-[11px] font-bold px-4 py-2 rounded-lg hover:bg-indigo-600 transition-all shadow-md"
                      >
                        MANAGE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- Responsive Manage Modal --- */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="bg-indigo-600 p-6 text-white">
              <h2 className="text-xl font-black">
                Manage {selectedUser.username}
              </h2>
              <p className="text-xs opacity-80 mt-1 uppercase tracking-widest">
                Update Networking & Status
              </p>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              {/* Account Status */}
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase mb-2 block">
                  Account Status
                </label>
                <select
                  className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-indigo-500 outline-none font-bold text-gray-700"
                  value={selectedUser.status}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, status: e.target.value })
                  }
                >
                  <option value="inactive">Inactive (🔴)</option>
                  <option value="active">Active (🟢)</option>
                </select>
              </div>

              {/* Referral Assignment */}
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase mb-2 block text-indigo-600">
                  Assign/Change Referrer (ID)
                </label>
                <input
                  type="text"
                  placeholder="Paste Referrer's ID (e.g. REF123)"
                  className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-indigo-500 outline-none text-sm"
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      temp_reff_id: e.target.value,
                    })
                  }
                />
                <p className="mt-1 text-[10px] text-gray-400">
                  Current: {selectedUser.referred_by_username || "Not assigned"}
                </p>
              </div>

              {/* Placement Assignment */}
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase mb-2 block text-orange-500">
                  Assign/Change Placement (ID)
                </label>
                <input
                  type="text"
                  placeholder="Paste Placer's ID (e.g. PLC456)"
                  className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-orange-500 outline-none text-sm"
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      temp_placement_id: e.target.value,
                    })
                  }
                />
                <p className="mt-1 text-[10px] text-gray-400">
                  Current:{" "}
                  {selectedUser.placement_under_username || "Root User"}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-gray-400">
                  Assign Position
                </label>
                <select
                  className="w-full border p-2 rounded-lg"
                  value={selectedUser.position}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      position: e.target.value,
                    })
                  }
                >
                  <option value="left">Left Side</option>
                  <option value="right">Right Side</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  DISMISS
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-indigo-600 text-white py-3 rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:bg-indigo-300 transition-all"
                >
                  {loading ? "SAVING..." : "UPDATE NOW"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
