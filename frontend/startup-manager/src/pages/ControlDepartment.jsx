import { useState } from "react";
import { useData } from "../utils/DataProvider";
import LoginModal from "../components/loginModal";
import Alert from "react-bootstrap/Alert";
import Request from "../components/Request";
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card'
import Button from "react-bootstrap/esm/Button";
import { transferFromManagement } from "../utils/api/requests";

function ManagementDepartment() {
  const { startup } = useData();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [formData, setFormData] = useState({
    department: '',
    percentage: '',
  });

  const departments = [
    { value: 'management', label: 'Менеджмент', budget: startup?.departments?.management || 0 },
    { value: 'marketing', label: 'Маркетинг', budget: startup?.departments?.marketing || 0 },
    { value: 'development', label: 'Разработка', budget: startup?.departments?.development || 0 },
    { value: 'legal', label: 'Юридический', budget: startup?.departments?.legal || 0 }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const transferToDepartment = async () => {
    await transferFromManagement(startup.address, formData.department, formData.percentage)
    location.reload()
  }

  const isFormValid = formData.department && formData.percentage;

  if (!isLoggedIn) {
    return (
      <div className="text-center py-5">
        <h2>Отдел управления</h2>
        <p className="text-muted mb-4">
          Для доступа к управлению запросами требуется авторизация
        </p>
        <LoginModal onLoginSuccess={() => setIsLoggedIn(true)} />
      </div>
    );
  } else
    return (
      <div>
        <div className="text-center py-5">
          <h2>Отдел управления - Запросы</h2>
        </div>

        {startup?.requests && startup.requests.length > 0 ? (
          <div className="row g-3">
            {startup.requests.map((request) => (
              <Request request={request} key={request.id}/>
            ))}
          </div>
        ) : (
          <Alert variant="info">Нет активных запросов</Alert>
        )}
        <h2 className="mt-5">Выдача средств отделу</h2>
        <Card className="">
          <Form.Group className="mb-3">
            <Form.Label>Департамент *</Form.Label>
            <Form.Select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
            >
              <option value="">Выберите департамент</option>
              {departments.map(dept => (
                <option key={dept.value} value={dept.value}>
                  {dept.label} (Бюджет: {dept.budget} USD)
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Процент от бюджета *</Form.Label>
            <Form.Control
              type="number"
              name="percentage"
              value={formData.percentage}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.1"
              placeholder="Введите процент (0-100)"
              required
            />
            <Form.Text className="text-muted">
              Введите процент от бюджета департамента
            </Form.Text>
          </Form.Group>
            <Button
              onClick={transferToDepartment}
              variant="primary"
              type="submit"
              disabled={!isFormValid}
              >
              Выдать
            </Button>
        </Card>
      </div>
    );
}

export default ManagementDepartment;
