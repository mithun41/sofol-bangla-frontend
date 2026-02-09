// src/services/reportService.js
import api from "./api"; // তোর api.js ফাইলটা ইম্পোর্ট কর

const reportService = {
  getAdminMonthlyReport: async () => {
    try {
      // এখানে আর ম্যানুয়ালি headers বা token দেওয়ার দরকার নেই
      const response = await api.get("orders/admin/report-summary/");
      return response.data;
    } catch (error) {
      console.error("Error fetching admin report:", error);
      throw error;
    }
  },

  getUserMonthlyReport: async () => {
    try {
      const response = await api.get("orders/user/report-summary/");
      return response.data;
    } catch (error) {
      console.error("Error fetching user report:", error);
      throw error;
    }
  },
};

export default reportService;
