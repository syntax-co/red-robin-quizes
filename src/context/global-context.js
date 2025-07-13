import { createContext, useContext, useState } from 'react';
import menuData from '@/json_files/menu-items.json';
// ----------------------------------
// Create the context
const GlobalContext = createContext();
// Custom hook for consuming the context
export const useGlobalContext = () => useContext(GlobalContext);
// ----------------------------------

const difficulties = {
    easy:   { hintsAllowed: 3, prefillCount: 2, scoreValue: 10 },
    medium: { hintsAllowed: 2, prefillCount: 1, scoreValue: 20 },
    hard:   { hintsAllowed: 1, prefillCount: 0, scoreValue: 30 },
  };
  
  // Anything in this list will be SHOWN automatically and never counted
  const proteins = [
    'Beef Patty', 'Crispy Chicken Breast', 'Grilled Chicken Breast',
    'Impossible Patty', 'Turkey Patty', 'Veggie Patty', 'Chicken Tenders',
    'Turkey', // for BLTA
  ];


// Context provider
export const GlobalProvider = ({ children }) => {
  // Define your global state variables
  const [theme, setTheme] = useState('dark');
  const [isLoading, setIsLoading] = useState(false);
  // Add more state variables as needed



  return (
    <GlobalContext.Provider
      value={{
        menuData,
        difficulties,proteins,
        isLoading,setIsLoading,
        
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
