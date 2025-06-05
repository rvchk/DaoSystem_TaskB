import { useEffect, useState } from "react"
import { useData } from "../components/Data"
import UserBlock from "../components/UserBlock"
function Profile() {
  const { login, role } = useData()
  const [user, setUser] = useState()
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/getUser/${login}`);

      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  return (
    <>
      <h1>Профиль: {login}</h1>
      <UserBlock user={user} />
      <h3>Ровчак Матвей Сергеевич | Профессионалы 2025</h3>
    </>
  )
}

export default Profile