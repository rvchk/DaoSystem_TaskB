import { useEffect, useState } from 'react'
import Auth from '../components/Auth'
import Registration from '../components/Registration'
import '../App.css'

function App() {

  return (
    <>
      <h1>Авторизация</h1>
      <Auth />
      <h1>Регистрация</h1>
      <Registration />
      <h3>Ровчак Матвей Сергеевич | Профессионалы 2025</h3>
    </>
  )
}

export default App