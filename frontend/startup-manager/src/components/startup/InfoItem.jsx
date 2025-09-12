export default function InfoItem({ label, value, type = "text" }) {
  const formatValue = (value, type) => {
    if (type === "boolean") {
      return value ? "✅ Да" : "❌ Нет";
    }
    return value || "—";
  };

  return (
    <div className="info-item">
      <span className="label">{label}</span>
      <span className="value">{formatValue(value, type)}</span>
    </div>
  );
}
