import { useData } from "../utils/DataProvider";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import FetchAccounts from "../components/FetchAccounts";
import { getDepartments } from "../utils/helpers";
import CreateRequestForm from "../components/forms/CreateRequestForm";

function CreateRequestPage() {
  const { startup } = useData();
  const departments = getDepartments();

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Header>
              <h3 className="mb-0">Создание требования на реализацию</h3>
            </Card.Header>
            <Card.Body>
              <CreateRequestForm startup={startup} />
            </Card.Body>
          </Card>

          {/* Информация о бюджетах */}
          <Card className="mt-4">
            <Card.Header>
              <h5 className="mb-0">Бюджеты департаментов</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {departments.map((dept) => (
                  <Col key={dept.value} md={6} className="mb-2">
                    <strong>{dept.label}:</strong> {dept.budget} USD
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <FetchAccounts />
    </Container>
  );
}

export default CreateRequestPage;
