import { approveRequest, checkAndCreateRefundRequest } from "../../utils/api/requests";
import { useData } from "../../utils/DataProvider";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import RequestInfo from "./RequestInfo";

export default function Request({ request }) {
  const { fetchStartup, startup } = useData();

  const handleApprove = async (requestId, action) => {
    try {
      await approveRequest(startup.address, requestId, action);
      await checkAndCreateRefundRequest(startup.address)
      await fetchStartup();
    } catch (error) {
      console.error("Ошибка при одобрении:", error);
    }
  };
  console.log(startup.requests[0].id)

  return (
    <div key={request.id} className="col-md-6 col-lg-4">
      <Card>
        <Card.Header className="text-center">
          <span className="px-2">Запрос {request.id.slice(0, 8)}</span>
          <Badge>
            {request.status === "approved" && "Одобрено"}
            {request.status === "pending" && "На рассмотрении"}
            {request.status === "rejected" && "Отклонено"}
          </Badge>
        </Card.Header>
        <Card.Body>
          <RequestInfo request={request} />
          {request.status === "pending" && (
            <div className="flex justify-evenly">
              <Button
                variant="success"
                size="sm"
                onClick={() => handleApprove(request.id, "approve")}
              >
                Одобрить
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleApprove(request.id, "reject")}
              >
                Отклонить
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
