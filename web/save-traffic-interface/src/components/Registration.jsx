import { useRef } from "react"
import { getRandomKey } from "../utils"

function Registration() {
    const loginRef = useRef()
    const passwordRef = useRef()
    const fioRef = useRef()
    const roleRef = useRef()
    const drivingTimeRef = useRef()
    const balanceRef = useRef()

    const handleRegistration = async () => {
        try {
            const secretKey = getRandomKey().toString()
            alert(`Ваш ключ: ${secretKey}`)

            const keyResponse = await fetch(`http://localhost:3000/hash/${secretKey}`)
            const keyHash = await keyResponse.json()

            const passwordResponse = await fetch(`http://localhost:3000/hash/${passwordRef.current.value}`)
            const passwordHash = await passwordResponse.json()

            await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    login: loginRef.current.value,
                    password: passwordHash.hash,
                    key: keyHash.hash,
                    balance: balanceRef.current.value,
                    role: roleRef.current.value,
                    fio: fioRef.current.value,
                    drivingTime: drivingTimeRef.current.value
                }),
            })
            loginRef.current.value = ""
            passwordRef.current.value = ""
            balanceRef.current.value = ""
            roleRef.current.value = ""
            fioRef.current.value = ""
            drivingTimeRef.current.value = ""
            alert("Вы успешно зарегистрировались")
        } catch (err) {
            console.log(err)
        }
    }
    return (
        <div>
            <input type="text" placeholder="Введите логин" ref={loginRef} />
            <input type="text" placeholder="Введите пароль" ref={passwordRef} />
            <input type="text" placeholder="Введите ФИО" ref={fioRef} />
            <select ref={roleRef} name="" id="">
                <option value="">Выберите роль</option>
                <option value="Driver">Водитель</option>
                <option value="DpsOfficer">ДПС</option>
            </select>
            <input type="text" placeholder="Введите стаж вождения" ref={drivingTimeRef} />
            <input type="text" placeholder="Введите баланс" ref={balanceRef} />
            <button onClick={handleRegistration}>Зарегистрироваться</button>
        </div>
    )
}

export default Registration