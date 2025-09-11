import { useEffect, useState } from "react";
import FetchAccounts from "../components/shared/FetchAccounts";
import { getEvents } from "../utils/api/requests/getEvents";
import EventCard from "../components/EventCard";

export default function DaoActivity() {

  const [events, setEvents] = useState([])

  async function getAllEvents() {
    const result = await getEvents()
    console.log(result)
    setEvents(result)
  }

  useEffect(() => {
    getAllEvents()
  }, [])

  return (
    <>
      <h2>Все события в DaoSystem</h2>
      {events.map((event, index) => (
        <div key={index} className="event-card">
          <EventCard event={event} index={index}/>
        </div>
      ))}
      <FetchAccounts />
    </>
  );
}
