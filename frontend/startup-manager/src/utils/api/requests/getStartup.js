import api from "../instance";

export const getStartup = async (address) => {
  try {
    const response = await api.get("/getStartup", {
      params: { address }
    });
    return response.data;
  } catch (error) {
    throw new Error("Ошибка при получении данных стартапа", error);
  }
};
