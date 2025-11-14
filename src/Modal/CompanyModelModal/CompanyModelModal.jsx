import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Overlay, Tooltip } from 'react-bootstrap';
import './CompanyModelModal.scss';
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

const CompanyModelModal = ({ show, onHide, onSave, editMode = false, modelData = null }) => {
	const [loading, setLoading] = useState(false);
	const [modelConfigs, setModelConfigs] = useState([]);
	const [selectedModelConfig, setSelectedModelConfig] = useState(null);
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		modelid: '',
		modelproviderinstanceid: '',
		params: {}
	});

	// Fetch model configurations on component mount
	useEffect(() => {
		if (show) {
			fetchModelConfigs();
		}
	}, [show]);

	// Pre-populate form data when editing
	useEffect(() => {
		if (editMode && modelData && show) {
			console.log('Model data received:', modelData);
			setFormData({
				id: modelData.id,
				name: modelData.name || '',
				description: modelData.description || '',
				modelid: modelData.modelid || modelData.model_id || '',
				modelproviderinstanceid: modelData.modelproviderinstanceid || modelData.provider_instance_id || '',
				params: modelData.params || {}
			});
			
			// If model configs are already loaded, find the matching one
			if (modelConfigs.length > 0) {
				const modelId = modelData.modelid || modelData.model_id;
				const providerInstanceId = modelData.modelproviderinstanceid || modelData.provider_instance_id;
				
				const config = modelConfigs.find(config => 
					config.model_id === modelId && 
					config.provider_instance_id === providerInstanceId
				);

				if (config) {
					setSelectedModelConfig(config);
				}
			}
		} else if (!editMode) {
			// Reset form when creating new model
			setFormData({
				name: '',
				description: '',
				modelid: '',
				modelproviderinstanceid: '',
				params: {}
			});
			setSelectedModelConfig(null);
		}
	}, [editMode, modelData, show, modelConfigs]);

	// Set selected model config when form data changes or when model configs are loaded
	useEffect(() => {
		if (formData.modelid && formData.modelproviderinstanceid && modelConfigs.length > 0) {
			const config = modelConfigs.find(config => 
				config.model_id === formData.modelid && 
				config.provider_instance_id === formData.modelproviderinstanceid
			);
			if (config) {
				setSelectedModelConfig(config);
			}
		}
	}, [formData.modelid, formData.modelproviderinstanceid, modelConfigs]);

	// Additional effect to handle model config matching in edit mode when configs are loaded after form data
	useEffect(() => {
		if (editMode && modelData && modelConfigs.length > 0 && !selectedModelConfig) {
			const modelId = modelData.modelid || modelData.model_id;
			const providerInstanceId = modelData.modelproviderinstanceid || modelData.provider_instance_id;
			
			const config = modelConfigs.find(config => 
				config.model_id === modelId && 
				config.provider_instance_id === providerInstanceId
			);
			if (config) {
				setSelectedModelConfig(config);
			}
		}
	}, [editMode, modelData, modelConfigs, selectedModelConfig]);

	const fetchModelConfigs = async () => {
		try {
			setLoading(true);
			const response = await companyModelService.getModelConfig();
			setModelConfigs(response.data.result || []);
		} catch (error) {
			console.error('Error fetching model configurations:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleModelSelection = (selectedOption) => {
		const selectedConfig = modelConfigs.find(config => 
			config.model_id === selectedOption.value.model_id && 
			config.provider_instance_id === selectedOption.value.provider_instance_id
		);
		
		setSelectedModelConfig(selectedConfig);
		setFormData(prev => ({
			...prev,
			modelid: selectedConfig.model_id,
			modelproviderinstanceid: selectedConfig.provider_instance_id,
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
			
			if (editMode && modelData) {
				// Update existing model - include the model ID in the form data
				const updateData = {
					...formData,
					id: modelData.id
				};

				response = await companyModelService.updateModel(updateData);
			} else {
				// Create new model
				response = await companyModelService.addNewModel(formData);
			}
			
			onSave(response.data);
			onHide();
		} catch (error) {
			console.error('Error saving model:', error);
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

	// Prepare options for model selection dropdown
	const modelOptions = modelConfigs.map(config => ({
		value: {
			model_id: config.model_id,
			provider_instance_id: config.provider_instance_id
		},
		label: `${config.model_display_name} (${config.provider_instance_name})`
	}));

	return (
		<Modal show={show} onHide={onHide} size="lg" centered>
			<Modal.Header closeButton>
				<Modal.Title>{editMode ? 'Edit Model' : 'Register New Model'}</Modal.Title>
			</Modal.Header>
			
			<Form onSubmit={handleSubmit}>
				<Modal.Body>
					{loading && !modelConfigs.length ? (
						<div className="text-center">
							<div className="spinner-border" role="status">
								<span className="visually-hidden">Loading...</span>
							</div>
							<p className="mt-2">Loading model configurations...</p>
						</div>
					) : (
						<>
							{/* Model Selection */}
							<Form.Group className="mb-3">
								<Form.Label className='modal-section-heading'>
									Model Configuration
								</Form.Label>
								<hr />
								
								{editMode ? (
									<Form.Group className="mb-3">
										<Form.Label className='modal-label'>Model</Form.Label>
										<div className="alert alert-secondary">
											<strong>
												{modelData?.model_name && modelData?.provider ? 
													`${modelData.model_name} - ${modelData.provider}` :
													selectedModelConfig ? selectedModelConfig.model_display_name : (modelData?.name || 'Unknown Model')
												}
											</strong>
										</div>
									</Form.Group>
								) : (
									<Form.Group className="mb-3">
										<Form.Label className='modal-label'>Select Model *</Form.Label>
										<Select
											options={modelOptions}
											value={modelOptions.find(option => 
												option.value.model_id === formData.modelid && 
												option.value.provider_instance_id === formData.modelproviderinstanceid
											)}
											onChange={handleModelSelection}
											placeholder="Select a model and provider instance"
											isDisabled={loading}
										/>
									</Form.Group>
								)}

								{selectedModelConfig && (
									<div className="mb-3">
										<Form.Label className='modal-label'>Selected Configuration</Form.Label>
										<div className="alert alert-info">
											<strong>Model:</strong> {selectedModelConfig.model_display_name}<br/>
											<strong>Provider Instance:</strong> {selectedModelConfig.provider_instance_name}<br/>
											<strong>Model Type:</strong> {selectedModelConfig.model_type || 'N/A'}
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
									<Form.Label className='modal-label'>Model Name *</Form.Label>
									<Form.Control
										type="text"
										value={formData.name}
										required
										onChange={(e) => handleInputChange('name', e.target.value)}
										className='modal-input'
										placeholder="Enter model name"
									/>
								</Form.Group>

								<Form.Group className="mb-3">
									<Form.Label className='modal-label'>Description</Form.Label>
									<Form.Control
										as="textarea"
										value={formData.description}
										onChange={(e) => handleInputChange('description', e.target.value)}
										className='modal-input'
										placeholder="Enter model description"
										rows={3}
									/>
								</Form.Group>
							</Form.Group>

							{/* Model Parameters */}
							{/* Show parameters if we have selectedModelConfig OR if we're in edit mode with existing params */}
							{((selectedModelConfig && Object.keys(selectedModelConfig.params).length > 0) || 
							  (editMode && modelData && modelData.params && Object.keys(modelData.params).length > 0)) && (
								<Form.Group className="mb-3">
									<Form.Label className='modal-section-heading'>
										Model Parameters
									</Form.Label>
									<hr />
									
									{/* If we have selectedModelConfig, use its params structure */}
									{selectedModelConfig && Object.keys(selectedModelConfig.params).length > 0 ? (
										Object.entries(selectedModelConfig.params).map(([paramName, param]) => (
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
										))
									) : (
										/* If we don't have selectedModelConfig but we're in edit mode, show existing params as editable */
										editMode && modelData && modelData.params && Object.entries(modelData.params).map(([paramName, paramValue]) => (
											<Form.Group key={paramName} className="mb-3">
												<Form.Label className='modal-label'>
													{paramName}
												</Form.Label>
												{typeof paramValue === 'boolean' ? (
													<Form.Check
														type="checkbox"
														checked={formData.params[paramName] === true}
														onChange={(e) => handleParamChange(paramName, e.target.checked)}
														label="Enabled"
													/>
												) : typeof paramValue === 'number' ? (
													<Form.Control
														type="number"
														value={formData.params[paramName] || ''}
														onChange={(e) => handleParamChange(paramName, e.target.value)}
														className='modal-input'
														placeholder={`Enter ${paramName}`}
													/>
												) : typeof paramValue === 'object' ? (
													<Form.Control
														as="textarea"
														value={typeof formData.params[paramName] === 'object' ? JSON.stringify(formData.params[paramName], null, 2) : (formData.params[paramName] || '')}
														onChange={(e) => {
															try {
																const parsed = JSON.parse(e.target.value);
																handleParamChange(paramName, parsed);
															} catch {
																// If not valid JSON, store as string
																handleParamChange(paramName, e.target.value);
															}
														}}
														className='modal-input'
														placeholder={`Enter ${paramName} as JSON`}
														rows={3}
													/>
												) : (
													<Form.Control
														type="text"
														value={formData.params[paramName] || ''}
														onChange={(e) => handleParamChange(paramName, e.target.value)}
														className='modal-input'
														placeholder={`Enter ${paramName}`}
													/>
												)}
											</Form.Group>
										))
									)}
								</Form.Group>
							)}
						</>
					)}
				</Modal.Body>

				<Modal.Footer>
					<Button variant="secondary" onClick={onHide} disabled={loading}>
						Cancel
					</Button>
					{(() => {
						console.log('Submit button state:', { 
							loading, 
							formDataName: formData.name, 
							editMode, 
							disabled: loading || !formData.name 
						});
						return null;
					})()}
					<Button variant="primary" type='submit' disabled={loading || !formData.name}>
						{loading ? (editMode ? 'Updating...' : 'Registering...') : (editMode ? 'Update Model' : 'Register Model')}
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};

export default CompanyModelModal;
