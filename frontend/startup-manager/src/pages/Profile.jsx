import FetchAccounts from "../components/shared/FetchAccounts";
import { useData } from "../utils/DataProvider";

export default function Profile() {
  const {startup} = useData()
  console.log(startup)

  return (
    <>
      <h1>Профиль</h1>

      <div className="profile-card">
        <div className="profile-section">
          <h2>Основная информация</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Адрес:</span>
              <span className="value">{startup.address}</span>
            </div>
            <div className="info-item">
              <span className="label">Организация:</span>
              <span className="value">{startup.organization}</span>
            </div>
            <div className="info-item">
              <span className="label">Общее финансирование:</span>
              <span className="value">{startup.totalFunding} USD</span>
            </div>
            <div className="info-item">
              <span className="label">Финансирование получено:</span>
              <span className="value">
                {startup.fundingReceived ? '✅ Да' : '❌ Нет'}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Менеджмент вошел:</span>
              <span className="value">
                {startup.managementLoggedIn ? '✅ Да' : '❌ Нет'}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Бюджет по отделам</h2>
          <div className="departments-grid">
            <div className="department-item">
              <span className="dept-label">Разработка:</span>
              <span className="dept-amount">{startup.departments?.development || 0} USD</span>
            </div>
            <div className="department-item">
              <span className="dept-label">Менеджмент:</span>
              <span className="dept-amount">{startup.departments?.management || 0} USD</span>
            </div>
            <div className="department-item">
              <span className="dept-label">Маркетинг:</span>
              <span className="dept-amount">{startup.departments?.marketing || 0} USD</span>
            </div>
            <div className="department-item">
              <span className="dept-label">Юридический:</span>
              <span className="dept-amount">{startup.departments?.legal || 0} USD</span>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Запросы</h2>
          <div className="requests-info">
            {startup.requests && startup.requests.length > 0 ? (
              <span>Активных запросов: {startup.requests.length}</span>
            ) : (
              <span>Нет активных запросов</span>
            )}
          </div>
        </div>
      </div>

      <FetchAccounts />
    </>
  );
}
