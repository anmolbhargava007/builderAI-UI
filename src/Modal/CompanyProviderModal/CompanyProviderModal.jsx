import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Overlay, Tooltip } from 'react-bootstrap';
import './CompanyProviderModal.scss';
import Select from 'react-select';
import companyModelService from '../../services/companyModelService';

// Info Tooltip Component (reused from NodeSettingModal)
const InfoTooltip = ({ description, paramName, children }) => {
	const [show, setShow] = useState(false);
	const [target, setTarget] = useState(null);

	const handleClick = (event) => {
		setTarget(event.currentTarget);
		setShow(!show);
	};

	// Show info icon if description exists and is not empty
	const shouldShowIcon = description && description.trim().length > 0;

	// Format description for JSON output
	const formatDescription = (desc) => {
		try {
			// If it's JSON, format it nicely
			const parsed = JSON.parse(desc);
			return JSON.stringify(parsed, null, 2);
		} catch {
			// If it's not JSON, return as is
			return desc;
		}
	};

	return (
		<>
			<div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
				{children}
				{shouldShowIcon && (
					<span
						onClick={handleClick}
						style={{
							cursor: 'pointer',
							color: '#007bff',
							fontSize: '14px',
							display: 'inline-flex',
							alignItems: 'center',
							marginLeft: '4px'
						}}
						title="Click for full description"
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
							<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
							<path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
						</svg>
					</span>
				)}
			</div>
			<Overlay 
				target={target} 
				show={show} 
				placement="top"
				container={document.body}
				containerPadding={20}
			>
				{(props) => (
					<div
						{...props}
						style={{
							...props.style,
							backgroundColor: 'white',
							border: '1px solid #dee2e6',
							borderRadius: '6px',
							boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
							maxWidth: '400px',
							zIndex: 9999,
							padding: '12px',
							fontSize: '14px',
							lineHeight: '1.4'
						}}
					>
						<div style={{ 
							display: 'flex', 
							justifyContent: 'space-between', 
							alignItems: 'center', 
							marginBottom: '8px',
							borderBottom: '1px solid #dee2e6',
							paddingBottom: '4px'
						}}>
							<strong style={{ color: '#495057' }}>
								{paramName ? `${paramName} - Description` : 'Description'}
							</strong>
							<button
								onClick={() => setShow(false)}
								style={{
									background: 'none',
									border: 'none',
									fontSize: '18px',
									cursor: 'pointer',
									color: '#6c757d',
									padding: '0',
									lineHeight: '1',
									width: '20px',
									height: '20px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center'
								}}
								title="Close"
							>
								×
							</button>
						</div>
						<div style={{ 
							whiteSpace: 'pre-wrap', 
							wordBreak: 'break-word',
							color: '#495057',
							fontFamily: paramName === 'Output Format' ? 'monospace' : 'inherit',
							fontSize: paramName === 'Output Format' ? '12px' : '14px'
						}}>
							{formatDescription(description)}
						</div>
					</div>
				)}
			</Overlay>
		</>
	);
};

