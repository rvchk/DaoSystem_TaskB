import { createContext, useContext, useState } from "react";
import { getStartup } from "./api/requests";
import { useEffect } from "react";

const DataContext = createContext();

export default function DataProvider({ children }) {
  const [startup, setStartup] = useState("");
  const startupAddress = localStorage.getItem("currentStartup");

  async function fetchStartup() {
    const result = await getStartup(startupAddress);
    setStartup(result);
  }

  useEffect(() => {
    fetchStartup();
  }, [startupAddress]);

  return (
    <DataContext.Provider value={{ startup, fetchStartup }}>
      {children}
    </DataContext.Provider>
  );
}

/* eslint-disable-next-line react-refresh/only-export-components */
export const useData = () => useContext(DataContext);
