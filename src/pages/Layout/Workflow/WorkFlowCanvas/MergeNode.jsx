import React from 'react';
import { Handle } from "reactflow";
import NodeSettingsModal from "../../../../Modal/NodeSettingModal/NodeSettingModal";
import { FiSettings, FiX } from "react-icons/fi";
import { useReactFlow } from "reactflow";
import { useState } from 'react';
import './MergeNode.scss';

const MergeNode = ({ id, data }) => {
	const { setNodes, getNodes } = useReactFlow();
	const [settingModal, setSettingModal] = useState(false);
	const [formValues, setFormValues] = useState([]);
	const allNodes = getNodes();

	function getValueByName(targetName) {
		const found = data.params?.find(param => param.name === targetName);
		return found ? found.value : "Not Present";
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
					return {
						...node,
						data: {
							...node.data,
							params: formValues
						}
					};
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

	return (
		<div className="customNode mergeNode">
			<div className="node-controll">
				<div className="node-label">
					<img src={data.uiConfig.icon} alt="merge icon" />
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

			{/* Merge node content */}
			<div className="merge-display">
				<div className="merge-content">
					<span className="merge-text">
						{getValueByName("description") || "Merge multiple branches back into a single flow"}
					</span>
				</div>
			</div>

			{/* Target handle for incoming connections from multiple branches */}
			<Handle type="target" position="left" id="left-incoming" />
			
			{/* Source handle for outgoing connection */}
			<Handle type="source" position="right" id="right-outgoing" />

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

export default MergeNode; 