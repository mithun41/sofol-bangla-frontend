// src/services/reportService.js
import api from "./api";

const BASE = "accounts/reports";

const reportService = {
  // ── পুরনো functions — dashboard এ use হচ্ছে, রাখো ──────────────
  getAdminMonthlyReport: async () => {
    const res = await api.get("accounts/admin/stats/");
    return res.data;
  },

  getUserMonthlyReport: async () => {
    const res = await api.get("orders/user/report-summary/");
    return res.data;
  },

  // ── Sales Report — SalesReportPage এ use হচ্ছে ──────────────────
  getSalesReport: (params = {}) =>
    api.get("orders/admin/sales-report/", { params }),

  // ── নতুন Report APIs ─────────────────────────────────────────────
  getFundReport:      (params = {}) => api.get(`${BASE}/funds/`,            { params }),
  getFundReceivers:   (params = {}) => api.get(`${BASE}/fund-receivers/`,   { params }),
  getMatchingBonus:   (params = {}) => api.get(`${BASE}/matching-bonus/`,   { params }),
  getReferralBonus:   (params = {}) => api.get(`${BASE}/referral-bonus/`,   { params }),
  getLeadershipBonus: (params = {}) => api.get(`${BASE}/leadership-bonus/`, { params }),
  getRankReward:      (params = {}) => api.get(`${BASE}/rank-reward/`,      { params }),
  getWithdrawals:     (params = {}) => api.get(`${BASE}/withdrawals/`,      { params }),
  getActivations:     (params = {}) => api.get(`${BASE}/activations/`,      { params }),
  getStarLevels:      (params = {}) => api.get(`${BASE}/star-levels/`,      { params }),
  getTopEarners:      (params = {}) => api.get(`${BASE}/top-earners/`,      { params }),
  getMonthly:         (params = {}) => api.get(`${BASE}/monthly/`,          { params }),
  getReferralChain:   (username)    => api.get(`${BASE}/referral-chain/${username}/`),
};

export default reportService;