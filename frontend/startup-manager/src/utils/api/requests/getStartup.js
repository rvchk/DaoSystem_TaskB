import api from "../instance";

export const getStartup = async (startupId) => {
  try {
    const response = await api.get("/getStartup", { startupId });
    return response.data;
  } catch (error) {
    throw new Error("Ошибка при получении данных стартапа", error);
  }
};
