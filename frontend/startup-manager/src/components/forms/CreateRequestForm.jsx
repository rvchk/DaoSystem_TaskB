import { useState } from "react";
import { getDepartments } from "../../utils/helpers";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { sendRealisationRequest } from "../../utils/api/requests";

export default function CreateRequestForm({ startup }) {
  const [formData, setFormData] = useState({
    department: "",
    purpose: "",
    percentage: "",
    fromStartBalance: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const departments = getDepartments(startup);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!startup?.address) {
        throw new Error("Адрес стартапа не найден");
      }

      await sendRealisationRequest(
        startup.address,
        formData.department,
        formData.purpose,
        formData.percentage.toString(),
        formData.fromStartBalance,
      );

      setSuccess("Запрос успешно отправлен!");
      setFormData({
        department: "",
        purpose: "",
        percentage: "",
        fromStartBalance: false,
      });
    } catch (err) {
      setError(err.message || "Ошибка при отправке запроса");
    } finally {
      setLoading(false);
    }
  };

  const calculateAmount = () => {
    if (!formData.department || !formData.percentage) return 0;

    const selectedDept = departments.find(
      (dept) => dept.value === formData.department,
    );
    if (!selectedDept) return 0;

    const percentage = parseFloat(formData.percentage);
    if (isNaN(percentage)) return 0;

    return ((selectedDept.budget * percentage) / 100).toFixed(2);
  };

  const isFormValid =
    formData.department && formData.purpose && formData.percentage;

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Выбор департамента */}
      <Form.Group className="mb-3">
        <Form.Label>Департамент *</Form.Label>
        <Form.Select
          name="department"
          value={formData.department}
          onChange={handleInputChange}
          required
        >
          <option value="">Выберите департамент</option>
          {departments.map((dept) => (
            <option key={dept.value} value={dept.value}>
              {dept.label} (Бюджет: {dept.budget} USD)
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {/* Причина/цель */}
      <Form.Group className="mb-3">
        <Form.Label>Причина/цель использования средств</Form.Label>
        <Form.Select
          name="purpose"
          value={formData.purpose}
          onChange={handleInputChange}
          required
        >
          <option value="" hidden>
            Выберите цель
          </option>
          <option value="realise">Реализация</option>
          <option value="getFinance">Дофинансирование</option>
        </Form.Select>
      </Form.Group>

      {/* Процент от бюджета */}
      <Form.Group className="mb-3">
        <Form.Label>Процент от бюджета</Form.Label>
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

      {/* Расчет суммы */}
      {formData.department && formData.percentage && (
        <Alert variant="info" className="mb-3">
          <strong>Расчетная сумма:</strong> {calculateAmount()} USD
          <br />
          <small>
            ({formData.percentage}% от{" "}
            {departments.find((d) => d.value === formData.department)?.budget}{" "}
            USD)
          </small>
        </Alert>
      )}

      {/* Чекбокс для fromStartBalance */}
      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          name="fromStartBalance"
          label="Списать со стартового баланса"
          checked={formData.fromStartBalance}
          onChange={handleInputChange}
        />
        <Form.Text className="text-muted">
          Если отмечено, средства будут списаны со стартового баланса вместо
          департаментского бюджета
        </Form.Text>
      </Form.Group>

      <Button
        variant="primary"
        type="submit"
        disabled={!isFormValid || loading}
        className="w-100"
      >
        {loading ? "Отправка..." : "Отправить запрос"}
      </Button>
    </Form>
  );
}
