import { useState } from "react";
import { useData } from "../utils/DataProvider";
import LoginModal from "../components/loginModal";
import Alert from "react-bootstrap/Alert";
import Request from "../components/Request";

function ManagementDepartment() {
  const { startup } = useData();
  console.log(startup)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="text-center py-5">
        <h2>Отдел управления</h2>
        <p className="text-muted mb-4">
          Для доступа к управлению запросами требуется авторизация
        </p>
        <LoginModal onLoginSuccess={() => setIsLoggedIn(true)} />
      </div>
    );
  } else
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Отдел управления - Запросы</h2>
        </div>

        {startup?.requests && startup.requests.length > 0 ? (
          <div className="row g-3">
            {startup.requests.map((request) => (
              <Request request={request} key={request.id}/>
            ))}
          </div>
        ) : (
          <Alert variant="info">Нет активных запросов</Alert>
        )}
      </div>
    );
}

export default ManagementDepartment;
