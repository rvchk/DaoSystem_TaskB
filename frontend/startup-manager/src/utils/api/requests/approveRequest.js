import api from "../instance";

export const approveRequest = async (address, requestId, action) => {
  try {
    const response = await api.post("/approveRequest", {
      address,
      requestId,
      action,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Ошибка входа");
  }
};
