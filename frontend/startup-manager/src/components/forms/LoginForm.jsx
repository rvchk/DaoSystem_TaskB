import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginToManagement, setPassword } from "../../utils/api/requests";
import { Alert, Button, Card, Form } from "react-bootstrap";

export default function LoginForm() {
  const [error, setError] = useState("Заполните все поля");
  const [isLoading, setLoading] = useState(false);
  const passwordRef = useRef();
  const startupRef = useRef();
  const navigate = useNavigate();

  const validate = () => {
    const startupAddress = startupRef.current.value;
    const managementPassword = passwordRef.current.value;

    if (!startupAddress) {
      setError("Заполните адрес");
      return startupAddress;
    }
    if (!managementPassword) {
      setError("Напишите пароль");
      return managementPassword;
    }
    setError("");
    return true;
  };

  const initStartup = async () => {
    setLoading(true)
    const startupAddress = startupRef.current.value;
    const managementPassword = passwordRef.current.value;

    localStorage.setItem("currentStartup", startupAddress);

    await setPassword(startupAddress, managementPassword);

    alert("Загрузка...");
    setTimeout(async () => {
      setLoading(false)
      await loginToManagement(startupAddress, managementPassword);
      navigate("/profile");
      location.reload();
    }, 3000);
  };

  return (
    <Card>
      <Form onSubmit={initStartup}>
        <Form.Group>
          <Form.Label htmlFor="address">Адрес стартапа</Form.Label>
          <Form.Control
            type="text"
            id="address"
            ref={startupRef}
            onBlur={validate}
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label htmlFor="password">Пароль</Form.Label>
          <Form.Control
            type="text"
            id="password"
            ref={passwordRef}
            onBlur={validate}
            required
          />
        </Form.Group>
        {error && <Alert className="mt-4" variant="danger">{error}</Alert>}
        <Button className="mt-3" variant="outline-dark" disabled={error} type="submit">
          {isLoading ? 'Загрузка...' : 'Задать пароль'}
        </Button>
      </Form>

    </Card>
  );
}
