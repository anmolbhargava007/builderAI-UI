import React from 'react';
import OrigamisIcon from '../../assets/origamisicon.svg';
import OrigamisText from '../../assets/origamistext.svg';
import './Sidebar.scss';
import { GoSidebarCollapse, GoSidebarExpand } from 'react-icons/go';
import { NavLink } from 'react-router-dom';
import { IoMdFolderOpen, IoMdHome, IoMdDocument } from 'react-icons/io';
import { FcDepartment } from "react-icons/fc";
import { FaBell, FaUserGroup, FaVectorSquare } from 'react-icons/fa6';
import { RiCopperCoinLine } from 'react-icons/ri';
import { LuComponent } from "react-icons/lu";
import { HiOutlineDocumentReport } from "react-icons/hi";
import live from '../../assets/live.svg';
import { LiaQuestionCircleSolid } from 'react-icons/lia';
import {  PiPasswordFill } from 'react-icons/pi';
import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { MdOutlineLogout } from 'react-icons/md';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const getInitials = () => {
        const name = localStorage.getItem("name") || "";
        const words = name.trim().split(" ").filter(Boolean);

        if (words.length >= 2) {
            const firstInitial = words[0].charAt(0).toUpperCase();
            const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
            return firstInitial + lastInitial;
        } else if (words.length === 1) {
            const firstWord = words[0].toUpperCase();
            return firstWord.slice(0, 2);
        } else {
            return "";
        }
    };

    const logout = () => {
        // Clear authentication data
        localStorage.removeItem('token'); // or 'authUser', etc.
        localStorage.removeItem("lastRoute");
        localStorage.clear();

        // Redirect to login page or homepage
        navigate('/login');
    };
    const getName = () => {
        const name = localStorage.getItem("name");
        if (!name) {
            return;
        }
        if (name.includes(" ")) {
            let namearr = name.trim().split(" ")
            return namearr[0]
        }
        return name;
    }
    return (
        <div className={`sidebar ${isSidebarOpen ? 'expanded' : 'collapsed'}`} onMouseEnter={() => setIsSidebarOpen(true)} onMouseLeave={() => setIsSidebarOpen(false)}>
            <div className="toggle-icon" >
                {isSidebarOpen ? <GoSidebarExpand size={24} className='sidebar-icon' /> : <GoSidebarCollapse size={24} className='sidebar-icon' />}
            </div>
            <div className='d-flex gap-2 mb-3 mt-3'>
                <img src={OrigamisIcon} width={30} />
                {isSidebarOpen && <img src={OrigamisText} width={110} />}
            </div>
            <div>
                <NavLink to="/home" end className={e => `navbar-text ${e.isActive ? 'navbar-item-active' : ''}`} >
                    <IoMdHome size={20} style={{ marginTop: "-4px" }} />   {isSidebarOpen && <span>Home</span>}
                </NavLink>
                <NavLink to="/department" end className={e => `navbar-text ${e.isActive ? 'navbar-item-active' : ''}`} >
                    <FcDepartment size={20} style={{ marginTop: "-4px" }} />{isSidebarOpen && <span>Departments</span>}
                </NavLink>
                <NavLink to="/user" end className={e => `navbar-text ${e.isActive ? 'navbar-item-active' : ''}`} >
                    <FaUserGroup size={20} style={{ marginTop: "-4px" }} /> {isSidebarOpen && <span>Users</span>}
                </NavLink>
                <NavLink to="/home/workflow" end className={e => `navbar-text ${e.isActive ? 'navbar-item-active' : ''}`} >
                    <FaVectorSquare size={20} style={{ marginTop: "-4px" }} /> {isSidebarOpen && <span>Workflows</span>}
                </NavLink>
                <NavLink to="/credits" end className={e => `navbar-text ${e.isActive ? 'navbar-item-active' : ''}`} >
                    <RiCopperCoinLine size={20} style={{ marginTop: "-4px" }} /> {isSidebarOpen && <span>Credits</span>}
                </NavLink>
                <NavLink to="/home/knowledgebase" end className={e => `navbar-text ${e.isActive ? 'navbar-item-active' : ''}`} >
                    <IoMdFolderOpen size={20} style={{ marginTop: "-4px" }} /> {isSidebarOpen && <span>Knowledge Base</span>}
                </NavLink>
                <NavLink to="/home/aicompanymodelproviders" end className={e => `navbar-text ${e.isActive ? 'navbar-item-active' : ''}`} >
                    <IoMdDocument size={20} style={{ marginTop: "-4px" }} /> {isSidebarOpen && <span>Model Providers</span>}
                </NavLink>
                <NavLink to="/home/aicompanymodels" end className={e => `navbar-text ${e.isActive ? 'navbar-item-active' : ''}`} >
                    <LuComponent size={20} style={{ marginTop: "-4px" }} /> {isSidebarOpen && <span>Models</span>}
                </NavLink>
                <NavLink to="/report" end className={e => `navbar-text ${e.isActive ? 'navbar-item-active' : ''}`} >
                    <HiOutlineDocumentReport size={20} style={{ marginTop: "-4px" }} /> {isSidebarOpen && <span>Reports</span>}
                </NavLink>
            </div>
            <div className='d-flex flex-column gap-3 mt-4 mb-2' style={{ "color": "#07080A" }}>
                <div className='d-flex align-items-center gap-2'>
                    <img src={live} alt="live" width={20} />
                    {isSidebarOpen && <div className='d-flex align-items-center gap-2'>
                        <div className='bottom-text'>All Systems Live</div>
                    </div>}
                </div>
                <div className='d-flex align-items-center gap-2'>
                    <FaBell />
                    {isSidebarOpen &&
                        <div className='d-flex align-items-center gap-2'>
                            {isSidebarOpen && <div className='bottom-text'> 5 notifications</div>}
                        </div>}
                </div>
                <div className='d-flex align-items-center gap-2'>
                    <LiaQuestionCircleSolid />
                    {isSidebarOpen &&
                        <div className='d-flex align-items-center gap-2'>
                            {isSidebarOpen && <div className='bottom-text'>Help Center</div>}
                        </div>}
                </div>
            </div>
            <Box sx={{ flexGrow: 0 }}>
                <div className='d-flex gap-2'>
                    <IconButton className='user-logo' onClick={handleOpenUserMenu} >
                        <Box className="admin-image" >{getInitials()}</Box>
                    </IconButton>
                    {isSidebarOpen &&
                        <div style={{ "color": "#07080A" }}>
                            <span style={{ fontSize: '12px' }}>Hello,</span>
                            <h6 style={{ fontSize: '14px', fontWeight: "500" }}>{getName()}</h6>
                        </div>}
                </div>
                <Menu
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                >
                    <MenuItem onClick={handleCloseUserMenu}>
                        <Box display="flex" alignItems="center" px={0} >
                            <PiPasswordFill style={{ marginRight: "2vh" }} color="#525354" />
                            <Typography color="#525354">Change Password</Typography >
                        </Box>
                    </MenuItem>
                    <MenuItem onClick={logout}>
                        <Box display="flex" alignItems="center" px={0} >
                            <MdOutlineLogout style={{ marginRight: "2vh" }} color="#FF2A38" />
                            <Typography color="#FF2A38" >Logout</Typography >
                        </Box>
                    </MenuItem>
                </Menu>
            </Box>
        </div>
    );
};

export default Sidebar;
