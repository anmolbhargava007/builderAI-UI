import './WorkFlowCanvas.scss'
import NodeSettingsModal from "../../../../Modal/NodeSettingModal/NodeSettingModal";
import { RxPlus } from "react-icons/rx";
import { FiSettings, FiX } from "react-icons/fi";
import { createPortal } from "react-dom";
import { Handle, useReactFlow, useStore } from "reactflow";
import { useEffect, useRef, useState } from 'react';
import agenticon from '../../../../assets/agent.svg'
import { useFlowContext } from '../../../../context/FlowContext';


const CustomNode = ({ id, data }) => {
	const { setNodes, getNodes } = useReactFlow();
	const { agentList, addAgentNode } = useFlowContext(); // Access data from FlowContext
	const [showDropdown, setShowDropdown] = useState(false);
	const dropdownButtonRef = useRef(null);
	const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0 });
	const [settingModal, setSettingModal] = useState(false)
	const [formValues, setFormValues] = useState([]);
	const allNodes = getNodes();

	function getValueByName(targetName) {
		const found = data.params?.find(param => param.name === targetName);
		return found ? found.value : "Not Present";
	}

	const openSettingModal = (params) => {
		// Create a deep copy of the params to avoid direct mutations
		setFormValues(JSON.parse(JSON.stringify(params || [])));
		setSettingModal(true)
	}

	// Save changes from modal to the node data
	const saveNodeSettings = () => {
		setNodes(nodes =>
			nodes.map(node => {
				if (node.id === id) {
					// Update the node's data with the new form values
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


	useEffect(() => {
		let animationFrameId;
		const updatePosition = () => {
			if (showDropdown && dropdownButtonRef.current) {
				const rect = dropdownButtonRef.current.getBoundingClientRect();
				setDropdownStyle({
					top: rect.bottom + window.scrollY,
					left: rect.left + window.scrollX,
				});
			}
		};
		// Listen for scroll, resize, and animation frame (for drag)
		const handleMove = () => {
			updatePosition();
			animationFrameId = requestAnimationFrame(handleMove); // keep tracking during drag
		};
		if (showDropdown) {
			handleMove(); // start tracking
		}

		return () => {
			cancelAnimationFrame(animationFrameId); // clean up
		};
	}, [showDropdown]);



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
	}

	return (
		<div className={`customNode ${getValueByName("name") === "Start" ? "startNode" : ""}`}>
			<div className="node-controll">
				<div className="node-label">
					<img src={data.uiConfig.icon} alt="agent icon" />
					<span className="node-name" title={getValueByName("name")}>
						{getValueByName("name")}
					</span>
				</div>
				<div style={{ display: 'flex', alignItems: 'center', gap: "4px" }}>
					{data.nodeType === 'Team' && (
						<div ref={dropdownButtonRef}>
							<RxPlus
								onClick={() => setShowDropdown(prev => !prev)}
								style={{ cursor: 'pointer', marginRight: 2 }}
							/>
						</div>
					)}
					<FiSettings onClick={() => openSettingModal(data.params)} />
					{getValueByName("name") !== 'Start' && (
						<FiX
							onClick={deleteNodes}
							style={{ cursor: 'pointer', color: 'red' }}
						/>)}

				</div>
			</div>

			{data.nodeType === 'Team' && showDropdown && createPortal(
				<div className="chatmanager-dropdown"
					style={{ position: "absolute", top: dropdownStyle.top, left: dropdownStyle.left }}>
					{agentList.map((option) => (
						<div key={option.id} onClick={() => {
							addAgentNode(option, agenticon, id); setShowDropdown(false);
						}}
							style={{ padding: '6px', cursor: 'pointer', borderBottom: '1px solid #ddd' }}
						>
							{option.name}
						</div>
					))}
				</div>,
				document.body
			)}

			{!data.isChild && (
				<>
					{/* Always show right source handle */}
					<Handle type="source" position="right" id="right-outgoing" />

					{/* Show left target handle only if it's NOT the Start node */}
					{getValueByName("name") !== "Start" && (
						<Handle type="target" position="left" id="left-incoming" />
					)}
				</>
			)}

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
export default CustomNode;
