import React, { useState, useEffect } from 'react';
import companyModelService from '../../services/companyModelService';
import { BsSearch, BsPencil } from 'react-icons/bs';
import { Button, Col, FormControl, Row } from 'react-bootstrap';
import CompanyModelModal from '../../Modal/CompanyModelModal/CompanyModelModal';
import './AICompanyModel.scss';

const AICompanyModel = () => {
    const [models, setModels] = useState([]);
    const [filteredModels, setFilteredModels] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedModel, setSelectedModel] = useState(null);

    useEffect(() => {
        fetchModels();
    }, []);

    useEffect(() => {
        filterModels();
    }, [searchTerm, models]);

    const filterModels = () => {
        if (!searchTerm.trim()) {
            setFilteredModels(models);
            return;
        }

        const searchTerms = searchTerm.toLowerCase().split(' ');
        const filtered = models.filter(model => {
            const modelString = [
                model.name,
                model.description,
                model.provider,
                model.isEnabled ? 'enabled' : 'disabled'
            ].join(' ').toLowerCase();

            return searchTerms.every(term => modelString.includes(term));
        });

        setFilteredModels(filtered);
    };

    const fetchModels = async () => {
        try {
            setLoading(true);
            const compid = localStorage.getItem('comp_id');
            const userid = localStorage.getItem('user_id');
            
            if (!compid || !userid) {
                setError('User authentication data not found');
                setLoading(false);
                return;
            }

            const response = await companyModelService.getModels(compid, userid);
            
            if (response.data && response.data.result) {
                setModels(response.data.result);
            } else {
                setModels([]);
            }
        } catch (err) {
            console.error('Error fetching models:', err);
            setError('Failed to load models. Please try again later.');
            // Fallback to empty array
            setModels([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleModel = async (id) => {
        try {
            const updatedModels = models.map(model => 
                model.id === id ? { ...model, isEnabled: !model.isEnabled } : model
            );
            setModels(updatedModels);
            
            // Call backend to update model status
            const model = models.find(m => m.id === id);
            if (model) {
                await companyModelService.toggleModel(id, !model.isEnabled);
            }
        } catch (err) {
            console.error('Error toggling model:', err);
            // Revert the change if backend call fails
            fetchModels();
        }
    };

    const handleRegisterNewModel = () => {
        setShowRegisterModal(true);
    };

    const handleModalClose = () => {
        setShowRegisterModal(false);
    };

    const handleModelRegistered = (result) => {
        console.log('Model registered successfully:', result);
        // Refresh the models list
        fetchModels();
    };

    const handleEditModel = (model) => {
        setSelectedModel(model);
        setShowEditModal(true);
    };

    const handleEditModalClose = () => {
        setShowEditModal(false);
        setSelectedModel(null);
    };

    const handleModelUpdated = (result) => {
        console.log('Model updated successfully:', result);
        // Refresh the models list
        fetchModels();
    };

    const ModelIcon = ({ provider }) => {
        const [iconSrc, setIconSrc] = useState(null);
        const [isLoading, setIsLoading] = useState(true);
        const iconPath = `${provider}-icon.svg`;

        useEffect(() => {
            let isMounted = true;
            const loadIcon = async () => {
                try {
                    const icon = await import(`../../assets/${iconPath}`);
                    if (isMounted) {
                        setIconSrc(icon.default);
                        setIsLoading(false);
                    }
                } catch (error) {
                    try {
                        // Import the fallback icon properly
                        const fallbackIcon = await import(`../../assets/origamisicon.svg`);
                        if (isMounted) {
                            setIconSrc(fallbackIcon.default);
                            setIsLoading(false);
                        }
                    } catch (fallbackError) {
                        if (isMounted) {
                            setIsLoading(false);
                        }
                    }
                }
            };
            loadIcon();
            return () => { isMounted = false; };
        }, [iconPath]);

        if (isLoading) {
            return <div className="model-icon-loading"></div>;
        }

        if (iconSrc) {
            return <img src={iconSrc} alt="model icon" className="model-icon-img" />;
        }

        return <div className="model-icon">{iconPath}</div>;
    };

    if (loading) {
        return (
            <div className="ai-model-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading models...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ai-model-container">
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={fetchModels} className="retry-btn">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="ai-model-container">
            <div className="ai-model-header">
                <Row className="align-items-center justify-content-end">
                    <Col xs="auto">
                        <div className="search-input-container">
                            <FormControl 
                                placeholder="Search models..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input-padding"
                            />
                            <BsSearch className="search-input-icon" size={20} />
                        </div>
                    </Col>
                    <Col xs="auto" className="pe-0">
                        <button className="add-model-btn" onClick={handleRegisterNewModel}>
                            Add New Model
                        </button>
                    </Col>
                </Row>
            </div>
            
            {filteredModels.length === 0 ? (
                <div className="no-models-container">
                    <p>
                        {searchTerm ? 'No models found matching your search.' : 'No models available. Contact your administrator to add models.'}
                    </p>
                </div>
            ) : (
                <div className="models-grid">
                    {filteredModels.map((model) => (
                        <div key={model.id} className="model-card" onClick={() => handleEditModel(model)}>
                            <div className="model-card-header">
                                <div className="model-info">
                                    <ModelIcon provider={model.provider} />
                                    <h3 className="model-name">{model.name}</h3>
                                </div>
                                <div className="model-actions">
                                    <button 
                                        className="edit-model-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditModel(model);
                                        }}
                                        title="Edit model"
                                    >
                                        <BsPencil size={16} />
                                    </button>
                                    <div className="toggle-switch" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            id={`toggle-${model.id}`}
                                            checked={model.isEnabled}
                                            onChange={() => toggleModel(model.id)}
                                        />
                                        <label htmlFor={`toggle-${model.id}`} className="toggle-label"></label>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="model-description">{model.description}</p>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Register New Model Modal */}
            <CompanyModelModal
                show={showRegisterModal}
                onHide={handleModalClose}
                onSave={handleModelRegistered}
            />
            
            {/* Edit Model Modal */}
            <CompanyModelModal
                show={showEditModal}
                onHide={handleEditModalClose}
                onSave={handleModelUpdated}
                editMode={true}
                modelData={selectedModel}
            />
        </div>
    );
};

export default AICompanyModel;