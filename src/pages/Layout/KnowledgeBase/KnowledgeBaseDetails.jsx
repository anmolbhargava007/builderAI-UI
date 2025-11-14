import React from 'react';
import { Card, Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useKnowledgeBaseContext } from '../../../context/KnowledgeBase';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const KnowledgeBaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { loaderList, loading, error } = useKnowledgeBaseContext();

    if (loading) return <p className="p-4"><Spinner size="sm" /> Loading...</p>;
    if (error) return <p className="p-4 text-danger">Error: {error}</p>;

    const selectedLoader = loaderList.find(l => l.id === id);
    if (!selectedLoader) return <p className="p-4">Loader not found.</p>;

    return (
        <Container className="py-4">

            <Button
                variant="secondary"
                className="mb-3 back-button"
                onClick={() => navigate('/home/knowledgebase')}
            >
                ← Back
            </Button>

            <h4 className="mb-4">Select Type</h4>

            <Row>
                {selectedLoader.types.map(type => (
                    <Col md={3} key={type.id} className="mb-4">
                        <Card
                            className="workflow-card h-100 p-2"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(`/home/knowledgebase/${id}/${type.id}`)}
                        >
                            <Card.Body style={{ paddingBottom: "0px" }}>

                            <div className="card-heading mb-2 d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-2">
                                        <img
                                            src={`${API_BASE_URL}${type.icon}`}
                                            width={32}
                                            height={32}
                                            style={{ objectFit: "contain" }}
                                        />
                                        <span className="workflow-name">
                                            {type.name}
                                        </span>
                                    </div>
                                </div>

                                <span className="workflow-desc text-muted">
                                    Configure {type.name} data source
                                </span>

                                <div className="card-footers mt-2">
                                    <span className="text-muted date-font">
                                        Type ID: {type.id}
                                    </span>
                                </div>

                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

        </Container>
    );
};

export default KnowledgeBaseDetails;