const CompanyProviderModal = ({ show, onHide, onSave, editMode = false, providerData = null }) => {
	const [loading, setLoading] = useState(false);
	const [providerConfigs, setProviderConfigs] = useState([]);
	const [selectedProviderConfig, setSelectedProviderConfig] = useState(null);
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		modelproviderid: '',
		params: {}
	});

	// Fetch provider configurations on component mount (for both create and edit modes)
	useEffect(() => {
		if (show) {
			fetchProviderConfigs();
		}
	}, [show]);

	// Pre-populate form data when editing
	useEffect(() => {
		if (editMode && providerData && show) {
			// In edit mode, we need to find the provider config that matches the provider data
			const providerId = providerData.modelproviderid || providerData.provider_id || providerData.id;
			

			
			setFormData({
				name: providerData.name || '',
				description: providerData.description || '',
				modelproviderid: providerId,
				params: providerData.params || {}
			});
			
			// If provider configs are already loaded, find the matching one
			if (providerConfigs.length > 0) {
				const config = providerConfigs.find(config => 
					config.provider_id === providerId || 
					config.name === providerData.provider ||
					config.display_name === providerData.provider
				);

				if (config) {
					setSelectedProviderConfig(config);
				}
			}
		} else if (!editMode) {
			// Reset form when creating new provider
			setFormData({
				name: '',
				description: '',
				modelproviderid: '',
				params: {}
			});
			setSelectedProviderConfig(null);
		}
	}, [editMode, providerData, show, providerConfigs]);

	// Set selected provider config when form data changes or when provider configs are loaded
	useEffect(() => {
		if (formData.modelproviderid && providerConfigs.length > 0) {
			const config = providerConfigs.find(config => 
				config.provider_id === formData.modelproviderid ||
				config.name === formData.modelproviderid ||
				config.display_name === formData.modelproviderid
			);
			if (config) {
				setSelectedProviderConfig(config);
			}
		}
	}, [formData.modelproviderid, providerConfigs]);

	// Additional effect to handle provider config matching in edit mode when configs are loaded after form data
	useEffect(() => {
		if (editMode && providerData && providerConfigs.length > 0 && !selectedProviderConfig) {
			const providerId = providerData.modelproviderid || providerData.provider_id || providerData.id;
			const config = providerConfigs.find(config => 
				config.provider_id === providerId || 
				config.name === providerData.provider ||
				config.display_name === providerData.provider
			);
			if (config) {
				setSelectedProviderConfig(config);
			}
		}
	}, [editMode, providerData, providerConfigs, selectedProviderConfig]);

	const fetchProviderConfigs = async () => {
		try {
			setLoading(true);
			const response = await companyModelService.getProviderConfig();
			setProviderConfigs(response.data.result || []);
		} catch (error) {
			console.error('Error fetching provider configurations:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleProviderSelection = (selectedOption) => {
		const selectedConfig = providerConfigs.find(config => 
			config.provider_id === selectedOption.value
		);
		
		setSelectedProviderConfig(selectedConfig);
		setFormData(prev => ({
			...prev,
			modelproviderid: selectedConfig.provider_id,
			params: {}
		}));
	};

	const handleParamChange = (paramName, value) => {
		setFormData(prev => ({
			...prev,
			params: {
				...prev.params,
				[paramName]: value
			}
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		try {
			setLoading(true);
			let response;
			
			if (editMode && providerData) {
				// Update existing provider - include the provider ID in the form data
				const updateData = {
					...formData,
					id: providerData.id
				};

				response = await companyModelService.updateProvider(updateData);
			} else {
				// Create new provider

				response = await companyModelService.addNewProvider(formData);
			}
			
			onSave(response.data);
			onHide();
		} catch (error) {
			console.error('Error saving provider:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (field, value) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}));
	};

	// Prepare options for provider selection dropdown
	const providerOptions = providerConfigs.map(config => ({
		value: config.provider_id,
		label: `${config.display_name} (${config.name})`
	}));

	return (
		<Modal show={show} onHide={onHide} size="lg" centered>
			<Modal.Header closeButton>
				<Modal.Title>{editMode ? 'Edit Provider' : 'Register New Provider'}</Modal.Title>
			</Modal.Header>
			
			<Form onSubmit={handleSubmit}>
				<Modal.Body>
					{loading && !providerConfigs.length ? (
						<div className="text-center">
							<div className="spinner-border" role="status">
								<span className="visually-hidden">Loading...</span>
							</div>
							<p className="mt-2">Loading provider configurations...</p>
						</div>
					) : (
						<>
							{/* Provider Selection */}
							<Form.Group className="mb-3">
								<Form.Label className='modal-section-heading'>
									Provider Configuration
								</Form.Label>
								<hr />
								
								{editMode ? (
									<Form.Group className="mb-3">
										<Form.Label className='modal-label'>Provider</Form.Label>
										<div className="alert alert-secondary">
											<strong>
												{providerData?.provider ? 
													`${providerData.name} - ${providerData.provider}` :
													selectedProviderConfig ? selectedProviderConfig.display_name : 'Unknown Provider'
												}
											</strong>
										</div>
									</Form.Group>
								) : (
									<Form.Group className="mb-3">
										<Form.Label className='modal-label'>Select Provider *</Form.Label>
										<Select
											options={providerOptions}
											value={providerOptions.find(option => 
												option.value === formData.modelproviderid
											)}
											onChange={handleProviderSelection}
											placeholder="Select a provider"
											isDisabled={loading}
										/>
									</Form.Group>
								)}

								{selectedProviderConfig && (
									<div className="mb-3">
										<Form.Label className='modal-label'>Selected Configuration</Form.Label>
										<div className="alert alert-info">
											<strong>Provider:</strong> {selectedProviderConfig.display_name}<br/>
											<strong>Provider Name:</strong> {selectedProviderConfig.name}<br/>
											<strong>Description:</strong> {selectedProviderConfig.description || 'No description available'}
										</div>
									</div>
								)}
								

								

							</Form.Group>

							{/* Basic Information */}
							<Form.Group className="mb-3">
								<Form.Label className='modal-section-heading'>
									Basic Information
								</Form.Label>
								<hr />
								
								<Form.Group className="mb-3">
									<Form.Label className='modal-label'>Provider Instance Name *</Form.Label>
									<Form.Control
										type="text"
										value={formData.name}
										required
										onChange={(e) => handleInputChange('name', e.target.value)}
										className='modal-input'
										placeholder="Enter provider instance name"
									/>
								</Form.Group>

								<Form.Group className="mb-3">
									<Form.Label className='modal-label'>Description</Form.Label>
									<Form.Control
										as="textarea"
										value={formData.description}
										onChange={(e) => handleInputChange('description', e.target.value)}
										className='modal-input'
										placeholder="Enter provider instance description"
										rows={3}
									/>
								</Form.Group>
							</Form.Group>

							{/* Provider Parameters */}
							{selectedProviderConfig && selectedProviderConfig.params && Object.keys(selectedProviderConfig.params).length > 0 && (
								<Form.Group className="mb-3">
									<Form.Label className='modal-section-heading'>
										Provider Parameters
									</Form.Label>
									<hr />
									
									{Object.entries(selectedProviderConfig.params).map(([paramName, param]) => (
										<Form.Group key={paramName} className="mb-3">
											<Form.Label className='modal-label'>
												<InfoTooltip 
													description={param.description} 
													paramName={param.displayname}
												>
													{param.displayname} {param.isrequired && '*'}
												</InfoTooltip>
											</Form.Label>
											
											{param.valuetype === 'string' && (
												<Form.Control
													type="text"
													value={formData.params[paramName] || ''}
													required={param.isrequired}
													onChange={(e) => handleParamChange(paramName, e.target.value)}
													className='modal-input'
													placeholder={param.description}
												/>
											)}
											
											{param.valuetype === 'number' && (
												<Form.Control
													type="number"
													value={formData.params[paramName] || ''}
													required={param.isrequired}
													onChange={(e) => handleParamChange(paramName, e.target.value)}
													className='modal-input'
													placeholder={param.description}
												/>
											)}
											
											{param.valuetype === 'text' && (
												<Form.Control
													as="textarea"
													value={formData.params[paramName] || ''}
													required={param.isrequired}
													onChange={(e) => handleParamChange(paramName, e.target.value)}
													className='modal-input'
													placeholder={param.description}
													rows={3}
												/>
											)}
											
											{param.valuetype === 'boolean' && (
												<Form.Check
													type="checkbox"
													checked={formData.params[paramName] === true}
													required={param.isrequired}
													onChange={(e) => handleParamChange(paramName, e.target.checked)}
													label={param.description}
												/>
											)}
										</Form.Group>
									))}
								</Form.Group>
							)}
						</>
					)}
				</Modal.Body>

				<Modal.Footer>
					<Button variant="secondary" onClick={onHide} disabled={loading}>
						Cancel
					</Button>
					<Button variant="primary" type='submit' disabled={loading || !formData.name || (!editMode && !formData.modelproviderid)}>
						{loading ? (editMode ? 'Updating...' : 'Registering...') : (editMode ? 'Update Provider' : 'Register Provider')}
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};

export default CompanyProviderModal;
