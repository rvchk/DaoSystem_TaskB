import { approveRequest } from "../utils/api/requests";
import { useData } from "../utils/DataProvider";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";

export default function Request(props) {
  const {request} = props
  const {fetchStartup, startup} = useData()

  const handleApprove = async (requestId) => {
    try {
      await approveRequest(startup.address, requestId, "approve");
      console.log(startup.address, requestId)
      await fetchStartup();
    } catch (error) {
      console.error("Ошибка при одобрении:", error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await approveRequest(startup.address, requestId, "reject");
      await fetchStartup();
    } catch (error) {
      console.error("Ошибка при отклонении:", error);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "danger";
      case "pending":
        return "warning";
      default:
        return "secondary";
    }
  };

  const departments = [
    { value: 'management', label: 'Менеджмент' },
    { value: 'marketing', label: 'Маркетинг' },
    { value: 'development', label: 'Разработка' },
    { value: 'legal', label: 'Юридический' }
  ];

  return (
    <div key={request.id} className="col-md-6 col-lg-4">
      <Card>
        <Card.Header className="text-center">
          <span className="px-2">Запрос {request.id.slice(0, 8)}</span>
          <Badge bg={getStatusVariant(request.status)}>
            {request.status === "approved" && "Одобрено"}
            {request.status === "rejected" && "Отклонено"}
            {request.status === "pending" && "На рассмотрении"}
          </Badge>
        </Card.Header>
        <Card.Body>
          <Card.Title>{request.type}</Card.Title>
          <Card.Text>
            <strong>Сумма:</strong> {request.amount} USD
            <br />
            <strong>Департамент:</strong> {departments.find(dept => dept.value === request.department).label}
            <br />
            <strong>Причина:</strong> {request.purpose}
            <br />
            <strong>Дата:</strong>{" "}
            {new Date(request.submittedAt).toLocaleString('ru-RU')}
            <br />
            <strong>Статус: </strong>{request.status == "approve" ? "Принят" : "Отклонен"}
          </Card.Text>

          {request.status === "pending" && (
            <div className="flex justify-evenly">
              <Button
                variant="success"
                size="sm"
                onClick={() => handleApprove(request.id)}
              >
                Одобрить
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleReject(request.id)}
              >
                Отклонить
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
