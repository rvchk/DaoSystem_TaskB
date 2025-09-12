import api from "../../instance";

export const setPassword = async (address, password) => {
  try {
    const response = await api.post("/setPassword", {
      address,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Ошибка входа");
  }
};
