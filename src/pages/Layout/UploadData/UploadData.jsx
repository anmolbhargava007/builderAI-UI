import React, { useEffect, useState } from 'react';
import { Card, Button, Container, Row, Col, Modal, Form, Spinner, Table } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa6';
import documentService from '../../../services/documentService';
import '../../../Modal/NodeSettingModal/NodeSettingModal.scss';
import Icon from '../../../assets/Icon.svg';

const UploadData = () => {
  const [files, setFiles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [kbsubtypes, setKbsubtypes] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedKbsubtype, setSelectedKbsubtype] = useState('');
  const [selectedChunking, setSelectedChunking] = useState('sentence');
  const [keywordFields, setKeywordFields] = useState([]); // dynamic fields
  const [keywordValues, setKeywordValues] = useState({}); // user input for fields
  const [description, setDescription] = useState(''); // new state for description

  useEffect(() => {
    fetchFiles();
    fetchComponents();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await documentService.getFiles();
      // Expecting res.data.documents as array
      setFiles(res.data.documents || []);
    } catch (e) {
      setError('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const fetchComponents = async () => {
    try {
      const res = await documentService.getAllComponents();
      setModels(res.models || []);
      setKbsubtypes(res.kbsubtypes || []);
    } catch (e) {
      setError('Failed to fetch components');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleKbsubtypeChange = (e) => {
    const selectedId = e.target.value;
    setSelectedKbsubtype(selectedId);
    // Find the selected kbsubtype and update keyword fields
    const selected = kbsubtypes.find(kb => (kb.kbsubtypeinstanceid || kb.id) === selectedId);
    const fields = selected && Array.isArray(selected.index_keyword_fields) ? selected.index_keyword_fields : [];
    setKeywordFields(fields);
    // Reset keyword values when changing subtype
    setKeywordValues({});
  };

  const handleKeywordChange = (field, value) => {
    setKeywordValues(prev => ({ ...prev, [field]: value }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedModel || !selectedKbsubtype || !description) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('inputfile', file);
      formData.append('file_type', 'PDF');
      formData.append('embedding_modelinstanceid', selectedModel);
      formData.append('pdfreader_servicesubtypeinstanceid', '');
      formData.append('vector_kbsubtypeinstanceid', selectedKbsubtype);
      formData.append('vector_keywords', JSON.stringify(keywordValues));
      formData.append('chunking_type', selectedChunking);
      formData.append('description', description); // add description
      await documentService.uploadFile(formData);
      setModalOpen(false);
      setFile(null);
      setSelectedModel('');
      setSelectedKbsubtype('');
      setKeywordFields([]);
      setKeywordValues({});
      setDescription(''); // reset description
      fetchFiles();
    } catch (e) {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Add isFormValid to check if all required fields are selected
  const isFormValid = file && selectedModel && selectedKbsubtype && description;

  return (
    <Container fluid className="py-3 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Uploaded Documents</h4>
        <Button 
          className="pink-button d-flex align-items-center gap-2" 
          onClick={() => setModalOpen(true)}
        >
          <FaPlus />
          Upload Document
        </Button>
      </div>

      {loading ? (
        <div className="d-flex align-items-center justify-content-center w-100" style={{ minHeight: 200 }}>
          <Spinner animation="border" />
        </div>
      ) : files.length === 0 ? (
        <div className="d-flex align-items-center justify-content-center w-100" style={{ minHeight: 200 }}>
          <span>No files uploaded yet.</span>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Description</th>
              <th>Type</th>
              <th>Model</th>
              <th>Vector DB</th>
              <th>Vector Keywords</th>
              <th>Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, idx) => (
              <tr key={file.fileid || idx}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <img src={Icon} alt="icon" style={{ width: 24 }} />
                    <span title={file.name}>{file.name}</span>
                  </div>
                </td>
                <td>
                  <span title={file.description}>{file.description}</span>
                </td>
                <td>
                  <span className="badge bg-secondary">{file.filetype}</span>
                </td>
                <td>{file.embedding_modelinstance_name || '-'}</td>
                <td>{file.vector_kbsubtypeinstance_name || '-'}</td>
                <td>
                  {file.vector_keywords && Object.keys(file.vector_keywords).length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {Object.entries(file.vector_keywords).map(([key, value]) => (
                        <span 
                          key={key} 
                          style={{ 
                            background: '#f5f5f5', 
                            borderRadius: '4px', 
                            padding: '1px 6px', 
                            border: '1px solid #eee',
                            fontSize: '11px'
                          }}
                        >
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  {file.created_at ? new Date(file.created_at).toLocaleString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={modalOpen} onHide={() => { setModalOpen(false); setSelectedModel(''); setSelectedKbsubtype(''); }}>
        <Modal.Header closeButton>
          <Modal.Title>Upload File</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpload}>
          <Modal.Body>
            <Form.Group controlId="formFile">
              <Form.Label>
                Select file<span className="required-asterisk">*</span>
              </Form.Label>
              <Form.Control type="file" onChange={handleFileChange} required />
            </Form.Group>
            {/* Description field */}
            <Form.Group controlId="formDescription" className="mt-3">
              <Form.Label>
                Description<span className="required-asterisk">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter file description"
                required
              />
            </Form.Group>
            <Form.Group controlId="formModel" className="mt-3">
              <Form.Label>
                Embedding Model<span className="required-asterisk">*</span>
              </Form.Label>
              <Form.Select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                required
              >
                <option value="">Select Model</option>
                {models.map(model => (
                  <option key={model.modelinstanceid} value={model.modelinstanceid}>{model.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="formKbsubtype" className="mt-3">
              <Form.Label>
                Vector DB<span className="required-asterisk">*</span>
              </Form.Label>
              <Form.Select
                value={selectedKbsubtype}
                onChange={handleKbsubtypeChange}
                required
              >
                <option value="">Select Vector DB</option>
                {kbsubtypes.map(kb => (
                  <option key={kb.kbsubtypeinstanceid || kb.id} value={kb.kbsubtypeinstanceid || kb.id}>{kb.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            {/* Dynamic keyword fields */}
            {keywordFields.length > 0 && (
              <div className="mt-3">
                <Form.Label>Index Keyword Fields</Form.Label>
                {keywordFields.map(field => (
                  <Form.Group controlId={`keyword-${field}`} className="mb-2" key={field}>
                    <Form.Label>{field}</Form.Label>
                    <Form.Control
                      type="text"
                      value={keywordValues[field] || ''}
                      onChange={e => handleKeywordChange(field, e.target.value)}
                      placeholder={`Enter ${field}`}
                    />
                  </Form.Group>
                ))}
              </div>
            )}
            <Form.Group controlId="formChunking" className="mt-3">
              <Form.Label>Chunking Type</Form.Label>
              <Form.Select
                value={selectedChunking || 'sentence'}
                onChange={e => setSelectedChunking(e.target.value)}
                required
              >
                <option value="sentence">Sentence</option>
              </Form.Select>
            </Form.Group>
            {error && <div className="text-danger mt-2">{error}</div>}
          </Modal.Body>
          <Modal.Footer>
            <Button className='pink-button' type="submit" disabled={uploading || !isFormValid}>
              {uploading ? <Spinner size="sm" animation="border" /> : 'Upload'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default UploadData;
