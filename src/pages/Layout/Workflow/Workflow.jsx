import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import { FaPlus } from "react-icons/fa6";
import { PiShareNetwork } from "react-icons/pi";
import { RiOpenaiFill } from "react-icons/ri";
import { HiDotsVertical } from "react-icons/hi";
import WorkFlowModal from '../../../Modal/WorkFlowModal/WorkFlowModal';
import icon from '../../../assets/icon.svg';
import './Workflow.scss';
import WorkFlowCanvas from './WorkFlowCanvas/WorkFlowCanvas';
import workflowservice from '../../../services/workflowservice';
import MessageLoader from '../../../Modal/MessageLoader/MessageLoader';
import { BeatLoader } from 'react-spinners';
import { Dropdown } from 'react-bootstrap';
import { BiSolidEditAlt } from "react-icons/bi";
import { AiFillDelete } from "react-icons/ai";
import { IoDuplicate } from "react-icons/io5";
import { IconButton, Menu, MenuItem, Box, Typography} from '@mui/material';


const Workflow = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [workflows, setWorkflows] = useState([]);
    const [page, setPage] = useState('list');
    const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [loader, setLoader] = useState(false)
    const [workflowData, setWorkflowData] = useState('')
    const [messageHeader, setMessageHeader] = useState('')

    useEffect(() => {
        getAllworkflow();
    }, [])

    const getAllworkflow = async () => {
        setLoader(true)
        setMessageHeader("Loading workflow Data")
        const compid = localStorage.getItem('comp_id')

        try {
            const res = await workflowservice.getAllWorkflow(compid)
            setWorkflows(res.data.workflows)

        }
        catch (e) {
            console.log(e)
        }
        finally {
            setLoader(false)
        }
    }

    const handleAddWorkflow = (newWorkflow) => {
        const randomTempId = Math.floor(100000 + Math.random() * 900000).toString();

        const enrichedWorkflow = {
            ...newWorkflow,
            envstatus: "",
            tempid: randomTempId,
            workflowid:"",
            latestversiondata: {
                id:"1",
                versionnumber:1
            },
            versions: [{
                id:"1",
                versionnumber:1
            }]

        };
        setWorkflowData(enrichedWorkflow);

        setPage('canvas');
        setModalOpen(false);
    };


    const handleToggle = (index) => {
        setOpenDropdownIndex(prev => (prev === index ? null : index));
    };

    const handleView = (item, workflow) => {
        setPage(item);
        if (item == 'canvas'){
            const enrichedWorkflow={
                tempid:workflow.workflowid,
                workflowid:workflow.workflowid,
                name:workflow.name,
                description:workflow.description,
                versions:workflow.versions,
                latestversiondata:workflow.latestversiondata,
                envstatus:workflow.envstatus,
            }
            setWorkflowData(enrichedWorkflow);
        }
    };
    return (
        <>
            {page === 'list' && (<Container fluid className="py-3 px-4">
                <div className="workflow-grid">
                    <Card className="custom-card text-center h-100">
                        <Card.Body className='card-component'>
                            <div className="first-card-content card-row mb-2" onClick={() => setModalOpen(true)}>
                                <FaPlus />
                                <h6 className="ms-2 d-inline">Create New Workflow</h6>
                            </div>
                            <div className="first-card-content-disabled card-row mb-2">
                                <PiShareNetwork />
                                <h6 className="ms-2 d-inline">Create from Template</h6>
                            </div>
                            <div className="first-card-content-disabled card-row">
                                <RiOpenaiFill />
                                <h6 className="ms-2 d-inline">Create using AI</h6>
                            </div>
                        </Card.Body>
                    </Card>

                    {workflows.map((workflow, index) => (
                        <WorkflowCard
                            key={index}
                            workflow={workflow}
                            handleView={handleView}
                            index={index} // ✅ Pass index
                            openDropdownIndex={openDropdownIndex} // ✅ Pass state
                            handleToggle={handleToggle}
                        />
                    ))}
                </div>
            </Container>)}
            <WorkFlowModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAddWorkflow} />
            {page === 'canvas' && <WorkFlowCanvas handleView={handleView} workflowData={workflowData} setWorkflowData={setWorkflowData} setWorkflows={setWorkflows} workflows={workflows} getAllworkflow={getAllworkflow}/>}
            <MessageLoader
                isOpen={loader}
                icon={<BeatLoader color="#FF0087" />}
                headerMessage={messageHeader}
            />
        </>
    );
};

