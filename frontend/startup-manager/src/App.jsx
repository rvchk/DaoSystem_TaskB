import { useEffect } from "react";
import FetchAccounts from "./components/shared/FetchAccounts";
import { Link, useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  useEffect(() => {
    const status = localStorage.getItem("loggedIn");

    if (!status) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div>
      <h1>Интерфейс приложения</h1>
      <div className="links">
        <Link className="routeLink" to="/login">
          Логин
        </Link>
        <Link className="routeLink" to="/startup-profile">
          Личный кабинет
        </Link>
        <Link className="routeLink" to="/create-requests" aria-disabled>
          Создать требования
        </Link>
        <Link className="routeLink" to="/control-department">
          Отдел управления
        </Link>
        <Link className="routeLink" to="/dao-activity">
          Все события
        </Link>
      </div>
      <p>Изменение аккаунтов происходит через МетаМаск</p>
      <FetchAccounts />
    </div>
  );
}

export default App;
