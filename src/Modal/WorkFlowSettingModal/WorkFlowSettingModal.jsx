import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const WorkFlowSettingModal = ({ open, handleClose, workflowSetting, nodes, setWorkflowSetting, onSave }) => {
    const nameValue = nodes
        .filter(node => node.data?.nodeType === "Agent" && node.data?.params)
        .map(node => node.data.params.find(param => param.name === "name")?.value)
        .filter(Boolean) // Remove any undefined or null values

    const changeWorkflowSetting = (e) => {
        const { name, value } = e.target;
        setWorkflowSetting((prevState) => ({
            ...prevState,
            [name]: value
        }));
    }

    const handleSave = () => {
        if (onSave) {
            onSave();
        }
        handleClose();
    }

    return (
        <Modal show={open} onHide={handleClose} centered >
            <Form>
                <Modal.Body>
                    <Form.Group className="mb-3" controlId="executionTime">
                        <Form.Label>Max Execution Time(In seconds)</Form.Label>
                        <Form.Control
                            type="number"
                            name="executionTime"
                            value={workflowSetting.executionTime}
                            onChange={changeWorkflowSetting}
                            placeholder="Select your max execution time"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="finalAgent">
                        <Form.Label>Final Response Agent</Form.Label>
                        <Form.Select
                            required
                            name="finalAgent"
                            value={workflowSetting.finalAgent}
                            onChange={changeWorkflowSetting}
                            className='modal-input'
                            placeholder="select agent value"
                        >
                            <option value="">Select Agent</option>
                            {nameValue.map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                </Modal.Body>

                <Modal.Footer style={{ display: 'flex', justifyContent: 'center',gap:"2px" }}>
                    <Button className='white-button' onClick={handleClose} style={{ width: '180px' }}>
                        Close
                    </Button>
                    <Button className='pink-button' onClick={handleSave} style={{ width: '180px' }}>
                        Save
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default WorkFlowSettingModal;
