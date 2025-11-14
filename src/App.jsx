// import { BrowserRouter as Router } from 'react-router-dom'
// import Signup from './Pages/Signup/Signup'
 import Login from './pages/Login/Login';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
// import Welcomepage from './welcome/Welcomepage';
import './App.css'
import { ToastProvider } from './context/ToastContext';
import AllRoutes from '../AllRoutes';
function App() {
  return (
    <>
    <ToastProvider>

            {/* <Welcomepage /> */}
            {/* <Navbar/> */}
           <AllRoutes/>
    </ToastProvider>

    </>
  )
}

export default App ;