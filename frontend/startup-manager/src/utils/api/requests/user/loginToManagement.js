import api from "../../instance";

export const loginToManagement = async (address, password) => {
  try {
    const response = await api.post("/loginToManagement", {
      address,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Ошибка входа");
  }
};
