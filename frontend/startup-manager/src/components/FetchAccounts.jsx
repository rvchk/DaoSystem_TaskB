import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";

export default function FetchAccounts() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("currentStartup")) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts) => {
          localStorage.setItem("currentStartup", accounts[0]);
          location.reload();
        });
    }
  }, []);

  useEffect(() => {
    window.ethereum.on("accountsChanged", (accounts) => {
      localStorage.setItem("currentStartup", accounts[0]);
      location.reload();
    });
  }, []);

  const navigateToMain = () => {
    navigate("/");
  };

  return (
    <Button
      variant="outline-secondary"
      onClick={navigateToMain}
      className="fetchAccountsBar"
    >
      Ровчак Матвей Сергеевич
    </Button>
  );
}
