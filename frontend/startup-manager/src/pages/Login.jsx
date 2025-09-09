import Button from "react-bootstrap/esm/Button";
import FetchAccounts from "../components/shared/FetchAccounts";
import { setPassword, loginToManagement } from "../utils/api/requests";
import { useRef } from "react";
import { useData } from "../utils/DataProvider";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const passwordRef = useRef();
  const startup = useRef();
  const navigate = useNavigate();
  const { fetchStartup } = useData();

  const initStartup = async () => {
    const startupAddress = startup.current.value;
    const managementPassword = passwordRef.current.value;

    localStorage.setItem("currentStartup", startupAddress);

    const result = await setPassword(startupAddress, managementPassword);
    console.log(result);

    alert("Загрузка...");
    setTimeout(async () => {
      await loginToManagement(startupAddress, managementPassword);
      await fetchStartup();
      navigate("/startup-profile");
    }, 3000);
  };

  return (
    <>
      <h1>Вход</h1>
      <h2>Задайте пароль</h2>
      <input type="text" ref={startup} placeholder="Адрес из МетаМаска" />
      <input type="text" ref={passwordRef} placeholder="Пароль для отдела?" />
      <Button variant="outline-dark" onClick={initStartup}>
        Задать пароль
      </Button>
      <p>"После создания, автоматический вход"</p>
      <FetchAccounts />
    </>
  );
}
