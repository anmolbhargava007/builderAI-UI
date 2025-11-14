import React from 'react';
import { Handle } from "reactflow";
import NodeSettingsModal from "../../../../Modal/NodeSettingModal/NodeSettingModal";
import { FiSettings, FiX } from "react-icons/fi";
import { useReactFlow } from "reactflow";
import { useState } from 'react';
import './IfElseNode.scss';

const IfElseNode = ({ id, data }) => {
	const { setNodes, getNodes } = useReactFlow();
	const [settingModal, setSettingModal] = useState(false);
	const [formValues, setFormValues] = useState([]);
	const allNodes = getNodes();

	function getValueByName(targetName) {
		const found = data.params?.find(param => param.name === targetName);
		return found ? found.value : "Not Present";
	}

	// Get conditions for if-else nodes
	const getConditions = () => {
		const conditionsParam = data.params?.find(param => param.name === 'conditions');
		const conditions = conditionsParam?.value?.conditions || [];
		// Return empty array by default - no conditions initially
		return conditions;
	};

	// Helper to get all condition params for IFELSE node
	function getIfElseConditions() {
		if (data.nodeType !== 'IFELSE') return [];
		// Find all params named condition1, condition2, ...
		return (data.params || [])
			.filter(param => param.name.startsWith('condition'))
			.map((param, idx) => ({
				id: idx + 1,
				operator: param.value?.operator || 'contains',
				text: param.value?.value || ''
			}));
	}

	const openSettingModal = (params) => {
		// Create a deep copy of the params to avoid direct mutations
		setFormValues(JSON.parse(JSON.stringify(params || [])));
		setSettingModal(true);
	};

	// Save changes from modal to the node data
	const saveNodeSettings = () => {
		setNodes(nodes =>
			nodes.map(node => {
				if (node.id === id) {
					// For IFELSE, flatten conditions into condition1, condition2, ...
					if (node.data.nodeType === 'IFELSE') {
						// formValues may have condition1, condition2, ... or just one
						let newParams = formValues.filter(p => !p.name.startsWith('condition'));
						// Find all condition fields in formValues
						let conditions = formValues.filter(p => p.name.startsWith('condition'));
						// Re-index them as condition1, condition2, ...
						conditions = conditions.map((cond, idx) => ({
							...cond,
							name: `condition${idx + 1}`,
							displayname: `Condition ${idx + 1}`
						}));
						newParams = [...newParams, ...conditions];
						return {
							...node,
							data: {
								...node.data,
								params: newParams
							}
						};
					} else {
						// Default save for other node types
						return {
							...node,
							data: {
								...node.data,
								params: formValues
							}
						};
					}
				}
				return node;
			})
		);
		setSettingModal(false);
	};

	const deleteNodes = () => {
		setNodes((prevNodes) => {
			const nodeToDelete = prevNodes.find(n => n.id === id);
			if (!nodeToDelete || !nodeToDelete.parentNode) {
				return prevNodes.filter(n => n.id !== id && n.parentNode !== id);
			}

			const parentId = nodeToDelete.parentNode;

			const updatedNodes = prevNodes.filter(n => n.id !== id);

			const siblingChildren = updatedNodes
				.filter(n => n.parentNode === parentId)
				.sort((a, b) => a.position.y - b.position.y);

			const repositionedNodes = updatedNodes.map(n => {
				if (n.parentNode === parentId) {
					const newIndex = siblingChildren.findIndex(child => child.id === n.id);
					return {
						...n,
						position: {
							...n.position,
							y: 40 + newIndex * 40
						}
					};
				}
				return n;
			});

			const parentIndex = repositionedNodes.findIndex(n => n.id === parentId);
			if (parentIndex >= 0) {
				const newHeight = Math.max(200, siblingChildren.length * 40 + 80);
				repositionedNodes[parentIndex] = {
					...repositionedNodes[parentIndex],
					style: {
						...repositionedNodes[parentIndex].style,
						height: newHeight
					}
				};
			}

			return repositionedNodes;
		});
	};

	const conditions = data.nodeType === 'IFELSE' ? getIfElseConditions() : getConditions();

	return (
		<div className="customNode ifElseNode">
			<div className="node-controll">
				<div className="node-label">
					<img src={data.uiConfig.icon} alt="agent icon" />
					<span className="node-name" title={getValueByName("name")}>
						{getValueByName("name")}
					</span>
				</div>
				<div style={{ display: 'flex', alignItems: 'center', gap: "4px" }}>
					<FiSettings onClick={() => openSettingModal(data.params)} />
					<FiX
						onClick={deleteNodes}
						style={{ cursor: 'pointer', color: 'red' }}
					/>
				</div>
			</div>


			{/* Display conditions for if-else nodes */}
			{conditions.length > 0 ? (
				<div className="conditions-display">
					{conditions.map((condition, index) => (
						<div key={condition.id || index} className="condition-item" onClick={() => openSettingModal(data.params)}>
							<div className="condition-content">
								<span className="condition-label">Condition {condition.id || index + 1}</span>
								<span className="condition-text">
									{condition.operator === 'contains' ? 'Contains' : 'Does not contain'}: {condition.text || 'Click to configure'}
								</span>
							</div>
							{/* Handle for edge connection next to each condition */}
							<Handle
								type="source"
								position="right"
								id={`condition${index + 1}`}
								style={{
									top: '50%',
									right: '-4px',
									width: '10px',
									height: '10px',
									borderRadius: '50%',
									background: '#ff0087',
									border: '2px solid white',
									boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
									zIndex: 1000
								}}
							/>
						</div>
					))}
				</div>
			) : (
				<div className="conditions-display">
					<div className="condition-item" onClick={() => openSettingModal(data.params)}>
						<div className="condition-content">
							<span className="condition-text" style={{ color: '#666', fontStyle: 'italic' }}>
								No conditions configured - Click to add conditions
							</span>
						</div>
					</div>
				</div>
			)}

			{/* Always show left target handle */}
			<Handle type="target" position="left" id="left-incoming" />

			<NodeSettingsModal
				show={settingModal}
				onHide={() => setSettingModal(false)}
				formValues={formValues}
				setFormValues={setFormValues}
				data={data}
				allNodes={allNodes}
				onSave={saveNodeSettings}
			/>
		</div>
	);
};

export default IfElseNode; 