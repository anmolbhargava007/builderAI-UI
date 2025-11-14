import React, { useEffect, useState } from "react";
import { Container, Form, Button, Row, Col, Modal } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useKnowledgeBaseContext } from "../../../context/KnowledgeBase";
import CenteredLoader from "../../../components/Loader/Loader";

const KnowledgeBaseConfigEdit = () => {
  const { kbId } = useParams();
  const navigate = useNavigate();

  const { savedKbList, loading, editKB } = useKnowledgeBaseContext();

  const [formState, setFormState] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [meta, setMeta] = useState({ name: "", description: "" });

  const selectedInstance = savedKbList.find(
    (k) => k.id.trim() === decodeURIComponent(kbId).trim()
  );

  if (loading) {
    return <CenteredLoader message="Loading configuration..." height="70vh" />;
  }

  if (!selectedInstance) {
    return (
      <div className="p-4 text-danger">
        Invalid KB Instance – Not found in saved list.
      </div>
    );
  }

  useEffect(() => {
    setFormState({ ...selectedInstance.config });
    setMeta({
      name: selectedInstance.name,
      description: selectedInstance.description,
    });
  }, [kbId]);

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleFinalSave = async () => {
    const payload = {
      id: selectedInstance.id,
      name: meta.name,
      description: meta.description,
      status: selectedInstance.status || "Active",
      kbsubtypeid: selectedInstance.kbsubtypeid,
      kbtype: selectedInstance.kbtype,
      param_config: formState,
    };

    editKB(payload);

    closeModal();
    navigate(`/home/knowledgebase`);
  };

  return (
    <Container className="py-4">

      <Button
        variant="secondary"
        className="mb-3 back-button"
        onClick={() => navigate(`/home/knowledgebase`)}
      >
        ← Back
      </Button>

      <h4 className="mb-3">
        Edit Configuration – {selectedInstance.name}
      </h4>

      <Form>
        <Row>
          {Object.keys(formState).map((field, index) => (
            <Col md={6} key={index}>
              <Form.Group className="mb-3">
                <Form.Label style={{textTransform: 'capitalize'}}>{field.replace(/_/g, ' ')}</Form.Label>

                <Form.Control
                  type="text"
                  value={formState[field] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                />
              </Form.Group>
            </Col>
          ))}
        </Row>
      </Form>

      <Button className="pink-button mt-3" onClick={openModal}>
        Save Changes
      </Button>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Configuration</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label><b>Name</b></Form.Label>
            <Form.Control
              type="text"
              value={meta.name}
              onChange={(e) =>
                setMeta((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </Form.Group>

          <Form.Group>
            <Form.Label><b>Description</b></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={meta.description}
              onChange={(e) =>
                setMeta((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button className="back-button" variant="secondary" onClick={closeModal}>
            Cancel
          </Button>

          <Button
            className="pink-button"
            disabled={!meta.name.trim()}
            onClick={handleFinalSave}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default KnowledgeBaseConfigEdit;