export default function StartupRequests({ startup }) {
  return (
    <div>
      {startup?.requests && startup.requests.length > 0 ? (
        <div className="row g-3">
          {startup.requests.map((request) => (
            <Request request={request} key={request.id} />
          ))}
        </div>
      ) : (
        <Alert variant="info">Нет активных запросов</Alert>
      )}
    </div>
  );
}
