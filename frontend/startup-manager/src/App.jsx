import { useEffect } from "react";
import FetchAccounts from "./components/FetchAccounts";
import { Link, useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  useEffect(() => {
    const status = localStorage.getItem("currentStartup");

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
        <Link className="routeLink" to="/profile">
          Профиль
        </Link>
        <Link className="routeLink" to="/create-requests" aria-disabled>
          Создать требования
        </Link>
        <Link className="routeLink" to="/control">
          Отдел управления
        </Link>
        <Link className="routeLink" to="/events">
          Все события
        </Link>
      </div>
      <p>Изменение аккаунтов происходит через МетаМаск</p>
      <FetchAccounts />
    </div>
  );
}

export default App;
