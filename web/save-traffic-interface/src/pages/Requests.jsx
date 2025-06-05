import { useEffect, useRef, useState } from "react"
import { useData } from "../components/Data"

function Requests() {
  const selectRef = useRef()
  const [licenses, setLicenses] = useState()
  const { login } = useData()

  useEffect(() => {
    getAllLicenses()
  }, [])

  const requestLicense = async () => {
    await fetch("http://localhost:3000/requestLicense", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        login: login,
        licenseNumber: selectRef.current.value
      })
    })
    alert("Запрос отправлен, можете увидеть его в своем профиле")
    selectRef.current.value = ""
  }

  const getAllLicenses = async () => {
    const result = await fetch("http://localhost:3000/getAllLicenses")
    const jsonLicenses = await result.json()
    setLicenses(jsonLicenses)
  }

  return (
    <>
      <h1>Запросы</h1>
      <h2>Водительские удостоверения:</h2>
      <div>{licenses?.map((license, index) => (
        <div key={index} className="licensesBlock">
          <span>Номер: {license.number}</span>
          <span>Категория: {license.category}</span>
          <span>Дата окончания: {new Date(license.usabilityDate).toISOString().split("T")[0]}</span>
        </div>
      ))}</div>

      <h2>Запросить лицензию</h2>
      <select ref={selectRef} name="" id="">
        <option value="">Выберите Лицензию</option>
        <option value="000">000</option>
        <option value="111">111</option>
        <option value="222">222</option>
        <option value="333">333</option>
        <option value="444">444</option>
        <option value="555">555</option>
        <option value="666">666</option>
      </select>
      <button onClick={requestLicense}>Запросить</button>
    </>

  )
}

export default Requests