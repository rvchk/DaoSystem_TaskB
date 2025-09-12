import FetchAccounts from "../components/FetchAccounts";
import StartupDepartments from "../components/startup/StartupDepartments";
import StartupInfo from "../components/startup/StartupInfo";
import { useData } from "../utils/DataProvider";

export default function Profile() {
  let { startup } = useData();

  return (
    <>
      <h1>Профиль</h1>
      <div className="mt-4">
        <h2>Основная информация</h2>
        <StartupInfo startup={startup} />
        <StartupDepartments startup={startup} />
      </div>
      <FetchAccounts />
    </>
  );
}
