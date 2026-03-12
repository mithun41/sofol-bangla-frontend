// src/services/banner.js
import api from "./api";

export const banner = {
  getBanners: async () => {
    const res = await api.get("products/banners/");
    return res.data;
  },
  createBanner: async (formData) => {
    const res = await api.post("products/banners/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  // আপডেট করার জন্য PUT বা PATCH
  updateBanner: async (id, formData) => {
    const res = await api.patch(`products/banners/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  // ডিলিট করার জন্য
  deleteBanner: async (id) => {
    const res = await api.delete(`products/banners/${id}/`);
    return res.data;
  },
};
