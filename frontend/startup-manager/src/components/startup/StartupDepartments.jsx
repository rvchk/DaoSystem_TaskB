export default function StartupDepartments({ startup }) {
  const departments = [
    { key: "management", label: "Менеджмент" },
    { key: "development", label: "Разработка" },
    { key: "marketing", label: "Маркетинг" },
    { key: "legal", label: "Юридический" },
  ];

  const getBudget = (deptKey) => {
    return startup?.departments?.[deptKey] || 0;
  };

  return (
    <div className="profile-section">
      <h2>Бюджет по отделам</h2>
      {departments.map((dept) => (
        <div key={dept.key} className="department-item">
          <span className="dept-label">{dept.label}: </span>
          <span className="dept-amount">{getBudget(dept.key)} USD</span>
        </div>
      ))}
    </div>
  );
}
