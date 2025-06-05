import { useState, useEffect, useRef } from "react"
import { useData } from "./Data"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Auth() {
    const loginRef = useRef()
    const passwordRef = useRef()
    const keyRef = useRef()
    const { setLogin, setRole } = useData()
    const navigate = useNavigate()

    const handleSubmit = async () => {
        if (!loginRef.current.value || !passwordRef.current.value || !keyRef.current.value) {
            alert("Заполните все поля")
        }
        else {
            try {
                const hashResponse = await fetch(`http://localhost:3000/hash/${keyRef.current.value}`)
                const hashData = await hashResponse.json()

                const passwordResponse = await fetch(`http://localhost:3000/hash/${passwordRef.current.value}`)
                const hashPassword = await passwordResponse.json()

                const response = await fetch("http://localhost:3000/auth", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        login: loginRef.current.value,
                        password: hashPassword.hash,
                        key: hashData.hash,
                    }),
                })
                const data = await response.json()
                const user = JSON.parse(data.user)
                console.log(user)
                setLogin(user.Login)
                setRole(user.Role)
                navigate("/")
                alert("Вы вошли в аккаунт")

                loginRef.current.value = ""
                passwordRef.current.value = ""
                keyRef.current.value = ""

            } catch (err) {
                if (err.response) {
                    alert("Неправильный логин, пароль или ключ")
                }
            }
        }
    }
    return (
        <>
            <input type="text" placeholder="Введите Логин" ref={loginRef} />
            <input type="text" placeholder="Введите Пароль" ref={passwordRef} />
            <input type="text" placeholder="Введите Ключ" ref={keyRef} />
            <button onClick={handleSubmit}>Войти</button>
        </>
    )
}

export default Auth