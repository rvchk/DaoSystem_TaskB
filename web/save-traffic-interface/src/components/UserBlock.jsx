function UserBlock({ user }) {
  return (
    <div className="userBlock">
      <h2>Логин: {user?.Login}</h2>
      <h2>ФИО: {user?.Fio}</h2>
      <h2>Роль: {user?.Role}</h2>
      <h2>Стаж вождения: {user?.YearStartDriving}</h2>
      <h2>Баланс: {user?.Balance}</h2>
      <h2>Неоплаченных штрафов: {user?.TotalUnpayedFines}</h2>
      <h2>Автомобили: {user?.Vehicles}</h2>
      <h2>Запросы: {user?.Requests.map((request, index) => (
        <ul key={index}>
          <li>Категория: {request.Category}</li>
          <li>Номер Лицензии: {request.LicenseNumber}</li>
          <li>Номер запроса: {request.RequestIndex}</li>
          <li>Статуc запроса: {request.RequestStatus}</li>
        </ul>
      ))}</h2>
      <h2>Лицензии: {user?.Licenses.map((license, index) => (
        <ul key={index}>
          <li>Категория: {license.Category}</li>
          <li>Неоплаченных штрафов {license.UnpaidFines}</li>
          <li>Номер: {license.LicenseNumber}</li>
          <li>Дата окончания: {new Date(license.Expiration).toISOString().split('T')[0]}</li>
        </ul>
      ))}</h2>
    </div>
  )
}

export default UserBlock