import api from "../instance";

export const loginToManagement = async (startupId, password) => {
  try {
    const response = await api.post("/loginToManagement", {
      startupId,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Ошибка входа");
  }
};
