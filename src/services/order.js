import api from "./api"; // তোর এপিআই কনফিগ ইমপোর্ট কর

export const orderService = {
  placeOrder: async (orderData) => {
    try {
      // এখানে api অলরেডি বেস ইউআরএল এবং টোকেন হ্যান্ডেল করার কথা
      const response = await api.post("orders/place-order/", orderData);
      return response.data;
    } catch (error) {
      console.error("Order API Error:", error.response?.data || error.message);
      throw error;
    }
  },
};
