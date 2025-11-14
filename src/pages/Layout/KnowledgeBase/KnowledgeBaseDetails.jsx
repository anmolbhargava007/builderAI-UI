import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Modal, Form, Button, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import KnowledgeBaseService from '../../../services/knowledgeBaseService';

const KnowledgeBaseDetails = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [loaderList, setLoaderList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedType, setSelectedType] = useState(null);
    const [formState, setFormState] = useState({});

    const compid = localStorage.getItem("compid");

    useEffect(() => {
        KnowledgeBaseService.getAllKnowledgeBase(compid)
            .then(res => {
                if (res?.data?.data) {
                    setLoaderList(res.data.data);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="p-4"><Spinner size="sm" /> Loading...</p>;

    // Find loader by URL id
    const selectedLoader = loaderList.find(l => l.id === id);

    if (!selectedLoader) return <p>Loader not found.</p>;

    const handleChange = (field, value) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        console.log("Saved Config:", {
            loaderId: id,
            typeId: selectedType.id,
            config: formState
        });

        setFormState({});
        setSelectedType(null);
    };

    return (
        <Container className="py-4">

            <Button
                variant="secondary"
                className="mb-3"
                onClick={() => navigate('/home/knowledgebase')}
            >
                ← Back
            </Button>

            <h4 className="mb-4">Select Type</h4>

            <Row>
                {selectedLoader.types.map(type => (
                    <Col md={3} key={type.id} className="mb-4">
                        <Card
                            className="p-3 text-center"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                setSelectedType(type);
                                setFormState({});
                            }}
                        >
                            <h6>{type.name}</h6>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* CONFIG MODAL */}
            <Modal show={!!selectedType} onHide={() => setSelectedType(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Configure {selectedType?.name}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form>
                        {selectedType?.config?.map((cfg, index) => (
                            <Form.Group className="mb-3" key={index}>
                                <Form.Label>{cfg.label}</Form.Label>

                                <Form.Control
                                    type={cfg.type === "integer" ? "number" : "text"}
                                    value={formState[cfg.field] || ""}
                                    onChange={(e) => handleChange(cfg.field, e.target.value)}
                                />
                            </Form.Group>
                        ))}
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button className="pink-button" onClick={handleSave}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
};

export default KnowledgeBaseDetails;