export default function EventCard({ event, index }) {
  const shortValue = (value) => {
    value = String(value);
    if (value.length > 22) {
      return value.slice(0, 22) + "...";
    } else return value;
  };

  return (
    <div className="userCard">
      <h3>Event {index + 1}</h3>
      {Object.entries(event)
        .filter(([key]) => isNaN(Number(key)))
        .map(([key, value]) => (
          <p key={key}>
            <strong>{key}:</strong> {shortValue(value)}
          </p>
        ))}
    </div>
  );
}
