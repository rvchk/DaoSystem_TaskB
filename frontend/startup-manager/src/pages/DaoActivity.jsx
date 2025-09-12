import { getEvents } from "../utils/api/requests/user/getEvents";
import FetchAccounts from "../components/FetchAccounts";
import AllEvents from "../components/events/AllEvents";
import { useEffect, useState } from "react";

export default function DaoActivity() {
  const [events, setEvents] = useState([]);

  async function getAllEvents() {
    const result = await getEvents();
    console.log(result);
    setEvents(result);
  }

  useEffect(() => {
    getAllEvents();
  }, []);

  return (
    <>
      <h2>Все события в DaoSystem</h2>
      <AllEvents events={events} />
      <FetchAccounts />
    </>
  );
}
