import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Spinner, Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useKnowledgeBaseContext } from '../../../context/KnowledgeBase';
import { FaGoogleDrive, FaDatabase, FaSlack, FaBook, FaPlus } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const KnowledgeBase = () => {
    const navigate = useNavigate();
    const { loaderList, savedKbList, loading, error, refetch, refetchList } = useKnowledgeBaseContext();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        refetch();
        refetchList();
    }, []);

    if (loading) return <p className="p-4"><Spinner size="sm" /> Loading...</p>;
    if (error) return <p className="p-4 text-danger">Error: {error}</p>;

    const handleSelect = (id) => {
        setShowModal(false);
        navigate(`/home/knowledgebase/${id}`);
    };

    const handleCardSelect = (id, kbtype) => {
        navigate(`/home/knowledgebase/edit/${kbtype}/${id}`);
    };

    return (
        <Container fluid className="py-3 px-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Add Knowledge Base</h4>
                <Button
                    className="pink-button d-flex align-items-center gap-2"
                    onClick={() => setShowModal(true)}
                >
                    <FaPlus />
                    Knowledge Base
                </Button>
            </div>

            <Row className="mb-4">
                {savedKbList?.map(item => (
                    <Col md={4} key={item.id} className="mb-3">
                        <Card
                            className="workflow-card h-100 p-2"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleCardSelect(item.id, item.kbtype)}
                        >
                            <Card.Body style={{ paddingBottom: "0px" }}>

                                <div className="card-heading mb-2 d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-2">
                                        <img
                                            src={`${API_BASE_URL}/${item.icon}`}
                                            width={32}
                                            height={32}
                                            style={{ objectFit: "contain" }}
                                        />
                                        <span className="workflow-name">
                                            {item.name}
                                        </span>
                                    </div>
                                </div>

                                <span className="workflow-desc text-muted">
                                    {item.description}
                                </span>

                                <div className="card-footers mt-2">
                                    <span className="text-muted date-font">
                                        Source ID: {item.id}
                                    </span>
                                </div>

                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Select Knowledge Base Type</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row>
                        {loaderList?.map(item => (
                            <Col md={4} key={item.id} className="mb-3">
                                <Card
                                    className="workflow-card h-100 p-2"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleSelect(item.id)}
                                >
                                    <Card.Body style={{ paddingBottom: "0px" }}>

                                        <div className="card-heading mb-2 d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center gap-2">
                                                <img
                                                    src={`${API_BASE_URL}/${item.icon}`}
                                                    width={32}
                                                    height={32}
                                                    style={{ objectFit: "contain" }}
                                                />
                                                <span className="workflow-name">
                                                    {item.name}
                                                </span>
                                            </div>
                                        </div>

                                        <span className="workflow-desc text-muted">
                                            Connect your {item.name} data source
                                        </span>

                                        <div className="card-footers mt-2">
                                            <span className="text-muted date-font">
                                                Source ID: {item.id}
                                            </span>
                                        </div>

                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default KnowledgeBase;
