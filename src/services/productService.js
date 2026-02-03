import api from "./api";

/**
 * Products & Categories Services
 */

// সব প্রোডাক্ট লিস্ট পাওয়ার জন্য
export const getAllProducts = () => api.get("products/");

// একটি নির্দিষ্ট প্রোডাক্টের ডিটেইলস পাওয়ার জন্য
export const getProductById = (id) => api.get(`products/${id}/`);

// সব ক্যাটাগরি লিস্ট পাওয়ার জন্য
export const getAllCategories = () => api.get("products/categories/");
export const deleteCategory = (id) => api.delete(`products/categories/${id}/`);

// নতুন প্রোডাক্ট যোগ করার জন্য (ইমেজ সহ)
export const createProduct = (formData) => {
  return api.post("products/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// প্রোডাক্ট আপডেট করার জন্য
export const updateProduct = (id, formData) => {
  return api.patch(`products/${id}/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// প্রোডাক্ট ডিলিট করার জন্য
export const deleteProduct = (id) => api.delete(`products/${id}/`);

// নতুন ক্যাটাগরি তৈরি করার জন্য (যদি এডমিন প্যানেলে ক্যাটাগরি অ্যাড করার অপশন রাখেন)
export const createCategory = (data) => api.post("products/categories/", data);
