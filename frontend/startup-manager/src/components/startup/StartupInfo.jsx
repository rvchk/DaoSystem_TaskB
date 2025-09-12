import InfoItem from "./InfoItem";

export default function StartupInfo({ startup }) {
  const items = [
    { label: "Адрес:", value: startup?.address },
    { label: "Пароль:", value: startup?.password },
    { label: "Организация:", value: startup?.organization },
    { label: "Общее финансирование:", value: `${startup?.totalFunding} USD` },
    {
      label: "Финансирование получено:",
      value: startup?.fundingReceived,
      type: "boolean",
    },
    {
      label: "Менеджмент вошел:",
      value: startup?.managementLoggedIn,
      type: "boolean",
    },
  ];

  return (
    <div className="info-grid">
      {items.map((item, index) => (
        <InfoItem key={index} {...item} />
      ))}
    </div>
  );
}
