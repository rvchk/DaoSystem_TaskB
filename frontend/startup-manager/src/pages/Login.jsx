import Button from "react-bootstrap/esm/Button";
import FetchAccounts from "../components/shared/FetchAccounts";
import { createStartup, loginToManagement } from "../utils/api/requests";
import { useRef } from "react";

export default function Login() {
  const passwordRef = useRef();

  const initStartup = async () => {
    const startupAddress = localStorage.getItem("currentStartup") || "";
    const managementPassword = passwordRef.current.value;

    await createStartup(startupAddress, managementPassword);
    await loginToManagement(startupAddress, managementPassword);
  };

  const login = async () => {
    const startupAddress = localStorage.getItem("currentStartup") || "";
    const managementPassword = passwordRef.current.value;

    await loginToManagement(startupAddress, managementPassword);
  };

  return (
    <>
      <h1>Логин</h1>
      <h2>Задайте пароль</h2>
      <input type="text" ref={passwordRef} placeholder="Пароль для отдела?" />
      <Button variant="outline-dark" onClick={initStartup}>
        Задать пароль
      </Button>
      <p>"После создания, автоматический вход"</p>
      <h2>Войти в отдел управления</h2>
      <input type="text" ref={passwordRef} placeholder="Пароль для отдела?" />
      <Button variant="outline-dark" onClick={login}>
        Задать пароль
      </Button>
      <FetchAccounts />
    </>
  );
}
