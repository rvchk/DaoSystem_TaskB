import { createRoot } from "react-dom/client";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import DataProvider from "./utils/DataProvider.jsx";
import Requests from "./pages/Requests.jsx";
import ControlDepartment from "./pages/ControlDepartment.jsx";
import Login from "./pages/Login.jsx";
import DaoActivity from "./pages/DaoActivity.jsx";
import Profile from "./pages/Profile.jsx";

const routes = [
  { path: "/", component: App },
  { path: "/startup-profile", component: Profile },
  { path: "/create-requests", component: Requests },
  { path: "/control-department", component: ControlDepartment },
  { path: "/dao-activity", component: DaoActivity },
  { path: "/login", component: Login },
];

createRoot(document.getElementById("root")).render(
  <DataProvider>
    <BrowserRouter>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} Component={route.component} />
        ))}
      </Routes>
    </BrowserRouter>
  </DataProvider>,
);
