// import { useData } from "./data/DataProvider";
import FetchAccounts from "./components/shared/FetchAccounts";
import { Link } from "react-router-dom";

function App() {
  // const { startup } = useData();

  return (
    <div>
      <h1>Интерфейс приложения</h1>
      <div className="links">
        <Link className="routeLink" to="/startup-profile">
          Личный кабинет
          {/* Профиль {startup?.name} */}
        </Link>
        <Link className="routeLink" to="/create-requests">
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
