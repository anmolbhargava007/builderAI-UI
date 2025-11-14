import { useEffect, createContext, useState } from 'react';
import userService from '../services/userService';
export const CentralizeContext = createContext();

export const CentralizeContextProvider = ({ children }) => {
  const [creditBalance, setCreditBalance] = useState(0);

  useEffect(() => {
    get_All_Users()
  }, [])
  const get_All_Users = async () => {
    try {
      const res = await userService.get_All_Users(localStorage.getItem("comp_id"))
      let user = res.data.users.filter((user) => (user.email) === localStorage.getItem("email"))
      setCreditBalance(user[0]?.credits)
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <>
      <CentralizeContext.Provider value={{
        creditBalance,
        setCreditBalance
      }}>
        {children}
      </CentralizeContext.Provider>

    </>
  );
};
