"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { authService } from "@/services/authService";
import Swal from "sweetalert2";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleUpdate = async (e) => {
    e.preventDefault();

    // কনফার্মেশন প্রম্পট (ঐচ্ছিক কিন্তু প্রফেশনাল)
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are updating settings for ${selectedUser.username}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#f43f5e",
      confirmButtonText: "Yes, Update it!",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const payload = {
        status: selectedUser.status,
        position: selectedUser.position,
        reff_id_input: selectedUser.temp_reff_id || "",
        placement_id_input: selectedUser.temp_placement_id || "",
      };

      await authService.updateUser(selectedUser.id, payload);

      // সাকসেস অ্যালার্ট
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "User and Tree recalculated successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error("Update Error:", err.response?.data);

      // এরর অ্যালার্ট
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          err.response?.data?.error ||
          "Check if IDs are valid and not occupied.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm),
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            NETWORK <span className="text-indigo-600">MASTER PANEL</span>
          </h1>
          <input
            type="text"
            placeholder="Search by username or phone..."
            className="w-full md:w-80 p-3 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* --- Table Section --- */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-gray-100">
                <tr className="text-slate-400 text-[11px] uppercase tracking-widest font-bold">
                  <th className="p-5">User Details</th>
                  <th className="p-5">Wallet Info</th>
                  <th className="p-5">Direct Referral</th>
                  <th className="p-5">Binary Placement</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-5">
                      <div className="font-bold text-slate-700">
                        {u.username}
                      </div>
                      <div className="text-xs text-slate-400">{u.phone}</div>
                    </td>
                    <td className="p-5">
                      <div className="text-emerald-600 font-black text-sm">
                        ৳{u.balance}
                      </div>
                      <div className="text-[10px] font-bold text-indigo-400 uppercase">
                        PTS: {u.points}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="text-xs font-mono bg-slate-100 px-2 py-1 rounded inline-block mb-1">
                        {u.reff_id}
                      </div>
                      <div className="text-[10px] text-slate-500 italic">
                        By: {u.referred_by_username || "Direct"}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="text-xs font-mono bg-slate-100 px-2 py-1 rounded inline-block mb-1">
                        {u.placement_id}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">
                        {u.position || "N/A"} Under{" "}
                        {u.placement_under_username || "Root"}
                      </div>
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"}`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser({
                            ...u,
                            temp_reff_id: "",
                            temp_placement_id: "",
                          });
                          setShowModal(true);
                        }}
                        className="bg-slate-800 text-white text-[11px] font-bold px-4 py-2 rounded-lg hover:bg-indigo-600 transition-all shadow-sm"
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

      {/* --- Manage Modal --- */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-indigo-600 p-6 text-white text-center">
              <h2 className="text-xl font-black italic uppercase tracking-tighter">
                Settings: {selectedUser.username}
              </h2>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">
                  Account Status
                </label>
                <select
                  className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold text-slate-700 bg-slate-50"
                  value={selectedUser.status}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, status: e.target.value })
                  }
                >
                  <option value="inactive">Inactive 🔴</option>
                  <option value="active">Active 🟢</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-indigo-600 uppercase mb-2 block">
                  Assign Binary Position
                </label>
                <select
                  className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold text-slate-700 bg-slate-50"
                  value={selectedUser.position || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      position: e.target.value,
                    })
                  }
                >
                  <option value="" disabled>
                    Select Side
                  </option>
                  <option value="left">Left Side</option>
                  <option value="right">Right Side</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                    Update Referrer ID
                  </label>
                  <input
                    type="text"
                    value={selectedUser.temp_reff_id || ""}
                    placeholder="Enter ID"
                    className="w-full p-2 text-xs rounded-lg border-2 border-slate-100 outline-none focus:border-indigo-500"
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        temp_reff_id: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                    Update Placement ID
                  </label>
                  <input
                    type="text"
                    value={selectedUser.temp_placement_id || ""}
                    placeholder="Enter ID"
                    className="w-full p-2 text-xs rounded-lg border-2 border-slate-100 outline-none focus:border-indigo-500"
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        temp_placement_id: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-indigo-600 text-white py-3 rounded-2xl font-black text-xs shadow-lg hover:bg-indigo-700 disabled:bg-slate-300 transition-all uppercase"
                >
                  {loading ? "Processing..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
