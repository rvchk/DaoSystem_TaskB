import FetchAccounts from "../components/FetchAccounts";
import LoginForm from "../components/forms/LoginForm";

export default function Login() {
  return (
    <>
      <h1>Вход</h1>
      <h2>Задайте пароль</h2>
      <LoginForm />
      <p>"После создания, автоматический вход"</p>
      <FetchAccounts />
    </>
  );
}
