import { createContext, useContext } from "react";

const DataContext = createContext();

export default function DataProvider({ children }) {
  return (
    <DataContext.Provider value={DataContext}>{children}</DataContext.Provider>
  );
}

/* eslint-disable-next-line react-refresh/only-export-components */
export const useData = () => useContext(DataContext);
