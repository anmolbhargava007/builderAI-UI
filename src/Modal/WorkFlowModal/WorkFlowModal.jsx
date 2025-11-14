import { Dialog, DialogTitle, DialogContent, IconButton, TextField, Button, Box, FormControl, FormLabel, Input } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { HiOutlinePlus } from "react-icons/hi";
// import workflowservice from '../../services/workflowservice';
import './WorkFlowModal.scss';
import { useState } from 'react';
import { Form } from 'react-bootstrap';



const WorkFlowModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: "icon.svg",
        backgroundcolor: "",
        fontcolor: "",
        version: "1"
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCreate = async (e) => {
        e.preventDefault();

        try {
            // const res=await workflowservice.getAllWorkflow()
            onSubmit(formData);
            setFormData({ name: '', description: ''});
        }
        catch (e) {
            console.log(e)
        }
        finally {

        }
    };

    return (
        <>
            <Dialog open={isOpen} onClose={onClose} width="sm" sx={{ '& .MuiDialog-paper': { width: '500px', borderRadius: '12px' } }}>
                <DialogTitle >
                    <Box display="flex" justifyContent="space-between" alignItems="center" className="modal-title">
                        Create New Workflow
                        <IconButton onClick={onClose} className="close-button">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Form onSubmit={handleCreate}>
                        <FormControl fullWidth required sx={{ mb: 2 }}>
                            <FormLabel htmlFor="name" className="label-heading">Workflow Name</FormLabel>
                            <Box sx={{ mt: 0, display: "flex", alignItems: "center", gap: 0.8 }}>
                                <Input
                                    name="name"
                                    placeholder="Give your workflow a name..."
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    fullWidth
                                    disableUnderline
                                    className="custom-input"
                                />
                                <Box className="add-icon">
                                    <HiOutlinePlus style={{ color: "rgba(255, 255, 255, 1)" }} />
                                </Box>
                            </Box>
                        </FormControl>
                        <FormControl fullWidth required sx={{ mb: 2 }}  >
                            <FormLabel htmlFor="description" className="label-heading">Workflow Description</FormLabel>
                            <TextField name="description" placeholder="Give a short description of workflow..."
                                value={formData.description} onChange={handleChange} required
                                fullWidth multiline rows={3}
                                disableUnderline className="custom-input"
                            />
                        </FormControl>
                       
                        <Box display="flex" justifyContent="space-around" gap={2} mt={2}>
                            <Button className="white-button" onClick={onClose}>Cancel</Button>
                            <Button className='pink-button' type="submit" >Create</Button>
                        </Box>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default WorkFlowModal;
