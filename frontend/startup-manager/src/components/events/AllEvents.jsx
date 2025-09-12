import EventCard from "./EventCard";

export default function AllEvents({ events }) {
  return (
    <div>
      {events.map((event, index) => (
        <div key={index} className="event-card">
          <EventCard event={event} index={index} />
        </div>
      ))}
    </div>
  );
}