const WorkflowCard = ({ workflow, handleView, index, openDropdownIndex, handleToggle }) => {
    const [iconPath, setIconPath] = useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const nameRef = useRef(null);
    const descRef = useRef(null);
    const [showNameTooltip, setShowNameTooltip] = useState(false);
    const [showDescTooltip, setShowDescTooltip] = useState(false);


    useEffect(() => {
        let isMounted = true;
        const loadIcon = async () => {
            try {
                const icon = await import(`../../../assets/${workflow.icon}`);
                if (isMounted) setIconPath(icon.default);
            } catch (error) {
                const defaultIcon = await import('../../../assets/icon.svg');
                if (isMounted) setIconPath(defaultIcon.default);
            }
        };
        loadIcon();
        return () => { isMounted = false; };
    }, [workflow.icon]);

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    // Check ellipsis for workflow name
    useEffect(() => {
        const el = nameRef.current;
        if (!el) return;
        const checkEllipsis = () => {
            const isEllipsed = el.scrollWidth > el.clientWidth + 1; // Horizontal overflow
            setShowNameTooltip(isEllipsed);
        };
        checkEllipsis();

        const resizeObserver = new ResizeObserver(checkEllipsis);
        resizeObserver.observe(el);
        return () => resizeObserver.disconnect();
    }, [workflow.name]);

    // Check ellipsis for workflow description
    useEffect(() => {
        const el = descRef.current;
        if (!el) return;
        const checkEllipsis = () => {
            const isEllipsed = el.scrollHeight > el.clientHeight + 1; // Vertical overflow
            setShowDescTooltip(isEllipsed);
        };
        checkEllipsis();

        const resizeObserver = new ResizeObserver(checkEllipsis);
        resizeObserver.observe(el);
        return () => resizeObserver.disconnect();
    }, [workflow.description]);

    return (
        <Card className="workflow-card h-100" onClick={() => handleView('canvas', workflow)}>
            <Card.Body style={{ paddingBottom: "0px" }}>
                <div className="card-heading mb-2 d-flex justify-content-between align-items-center">
                    <div className='d-flex align-items-center gap-2'>
                        <img src={iconPath} alt="icon" style={{ width: 34 }} />
                        <span ref={nameRef} className="workflow-name" title={showNameTooltip ? workflow.workflowName : ''}>
                            {workflow.name}
                        </span>
                    </div>
                    <Box sx={{ flexGrow: 0 }} onClick={(e) => { e.stopPropagation() }}>
                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                            <Box><HiDotsVertical size={20} color='rgba(255, 0, 135, 1)' /></Box>
                        </IconButton>
                        <Menu
                            className='dropdown-Menu'
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            <MenuItem onClick={handleCloseUserMenu}>
                                <Box display="flex" alignItems="center" px={0} >
                                    <BiSolidEditAlt style={{ marginRight: "2vh" }} color="#000" />
                                    <Typography color="#000" className="dropdown-Menu-items">Edit</Typography >
                                </Box>
                            </MenuItem>
                            <MenuItem onClick={handleCloseUserMenu}>
                                <Box display="flex" alignItems="center" px={0} >
                                    <IoDuplicate style={{ marginRight: "2vh" }} color="#000" />
                                    <Typography className="dropdown-Menu-items">Duplicate</Typography >
                                </Box>
                            </MenuItem>
                            <MenuItem onClick={handleCloseUserMenu}>
                                <Box display="flex" alignItems="center" px={0} >
                                    <AiFillDelete style={{ marginRight: "2vh" }} color="#FF2A38" />
                                    <Typography color="#FF2A38" className="dropdown-Menu-items" >Delete</Typography >
                                </Box>
                            </MenuItem>
                        </Menu>
                    </Box>
                </div>
                <div className="card-description">
                    <div className='d-flex align-items-center gap-2'>
                    <Button variant="warning" className="button-status" size="sm">{workflow.envstatus}</Button>
                    <small className="text-muted date-font">Last Modified:  {workflow.updated_at}</small>
                    </div>
                    <label className='latestVersion'>v{workflow?.latestversiondata?.versionnumber}</label>
                </div>
                <span ref={descRef} className="workflow-desc" title={showDescTooltip ? workflow.description : ''}>
                    {workflow.description}
                </span>
                <div className="card-footers">
                    <span className="text-muted date-font">Created at: {workflow.created_at}</span>
                    <span className="text-muted date-font">Total Version(s):{workflow.versions.length}</span>
                </div>
            </Card.Body>
        </Card>
    );
};

export default Workflow;
