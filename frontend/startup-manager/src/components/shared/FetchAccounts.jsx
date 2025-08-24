import { useEffect } from "react";
import { Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

export default function FetchAccounts() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("selectedAcc")) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts) => {
          localStorage.setItem("selectedAcc", accounts[0]);
          location.reload();
        });
    }
  }, []);

  useEffect(() => {
    window.ethereum.on("accountsChanged", (accounts) => {
      localStorage.setItem("selectedAcc", accounts[0]);
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
