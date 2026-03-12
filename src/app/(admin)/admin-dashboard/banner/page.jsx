"use client";
import { useEffect, useState } from "react";
import { banner } from "@/services/banner";

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    image: null,
    link: "", // নতুন লিঙ্ক ফিল্ড
    is_active: true,
  });

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await banner.getBanners();
      setBanners(data);
    } catch (error) {
      console.error("Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title || "");
    data.append("link", formData.link || "");
    data.append("is_active", formData.is_active);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      if (editId) {
        await banner.updateBanner(editId, data);
      } else {
        await banner.createBanner(data);
      }
      closeModal();
      loadBanners();
    } catch (err) {
      alert("Error saving banner");
    }
  };

  const openEditModal = (item) => {
    setEditId(item.id);
    setFormData({
      title: item.title || "",
      link: item.link || "",
      is_active: item.is_active,
      image: null,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData({ title: "", image: null, link: "", is_active: true });
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Banners</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#ff620a] text-white px-4 py-2 rounded-lg font-bold"
        >
          + Add New
        </button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Image</th>
              <th className="p-4">Info</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              banners.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4">
                    <img
                      src={item.image}
                      className="w-24 h-12 object-cover rounded border"
                      alt=""
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-bold">{item.title || "No Title"}</div>
                    <div className="text-xs text-gray-500">
                      {item.link || "No Link"}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${item.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-blue-600 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm("Sure?")) {
                          await banner.deleteBanner(item.id);
                          loadBanners();
                        }
                      }}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              {editId ? "Update Banner" : "New Banner"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                className="w-full border p-2 rounded"
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Redirect Link (URL)"
                value={formData.link}
                className="w-full border p-2 rounded"
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
              />
              <input
                type="file"
                className="w-full text-sm"
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.files[0] })
                }
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                />
                <label>Active Status</label>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border p-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#ff620a] text-white p-2 rounded font-bold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
