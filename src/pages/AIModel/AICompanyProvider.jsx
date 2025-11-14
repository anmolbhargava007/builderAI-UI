import React, { useState, useEffect } from 'react';
import companyModelService from '../../services/companyModelService';
import { BsSearch } from 'react-icons/bs';
import { Button, Col, FormControl, Row } from 'react-bootstrap';
import CompanyProviderModal from '../../Modal/CompanyProviderModal/CompanyProviderModal';
import './AICompanyProvider.scss';

const AICompanyProvider = () => {
    const [providers, setProviders] = useState([]);
    const [filteredProviders, setFilteredProviders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);

    useEffect(() => {
        fetchProviders();
    }, []);

    useEffect(() => {
        filterProviders();
    }, [searchTerm, providers]);

    const filterProviders = () => {
        if (!searchTerm.trim()) {
            setFilteredProviders(providers);
            return;
        }

        const searchTerms = searchTerm.toLowerCase().split(' ');
        const filtered = providers.filter(providerItem => {
            const providerString = [
                providerItem.name,
                providerItem.description,
                providerItem.provider,
                providerItem.isEnabled ? 'enabled' : 'disabled'
            ].join(' ').toLowerCase();

            return searchTerms.every(term => providerString.includes(term));
        });

        setFilteredProviders(filtered);
    };

    const fetchProviders = async () => {
        try {
            setLoading(true);
            const compid = localStorage.getItem('comp_id');
            const userid = localStorage.getItem('user_id');

            if (!compid || !userid) {
                setError('User authentication data not found');
                setLoading(false);
                return;
            }

            const response = await companyModelService.getModelProviders(compid, userid);

            if (response.data && response.data.result) {
                setProviders(response.data.result);
            } else {
                setProviders([]);
            }
        } catch (err) {
            console.error('Error fetching model providers:', err);
            setError('Failed to load model providers. Please try again later.');
            setProviders([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleProvider = async (id) => {
        try {
            const updated = providers.map(p =>
                p.id === id ? { ...p, isEnabled: !p.isEnabled } : p
            );
            setProviders(updated);

            const providerItem = providers.find(p => p.id === id);
            if (providerItem) {
                await companyModelService.toggleModelProvider(id, !providerItem.isEnabled);
            }
        } catch (err) {
            console.error('Error toggling provider:', err);
            fetchProviders();
        }
    };

    const handleRegisterNewProvider = () => {
        setShowRegisterModal(true);
    };

    const handleModalClose = () => {
        setShowRegisterModal(false);
    };

    const handleProviderRegistered = (result) => {
        console.log('Provider registered successfully:', result);
        // Refresh the providers list
        fetchProviders();
    };

    const handleProviderClick = (provider) => {
        setSelectedProvider(provider);
        setShowEditModal(true);
    };

    const handleEditModalClose = () => {
        setShowEditModal(false);
        setSelectedProvider(null);
    };

    const handleProviderUpdated = (result) => {
        console.log('Provider updated successfully:', result);
        // Refresh the providers list
        fetchProviders();
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
            return <img src={iconSrc} alt="provider icon" className="model-icon-img" />;
        }

        return <div className="model-icon">{iconPath}</div>;
    };

    if (loading) {
        return (
            <div className="ai-model-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading model providers...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ai-model-container">
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={fetchProviders} className="retry-btn">Retry</button>
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
                                placeholder="Search providers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input-padding"
                            />
                            <BsSearch className="search-input-icon" size={20} />
                        </div>
                    </Col>
                    <Col xs="auto" className="pe-0">
                        <button className="add-model-btn" onClick={handleRegisterNewProvider}>
                            Add New Provider
                        </button>
                    </Col>
                </Row>
            </div>

            {filteredProviders.length === 0 ? (
                <div className="no-models-container">
                    <p>
                        {searchTerm ? 'No providers found matching your search.' : 'No model providers available.'}
                    </p>
                </div>
            ) : (
                <div className="models-grid">
                    {filteredProviders.map((providerItem) => (
                        <div key={providerItem.id} className="model-card" onClick={() => handleProviderClick(providerItem)}>
                            <div className="model-card-header">
                                <div className="model-info">
                                    <ModelIcon provider={providerItem.provider} />
                                    <h3 className="model-name">{providerItem.name}</h3>
                                </div>
                                <div className="toggle-switch" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        id={`toggle-${providerItem.id}`}
                                        checked={providerItem.isEnabled}
                                        onChange={() => toggleProvider(providerItem.id)}
                                    />
                                    <label htmlFor={`toggle-${providerItem.id}`} className="toggle-label"></label>
                                </div>
                            </div>

                            <p className="model-description">{providerItem.description}</p>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Register New Provider Modal */}
            <CompanyProviderModal
                show={showRegisterModal}
                onHide={handleModalClose}
                onSave={handleProviderRegistered}
            />

            {/* Edit Provider Modal */}
            <CompanyProviderModal
                show={showEditModal}
                onHide={handleEditModalClose}
                onSave={handleProviderUpdated}
                editMode={true}
                providerData={selectedProvider}
            />
        </div>
    );
};

export default AICompanyProvider;


