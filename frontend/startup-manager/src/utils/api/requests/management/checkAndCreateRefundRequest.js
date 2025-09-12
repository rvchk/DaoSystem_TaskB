import api from "../../instance";

export const checkAndCreateRefundRequest = async (address) => {
  try {
    const response = await api.post("/checkAndCreateRefundRequest", {
      address
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Ошибка входа");
  }
};