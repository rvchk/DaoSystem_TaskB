import { getDepartments } from "../../utils/helpers";

export default function RequestInfo({ request }) {
  const departments = getDepartments();

  return (
    <div>
      <Card.Title>{request.type}</Card.Title>
      <Card.Text>
        <strong>Сумма:</strong> {request.amount} USD
        <br />
        <strong>Департамент:</strong>{" "}
        {departments.find((dept) => dept.value === request.department).label}
        <br />
        <strong>Причина:</strong>{" "}
        {request.purpose == "realise" ? "Реализовать" : "getFunding"}
        <br />
        <strong>Дата:</strong>{" "}
        {new Date(request.submittedAt).toLocaleString("ru-RU")}
        <br />
        <strong>Статус: </strong>
        {request.status == "approve" ? "Принят" : "Отклонен"}
      </Card.Text>
    </div>
  );
}
