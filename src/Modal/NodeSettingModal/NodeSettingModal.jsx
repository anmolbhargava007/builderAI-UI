import React, { useState } from 'react';
import { Modal, Button, Form, Overlay, Tooltip } from 'react-bootstrap';
import './NodeSettingModal.scss';
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css";
import Select from 'react-select';
import ConditionComponent from './ConditionComponent';

// Info Tooltip Component
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

const NodeSettingsModal = ({ show, onHide, onSave, formValues, setFormValues, data,allNodes }) => {
	// Handle field changes for array items
	const handleParamChange = (index, key, value) => {
		const updatedParams = [...formValues];
		updatedParams[index] = { ...updatedParams[index], value };

		setFormValues((prev) => {
			if (Array.isArray(prev)) {
				return updatedParams;
			} else {
				return { ...prev, [key]: value, params: updatedParams };
			}
		});
	};

	// For IFELSE nodeType, handle condition1, condition2, ... as a flat list
	const isIfElse = data?.nodeType === 'IFELSE';

	// Check if this is a connector method
	const isConnectorMethod = data?.methodid;

	// Get output format for connector methods
	const getOutputFormat = () => {
		if (!isConnectorMethod) return null;
		
		// Find the connector method in the connector list
		// This would need to be passed from the parent component or fetched
		// For now, we'll look for output in the data structure
		const outputData = data?.output || null;
		return outputData;
	};

	const getIfElseConditions = () => {
		return (formValues || [])
			.filter(param => param.name.startsWith('condition'))
			.map((param, idx) => ({
				id: idx + 1,
				operator: param.value?.operator || 'contains',
				text: param.value?.value || ''
			}));
	};

	const handleIfElseConditionChange = (idx, field, value) => {
		setFormValues(prev => prev.map((param, i) => {
			if (param.name.startsWith('condition') && (getIfElseConditions().findIndex((c, ci) => ci === idx) === i - prev.filter(p => !p.name.startsWith('condition')).length)) {
				return {
					...param,
					value: {
						...param.value,
						[field]: value
					}
				};
			}
			return param;
		}));
	};

	const addIfElseCondition = () => {
		const count = getIfElseConditions().length;
		setFormValues(prev => ([
			...prev,
			{
				name: `condition${count + 1}`,
				displayname: `Condition ${count + 1}`,
				description: `If-Else Condition ${count + 1}`,
				valuetype: 'condition',
				isencrypted: false,
				isrequired: false,
				iseditable: true,
				value: { operator: 'contains', value: '' }
			}
		]));
	};

	const removeIfElseCondition = (idx) => {
		let nonConditionParams = formValues.filter(p => !p.name.startsWith('condition'));
		let conditions = formValues.filter(p => p.name.startsWith('condition'));
		conditions.splice(idx, 1);
		// Re-index
		conditions = conditions.map((cond, i) => ({ ...cond, name: `condition${i + 1}`, displayname: `Condition ${i + 1}` }));
		setFormValues([...nonConditionParams, ...conditions]);
	};

	return (
		<Modal show={show} onHide={onHide} size="lg" centered>
			<Modal.Header closeButton style={{ border: "none" }}>
				{/* <Modal.Title><span><img src={data.image} /></span>{data.label}</Modal.Title> */}
				<Modal.Title>Component Settings</Modal.Title>
			</Modal.Header>
			<Form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
				<Modal.Body>
					{/* IFELSE nodeType: render dynamic condition fields */}
					{isIfElse ? (
						<>
							{formValues && formValues.filter(param => !param.name.startsWith('condition')).map((param, index) => (
								<Form.Group className="mb-3" key={index}>
									{param.sectionheading && (
										<>
											<Form.Label className='modal-section-heading'>
												{param.sectionheading}
											</Form.Label>
											<hr />
										</>
									)}
									<Form.Label className='modal-label'>
										<InfoTooltip description={param.description} paramName={param.displayname}>
											{param.displayname}{param.isrequired && <span className="required-asterisk">*</span>}
										</InfoTooltip>
									</Form.Label>
									{param.valuetype === 'string' && (
										<Form.Control
											type="text"
											value={param.value || ''}
											required={param.isrequired}
											onChange={(e) => handleParamChange(index, param.name, e.target.value)}
											className='modal-input'
											placeholder={param.description}
											disabled={param.iseditable === false}
										/>
									)}
									{param.valuetype === 'integer' && (
										<Form.Control
											type="number"
											value={param.value || ''}
											required={param.isrequired}
											onChange={(e) => handleParamChange(index, param.name, e.target.value)}
											className='modal-input'
											placeholder={param.description}
											disabled={param.iseditable === false}
										/>
									)}
									{param.valuetype === 'text' && (
										<Form.Control
											as="textarea"
											value={param.value || ''}
											required={param.isrequired}
											onChange={(e) => handleParamChange(index, param.name, e.target.value)}
											className='modal-input'
											placeholder={param.description}
											disabled={param.iseditable === false}
										/>
									)}
									{param.valuetype === 'options' && (
										<Form.Select value={param.value || ''}
											required={param.isrequired}
											onChange={(e) => handleParamChange(index, param.name, e.target.value)}
											className='modal-input'
											placeholder={param.description}
											disabled={param.iseditable === false}
										>
											<option value="">Select {param.displayname}</option>
											{param.options.map((option, idx) => (
												<option value={option.value} key={idx}>{option.label}</option>
											))}
										</Form.Select>
									)}
									{param.valuetype === 'multioptions' && (
										<Select
											isMulti
											options={param.options.map(opt => ({ value: opt.value, label: opt.label }))}
											value={param.value || []}
											onChange={(selected) => handleParamChange(index, param.name, selected)}
											isDisabled={param.iseditable === false}
											placeholder={`Select ${param.displayname}`}
										/>
									)}
									{param.valuetype === 'boolean' && (
										<Form.Check
											type="checkbox"
											checked={param.value ==true}
											required={param.isrequired}
											onChange={(e) => handleParamChange(index, param.name, e.target.checked)}
											label={param.description}
											// className='modal-input'
										/>
									)}
									{param.valuetype === 'quill' && (
										<ReactQuill
											value={param.value || ''}
											onChange={(value) => handleParamChange(index, param.name, value)}
											// className='modal-input'
											placeholder={param.description}
											disabled={param.iseditable === false}
										/>
									)}
									{param.valuetype === 'conditions' && (
										<ConditionComponent
											conditions={param.value?.conditions || []}
											onChange={(updatedConditions) => {
												const updatedValue = { ...param.value, conditions: updatedConditions };
												handleParamChange(index, param.name, updatedValue);
											}}
										/>
									)}
								</Form.Group>
							))}
							<div className="mb-3">
								<label className="modal-section-heading">Conditions</label>
								{getIfElseConditions().map((cond, idx) => (
									<div key={idx} className="d-flex align-items-center mb-2 gap-2">
										<span className="me-2" style={{ fontWeight: 'bold', minWidth: '60px' }}>Message</span>
										<Form.Select
											value={cond.operator}
											onChange={e => handleIfElseConditionChange(idx, 'operator', e.target.value)}
											className='modal-input'
											style={{ width: 180 }}
										>
											<option value="contains">Contains</option>
											<option value="does_not_contain">Does not contain</option>
										</Form.Select>
										<Form.Control
											type="text"
											value={cond.text}
											onChange={e => handleIfElseConditionChange(idx, 'value', e.target.value)}
											className='modal-input'
											placeholder="Enter text to check"
											style={{ width: 220 }}
										/>
										{/* Replace Remove button with delete icon */}
										<span
											style={{ 
												cursor: getIfElseConditions().length === 1 ? 'not-allowed' : 'pointer', 
												color: getIfElseConditions().length === 1 ? '#ccc' : '#dc3545', 
												fontSize: '1.2rem', 
												display: 'flex', 
												alignItems: 'center' 
											}}
											onClick={() => getIfElseConditions().length > 1 && removeIfElseCondition(idx)}
										>
											{/* Use a trash/delete icon from react-icons */}
											<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
												<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5.5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6zm2 .5a.5.5 0 0 1 .5-.5.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6z"/>
												<path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2h3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3a1 1 0 0 1 1 1zm-3-1a.5.5 0 0 0-.5-.5h-3A.5.5 0 0 0 7 2h2a.5.5 0 0 0 .5-.5zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3a.5.5 0 0 0-.5.5V4h12v-.5a.5.5 0 0 0-.5-.5h-11z"/>
											</svg>
										</span>
									</div>
								))}
								<Button variant="outline-primary" size="sm" onClick={addIfElseCondition}>Add Condition</Button>
							</div>
						</>
					) : (
						// Default rendering for other node types
						<>
							{/*Loop through the formValues to create input fields dynamically*/}
							{formValues && formValues.map((param, index) => (
								<Form.Group className="mb-3" key={index}>
									{param.sectionheading && (
										<>
											<Form.Label className='modal-section-heading'>
												{param.sectionheading}
											</Form.Label>
											<hr />
										</>
									)}
									<Form.Label className='modal-label'>
										<InfoTooltip description={param.description} paramName={param.displayname}>
											{param.displayname}{param.isrequired && <span className="required-asterisk">*</span>}
										</InfoTooltip>
									</Form.Label>
									{param.valuetype === 'string' && (
										<Form.Control
											type="text"
											value={param.value || ''}
											required={param.isrequired}
											onChange={(e) => handleParamChange(index, param.name, e.target.value)}
											className='modal-input'
											placeholder={param.description}
											disabled={param.iseditable === false}
										/>
									)}
									{param.valuetype === 'integer' && (
										<Form.Control
											type="number"
											value={param.value || ''}
											required={param.isrequired}
											onChange={(e) => handleParamChange(index, param.name, e.target.value)}
											className='modal-input'
											placeholder={param.description}
											disabled={param.iseditable === false}
										/>
									)}
									{param.valuetype === 'text' && (
										<Form.Control
											as="textarea"
											value={param.value || ''}
											required={param.isrequired}
											onChange={(e) => handleParamChange(index, param.name, e.target.value)}
											className='modal-input'
											placeholder={param.description}
											disabled={param.iseditable === false}
										/>
									)}
									{param.valuetype === 'options' && (
										<Form.Select value={param.value || ''}
											required={param.isrequired}
											onChange={(e) => handleParamChange(index, param.name, e.target.value)}
											className='modal-input'
											placeholder={param.description}
											disabled={param.iseditable === false}
										>
											<option value="">Select {param.displayname}</option>
											{param.options.map((option, idx) => (
												<option value={option.value} key={idx}>{option.label}</option>
											))}
										</Form.Select>
									)}
									{param.valuetype === 'multioptions' && (
										<Select
											isMulti
											options={param.options.map(opt => ({ value: opt.value, label: opt.label }))}
											value={param.value || []}
											onChange={(selected) => handleParamChange(index, param.name, selected)}
											isDisabled={param.iseditable === false}
											placeholder={`Select ${param.displayname}`}
										/>
									)}
									{param.valuetype === 'boolean' && (
										<Form.Check
											type="checkbox"
											checked={param.value ==true}
											required={param.isrequired}
											onChange={(e) => handleParamChange(index, param.name, e.target.checked)}
											label={param.description}
											// className='modal-input'
										/>
									)}
									{param.valuetype === 'quill' && (
										<ReactQuill
											value={param.value || ''}
											onChange={(value) => handleParamChange(index, param.name, value)}
											// className='modal-input'
											placeholder={param.description}
											disabled={param.iseditable === false}
										/>
									)}
									{param.valuetype === 'conditions' && (
										<ConditionComponent
											conditions={param.value?.conditions || []}
											onChange={(updatedConditions) => {
												const updatedValue = { ...param.value, conditions: updatedConditions };
												handleParamChange(index, param.name, updatedValue);
											}}
										/>
									)}
								</Form.Group>
							))}

							{/* Output Format Section for Connector Methods */}
							{isConnectorMethod && getOutputFormat() && (
								<Form.Group className="mb-3">
									<Form.Label className='modal-section-heading'>
										Output Format
									</Form.Label>
									<hr />
									<Form.Label className='modal-label'>
										<InfoTooltip 
											description={JSON.stringify(getOutputFormat(), null, 2)} 
											paramName="Output Format"
										>
											Output Format
										</InfoTooltip>
									</Form.Label>
									<Form.Control
										as="textarea"
										value={JSON.stringify(getOutputFormat(), null, 2)}
										className='modal-input'
										readOnly
										disabled={true}
										style={{
											backgroundColor: '#f8f9fa',
											border: '1px solid #dee2e6',
											color: '#6c757d',
											fontFamily: 'monospace',
											fontSize: '12px',
											minHeight: '120px'
										}}
									/>
								</Form.Group>
							)}
						</>
					)}
				</Modal.Body>

				<Modal.Footer>
					<Button variant="secondary" onClick={onHide}>
						Cancel
					</Button>
					<Button variant="primary" type='submit'>
						Save
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};

export default NodeSettingsModal;
