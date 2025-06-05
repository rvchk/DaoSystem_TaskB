import { Route, Routes, BrowserRouter } from "react-router-dom"
import { createRoot } from 'react-dom/client'
import DataProvider from './components/Data.jsx'
import LoginPage from "./pages/LoginPage.jsx"
import Requests from "./pages/Requests.jsx"
import Profile from "./pages/Profile.jsx"
import App from './pages/App.jsx'
import UsersBase from "./pages/UsersBase.jsx"
import './App.css'

createRoot(document.getElementById('root')).render(
  <DataProvider>
    <BrowserRouter>
      <Routes>
        <Route path="*" Component={App} />
        <Route path="/" Component={App} />
        <Route path="/loginPage" Component={LoginPage} />
        <Route path="/profile" Component={Profile} />
        <Route path="/usersBase" Component={UsersBase} />
        <Route path="/requests" Component={Requests} />
      </Routes>
    </BrowserRouter>
  </DataProvider>
)
