import { Link } from "react-router-dom"
import { useData } from "../components/Data"
function App() {
    const { login } = useData()
    return (
        <div>
            <h1>Save-Traffic-System</h1>
            <div className="link-buttons">
                <Link className="link" to="/profile">Профиль: {login}</Link>
                <Link className="link" to="/loginPage">Авторизация</Link>
                <Link className="link" to="/usersBase">База пользователей</Link>
                <Link className="link" to="/requests">Запросы</Link>
            </div>
            <h3>Ровчак Матвей Сергеевич | Профессионалы 2025</h3>
        </div>
    )
}

export default App