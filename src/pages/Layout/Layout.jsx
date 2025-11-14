import React, { useState } from 'react'
import { Outlet} from 'react-router-dom'
import CustomNavbar from '../../components/Navbar/CustomNavbar';
import RouteTracker from '../../utils/RoutesTracker';
import Sidebar from '../../components/Sidebar/Sidebar';

const Layout = ({signOutClickHandler}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
 
  return (
    <>
    <CustomNavbar signOutClickHandler={signOutClickHandler}/>
    <div className="d-flex">
      {        
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        /> 
      }
      <div className="flex-grow-1">
         
        <RouteTracker />
        <Outlet />
      </div>
    </div>
    </>
  )
}

export default Layout;