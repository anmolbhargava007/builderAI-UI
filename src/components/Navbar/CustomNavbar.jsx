import React, { useState, useRef, useEffect, useContext } from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import OrigamisAIlogo from '../../assets/OrigamisAIlogo.svg';
import { IoMdHome } from "react-icons/io";
import { FaBell, FaUser, FaVectorSquare } from "react-icons/fa6";
import { LiaQuestionCircleSolid } from "react-icons/lia";
import { GrTools, GrTransaction } from "react-icons/gr";
import './CustomNavbar.scss';
import { IconButton, Menu, MenuItem, Box, Typography } from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import { PiPasswordFill } from "react-icons/pi";
import { MdOutlineLogout } from "react-icons/md";
import { RiCopperCoinFill } from "react-icons/ri";
import { CentralizeContext } from '../../context/ContextProvider';
import goldcoin from "../../assets/goldcoin.svg"

const CustomNavbar = ({ signOutClickHandler }) => {
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const roles = (localStorage.getItem("role") || "[]").split(",").map((r)=>r.trim());
    const isUserOnly = roles.length === 1 && roles.includes("User")
    const { creditBalance } = useContext(CentralizeContext)
    const navigate = useNavigate()
    const [anchorElUser, setAnchorElUser] = useState(null);


    const handleLanguageChange = (event) => {
        setSelectedLanguage(event.target.value);
    };

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

    return (
        <Navbar bg="white" expand="lg" className=" px-3 navbar-container">
            <Container fluid>
                <div className="d-flex justify-content-between align-items-center w-100 ">
                    <Navbar.Brand href="#">
                        <img src={OrigamisAIlogo} alt="Origamis AI Logo" className="navbar-logo" />
                    </Navbar.Brand>
                    <Nav className="d-flex align-items-center gap-4 ">
                        
                        <NavLink to="/home" end className={e => `navbar-text ${e.isActive ? 'navbar-item-active' : ''}`} >
                            <IoMdHome size={20} style={{ marginTop: "-5px" }} /> <span>Home</span>
                        </NavLink>
                        {!isUserOnly &&(
                            <>
                        <NavLink to="/home/workflow" className={e => `navbar-text ${e.isActive ? 'navbar-item-active' : ''}`}>
                            <FaVectorSquare size={20} style={{ marginTop: "-5px" }} /> <span>Build Workflow</span>
                        </NavLink>
                        <NavLink to="/home/exploreTools" className={e => `navbar-text ${e.isActive ? 'navbar-item-active' : ''}`}>
                            <GrTools size={20} style={{ marginTop: "-5px" }} /><span> Explore Tools</span>
                        </NavLink>
                        <NavLink to="/home/uploadData" className={e => `navbar-text ${e.isActive ? 'navbar-item-active' : ''}`}>
                            <GrTools size={20} style={{ marginTop: "-5px" }} /><span>Upload Data</span>
                        </NavLink>
                        <NavLink to="/home/knowledgebase" className={e => `navbar-text ${e.isActive ? 'navbar-item-active' : ''}`}>
                            <GrTools size={20} style={{ marginTop: "-5px" }} /><span>Knowledge Base</span>
                        </NavLink>
                        </>)}
                    </Nav>
                    <div className="d-flex align-items-center gap-3">
                        <select
                            value={selectedLanguage}
                            onChange={handleLanguageChange}
                            className="form-select"
                            style={{ width: 'auto', cursor: 'pointer', border: 'none', boxShadow: 'none', fontSize: 'small' }}
                        >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                        </select>
                        <FaBell size={18} style={{ cursor: 'pointer' }} />
                        <LiaQuestionCircleSolid size={20} style={{ cursor: 'pointer' }} />
                        <div className="d-flex flex-column align-items-start">
                            {/* Prod Credit */}
                            <div className="d-flex align-items-center" title="Prod Credit Balance">
                                <div style={{ width: "30px", display: "flex", justifyContent: "center" }}>
                                    <img src={goldcoin} width={26} alt="goldcoin" />
                                </div>
                                <h6 className="mb-0 fw-bold ms-2 text-break">
                                    {Number(creditBalance).toFixed(2)}
                                </h6>
                            </div>

                            
                        </div>
                        <Box sx={{ flexGrow: 0 }}>
                            <IconButton  >
                                <Box className="admin-image" onClick={handleOpenUserMenu}>{getInitials()}</Box>
                            </IconButton>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
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
                                  {!isUserOnly &&(
                                    <>
                                <NavLink to="/home/transaction" style={{ textDecoration: "none" }}>
                                    <MenuItem onClick={handleCloseUserMenu}>
                                        <Box display="flex" alignItems="center" px={0} >
                                            <GrTransaction style={{ marginRight: "2vh" }} color="#525354" />
                                            <Typography color="#525354">Transaction</Typography >
                                        </Box>
                                    </MenuItem>
                                </NavLink>
                                <NavLink to="/home/user" style={{ textDecoration: "none" }}>
                                    <MenuItem onClick={handleCloseUserMenu}>
                                        <Box display="flex" alignItems="center" px={0} >
                                            <FaUser style={{ marginRight: "2vh" }} color="#525354" />
                                            <Typography color="#525354">User</Typography >
                                        </Box>
                                    </MenuItem>
                                </NavLink>
                                </>)}
                                <MenuItem onClick={logout}>
                                    <Box display="flex" alignItems="center" px={0} >
                                        <MdOutlineLogout style={{ marginRight: "2vh" }} color="#FF2A38" />
                                        <Typography color="#FF2A38" >Logout</Typography >
                                    </Box>
                                </MenuItem>
                            </Menu>
                        </Box>
                    </div>
                </div>
            </Container>
        </Navbar>
    );
};

export default CustomNavbar;
