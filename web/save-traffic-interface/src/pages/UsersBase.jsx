import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useData } from "../components/Data"
import UserBlock from "../components/UserBlock"

function UserBase() {

    const [allUsers, setAllUsers] = useState()
    const licenseLoginRef = useRef()
    const licenseIndexRef = useRef()
    const { role, login } = useData()
    const navigate = useNavigate()

    useEffect(() => {
        if (role !== "DpsOfficer") {
            alert("У вас нету прав ДПСника")
            navigate("/")
        }
        else getUsers()
    }, [])

    const getUsers = async () => {
        const result = await fetch("http://localhost:3000/getAllUsers")
        const jsonAllUsers = await result.json()
        setAllUsers(jsonAllUsers.users)
        console.log(jsonAllUsers)
    }

    const approveLicense = async () => {
        await fetch("http://localhost:3000/approveLicense", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                dpsLogin: login,
                recipientLogin: licenseLoginRef.current.value,
                requestIndex: licenseIndexRef.current.value
            })
        })

        alert("Запрос подтвержден")

        licenseIndexRef.current.value = ""
        licenseLoginRef.current.value = ""
    }

    return (
        <>
            <h1>База пользователей</h1>
            <h2>Подтвердить лицензию</h2>
            <input type="text" placeholder="Логин запрашивающего" ref={licenseLoginRef} />
            <input type="text" placeholder="Индекс запроса" ref={licenseIndexRef} />
            <button onClick={approveLicense}>Подтвердить</button>
            <div>
                {allUsers?.map((user, index) => (
                    <UserBlock key={index} user={user} />
                ))}
            </div>
        </>
    )
}

export default UserBase