import React, { useEffect, useState } from 'react';
import { Card, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import KnowledgeBaseService from '../../../services/knowledgeBaseService';

import { FaGoogleDrive, FaDatabase, FaSlack, FaBook } from 'react-icons/fa';

const iconMap = {
    "vectordb": <FaDatabase size={32} />,
    "postgresql": <FaDatabase size={32} />,
    "mysql": <FaDatabase size={32} />,
    "googledrive": <FaGoogleDrive size={32} />,
    "sharepoint": <FaBook size={32} />,
    "microsoftteams": <FaSlack size={32} />,
    "files": <FaBook size={32} />,
};

const KnowledgeBase = () => {
    const navigate = useNavigate();

    const [loaders, setLoaders] = useState([]);
    const [loading, setLoading] = useState(true);

    const compid = localStorage.getItem("compid");

    useEffect(() => {
        KnowledgeBaseService.getAllKnowledgeBase(compid)
            .then(res => {
                if (res?.data?.data) {
                    setLoaders(res.data.data);
                }
            })
            .finally(() => setLoading(false));
    }, []);
    
    if (loading) return <p className="p-4"><Spinner size="sm" /> Loading...</p>;

    return (
        <Container fluid className="py-3 px-4">
            <h4 className="mb-4">Knowledge Base</h4>

            <Row>
                {loaders.map(item => (
                    <Col md={3} key={item.id} className="mb-4">
                        <Card
                            className="p-3 text-center"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(`/home/knowledgebase/${item.id}`)}
                        >
                            {iconMap[item.id] || <FaDatabase size={32} />}
                            <h6 className="mt-2">{item.name}</h6>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default KnowledgeBase;