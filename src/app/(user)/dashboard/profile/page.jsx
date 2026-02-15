"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";
import Swal from "sweetalert2";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [newName, setNewName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get("accounts/profile/");
      setUser(res.data);
      setNewName(res.data.name || "");
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const result = await Swal.fire({
      title: "Update Profile Picture?",
      text: "Do you want to update your profile picture?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0F172A",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Update",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setLoading(true);
      Swal.fire({
        title: "Uploading...",
        didOpen: () => {
          Swal.showLoading();
        },
        allowOutsideClick: false,
      });

      const formData = new FormData();
      formData.append("name", user.name || "");
      formData.append("profile_picture", file);

      try {
        await api.patch("/accounts/profile/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // সাকসেস অ্যালার্ট শেষ হওয়ার পর রিলোড হবে
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Profile picture updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });

        window.location.reload(); // এখানে রিলোড হবে
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Oops!",
          text: "Failed to update profile picture.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNameUpdate = async () => {
    if (!newName.trim() || newName === user.name) {
      setIsEditingName(false);
      return;
    }

    const result = await Swal.fire({
      title: "Update Name?",
      text: `Change name to "${newName}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0F172A",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Update",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setLoading(true);
      Swal.fire({
        title: "Updating...",
        didOpen: () => {
          Swal.showLoading();
        },
        allowOutsideClick: false,
      });

      const formData = new FormData();
      formData.append("name", newName);

      try {
        await api.patch("/accounts/profile/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Name updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });

        window.location.reload(); // পেজ রিলোড হবে যাতে হেডার আপডেট হয়
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Oops!",
          text: "Failed to update name.",
        });
      } finally {
        setLoading(false);
        setIsEditingName(false);
      }
    } else {
      setNewName(user.name || "");
      setIsEditingName(false);
    }
  };

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
          <p className="text-slate-300 text-sm mt-1">
            Manage your account information
          </p>
        </div>

        <div className="p-8">
          {/* Profile Photo Section */}
          <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
            {/* Profile Picture */}
            <div className="relative group">
              <img
                src={
                  previewUrl || user.profile_picture || "/default-avatar.png"
                }
                className="w-32 h-32 rounded-full object-cover border-4 border-slate-100 shadow-lg"
                alt="Profile"
              />
              <label
                htmlFor="photo-upload"
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={loading}
              />
            </div>

            {/* User Info */}
            <div className="flex-1">
              {/* Name Field */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Full Name
                </label>
                {isEditingName ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 rounded-lg border-2 border-slate-900 focus:ring-2 focus:ring-slate-900 outline-none text-lg font-semibold"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleNameUpdate();
                        if (e.key === "Escape") {
                          setNewName(user.name || "");
                          setIsEditingName(false);
                        }
                      }}
                      autoFocus
                      disabled={loading}
                    />
                    <button
                      onClick={handleNameUpdate}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                      disabled={loading}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setNewName(user.name || "");
                        setIsEditingName(false);
                      }}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingName(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-50 cursor-pointer group transition-colors"
                  >
                    <h3 className="text-2xl font-bold text-slate-900">
                      {user.name || user.username}
                    </h3>
                    <svg
                      className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Email Address
                </label>
                <p className="text-slate-700 font-medium">{user.email}</p>
              </div>

              {/* Codes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                  <p className="text-xs text-indigo-600 uppercase font-bold mb-1 tracking-wide">
                    Referral Code
                  </p>
                  <p className="font-mono font-bold text-indigo-900 text-lg">
                    {user.reff_id}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                  <p className="text-xs text-emerald-600 uppercase font-bold mb-1 tracking-wide">
                    Placement Code
                  </p>
                  <p className="font-mono font-bold text-emerald-900 text-lg">
                    {user.placement_id}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
              Account Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                  Username
                </p>
                <p className="text-slate-900 font-semibold">{user.username}</p>
              </div>
              {/* Account Status Section */}
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                  Account Status
                </p>
                <p
                  className={`font-semibold capitalize flex items-center gap-1.5 ${
                    user.status === "active"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      user.status === "active"
                        ? "bg-emerald-600"
                        : "bg-amber-600 animate-pulse"
                    }`}
                  ></span>
                  {user.status || "Pending"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
