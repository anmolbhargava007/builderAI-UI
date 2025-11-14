import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useKnowledgeBaseContext } from '../../../context/KnowledgeBase';
import CenteredLoader from '../../../components/Loader/Loader';

const KnowledgeBaseConfig = () => {
    const { id, typeId } = useParams();
    const navigate = useNavigate();

    const { loaderList, loading, saveNewKB } = useKnowledgeBaseContext();

    const [formState, setFormState] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [meta, setMeta] = useState({ name: "", description: "" });

    if (loading || loaderList.length === 0) {
        return <CenteredLoader message="Loading config..." height="70vh" />;
    }

    const selectedLoader = loaderList.find(l => l.id === id);
    const selectedType = selectedLoader?.types?.find(t => t.id === typeId);

    if (!selectedLoader || !selectedType) {
        return <p className="p-4 text-danger">Invalid Configuration</p>;
    }

    const handleChange = (field, value) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const openSaveModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    // FINAL SAVE...
    const handleFinalSave = async () => {
        const payload = {
            name: meta.name,
            description: meta.description,
            status: "Active",
            kbsubtypeid: '1840191f-bec2-417b-87e6-a006b9889d79',
            kbsourceid: id,
            param_config: { ...formState } 
        };
        saveNewKB(payload);

        closeModal();
        navigate(`/home/knowledgebase`);
    };

    return (
        <Container className="py-4">

            <Button
                variant="secondary"
                className="mb-3 back-button"
                onClick={() => navigate(`/home/knowledgebase/${id}`)}
            >
                ← Back
            </Button>

            <h4 className="mb-3">Configure {selectedType.name}</h4>

            <Form>
                <Row>
                    {selectedType.config?.map((cfg, index) => (
                        <Col md={6} key={index}>
                            <Form.Group className="mb-3">
                                <Form.Label>{cfg.label}</Form.Label>

                                <Form.Control
                                    type={cfg.type === "integer" ? "number" : "text"}
                                    value={formState[cfg.field] || ""}
                                    onChange={(e) => handleChange(cfg.field, e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    ))}
                </Row>
            </Form>

            <Button className="pink-button mt-3" onClick={openSaveModal}>
                Save
            </Button>

            <Modal show={showModal} onHide={closeModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Finalize Configuration</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p className="text-muted mb-3">
                        Please provide a name and description for this configuration.
                    </p>

                    <Form.Group className="mb-3">
                        <Form.Label><b>Name</b></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter configuration name"
                            value={meta.name}
                            onChange={(e) => setMeta(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label><b>Description</b></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Short description"
                            value={meta.description}
                            onChange={(e) =>
                                setMeta(prev => ({ ...prev, description: e.target.value }))
                            }
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        className="back-button"
                        variant="secondary"
                        onClick={closeModal}
                    >
                        Cancel
                    </Button>

                    <Button
                        className="pink-button"
                        disabled={!meta.name.trim()}
                        onClick={handleFinalSave}
                    >
                        Save Configuration
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
};

export default KnowledgeBaseConfig;
