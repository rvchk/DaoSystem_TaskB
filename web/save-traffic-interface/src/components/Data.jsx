import { createContext, useContext, useEffect, useState } from "react";
const DataContext = createContext()

function DataProvider({ children }) {
    const [role, setRole] = useState(() => 
        localStorage.getItem("role") || null
    );
    const [login, setLogin] = useState(() => 
        localStorage.getItem("login") || null
    );

    useEffect(()=> {
        localStorage.setItem("login", login)
        localStorage.setItem("role", role)
    }, [login, role])

    return(
        <DataContext.Provider value={{
            login,
            setLogin,
            role,
            setRole
        }}>
        {children}
        </DataContext.Provider>
    )
}
export default DataProvider
export const useData = () => useContext(DataContext)