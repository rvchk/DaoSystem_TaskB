import api from "../instance";

export const transferFromManagement = async (address, department, percentage) => {
  try {
    const response = await api.post("/transferFromManagement", {
      address,
      department,
      percentage,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Ошибка входа");
  }
};