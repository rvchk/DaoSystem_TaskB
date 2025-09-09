import api from "../instance";

export const sendRealisationRequest = async (address, department, purpose, percentage, fromStartBalance) => {
  try {
    const response = await api.post("/sendRealisationRequest", {
      address,
      department,
      purpose,
      percentage,
      fromStartBalance
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Ошибка входа");
  }
};
