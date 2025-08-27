import api from "../instance";

export const createStartup = async (ethereumAddress, managementPassword) => {
  try {
    const response = await api.post("/createStartup", {
      address: ethereumAddress,
      password: managementPassword,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Ошибка при создании стартапа",
    );
  }
};
