import api from "../../instance";

export const getEvents = async () => {
  try {
    const events = [];
    const response = await api.get("/getEvents");
    const eventsJSON = response.data;
    eventsJSON.map((event) => events.push(JSON.parse(event)));

    return events;
  } catch (error) {
    throw new Error("Ошибка при получении данных стартапа", error);
  }
};
