import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { useData } from "../../utils/DataProvider";

function LoginModal({ onLoginSuccess }) {
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { startup } = useData();

  const handleClose = () => {
    setShow(false);
    setPassword("");
    setError("");
  };

  const handleShow = () => setShow(true);

  const handleSubmit = () => {
    if (password === startup?.password) {
      onLoginSuccess();
      handleClose();
    } else {
      setError("Неверный пароль");
    }
  };

  return (
    <>
      <Button variant="dark" onClick={handleShow}>
        Войти в отдел
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Вход в отдел управления</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="managementPassword">
              <Form.Label>Пароль управления</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                isInvalid={!!error}
              />
              <Form.Control.Feedback type="invalid">
                {error}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Закрыть
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Войти
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default LoginModal;
