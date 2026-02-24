// src/services/reportService.js
import api from "./api";

const reportService = {
  getAdminMonthlyReport: async () => {
    try {
      const response = await api.get("accounts/admin/stats/");
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
