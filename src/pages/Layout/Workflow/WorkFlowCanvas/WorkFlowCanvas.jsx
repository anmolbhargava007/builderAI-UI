import React, { useState, useCallback, useEffect, useRef, version } from "react";
import ReactFlow, { addEdge, Background, Controls, useNodesState, useEdgesState, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import { FaPlus } from "react-icons/fa";
import "./WorkFlowCanvas.scss";
import ComponentLibrary from "../../../../Modal/ComponentLibrary/ComponentLibrary";
import starticon from '../../../../assets/start.svg'
import mergeicon from '../../../../assets/merge.svg'
import CustomNode from "./CustomNode";
import IfElseNode from "./IfElseNode";
import MergeNode from "./MergeNode";
import { IoIosRocket, IoMdArrowBack, IoMdSave } from "react-icons/io";
import { PiPlayFill } from "react-icons/pi";
import { TbSettings2 } from "react-icons/tb";
import { GoChecklist } from "react-icons/go";
import WorkFlowService from '../../../../services/workflowservice'
import MessageLoader from '../../../../Modal/MessageLoader/MessageLoader'
import { BeatLoader } from "react-spinners";
import { FlowProvider } from '../../../../context/FlowContext';
import { Box, Menu, MenuItem, Typography } from "@mui/material";
import { MdOutlinePublish, MdSaveAlt } from "react-icons/md";
import WorkFlowSettingModal from "../../../../Modal/WorkFlowSettingModal/WorkFlowSettingModal";
import TestModal from "../../../../Modal/TestModal/TestModal";
import { MdSaveAs } from "react-icons/md";
import { BsLightningChargeFill } from "react-icons/bs";
import { AiFillDelete } from "react-icons/ai";
import { useToast } from "../../../../context/ToastContext";

// Constants
const NODE_NAME_DESCRIPTION = "Name of the Node. Only alphanumeric along with underscore allowed.";

const nodeTypes = { 
	agent: CustomNode,
	ifElse: IfElseNode,
	merge: MergeNode
};

const WorkFlowCanvas = (props) => {
	const { handleView, workflowData, setWorkflowData, setWorkflows, workflows, getAllworkflow } = props
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const [agentList, setAgentList] = useState([])
	const [teamList, setTeamList] = useState([])
	const [llmList, setLlmList] = useState([])
	const [toolList, setToolList] = useState([])
	const [kbSubTypeList, setKbSubTypeList] = useState([])
	const [connectorList, setConnectorList] = useState([])
	const [conditionList, setConditionList] = useState([])
	const [openLibrary, setOpenLibrary] = useState(false);
	const [selectedVersion, setSelectedVersion] = useState('')
	const [loader, setLoader] = useState(false)
	const [messageHeader, setMessageHeader] = useState('')
	const [isSaved, setIsSaved] = useState(true)
	const [isInitialLoad, setIsInitialLoad] = useState(true); // New flag
	const nodeIdCounter = useRef(1);
	const [anchorElUser, setAnchorElUser] = useState(null);
	const [showTestModal, setShowTestModal] = useState(false);
	const [workflowSetting, setWorkflowSetting] = useState({ executionTime: 10, finalAgent: '' })
	const nameRef = useRef(null);
	const [showNameTooltip, setShowNameTooltip] = useState(false);
	const[showChatModal,setShowChatModal]=useState(false)
	const handleChatModalOpen=()=>setShowChatModal(true)
	const handleChatModalClose=()=>setShowChatModal(false)
	const handleOpenModal = () => setShowTestModal(true);
	const handleCloseModal = () => setShowTestModal(false);
	const [open, setOpen] = useState(false);
	const roles = (localStorage.getItem("role") || "").split(",").map(role => role.trim());
	const onlyAdmin = roles.length === 1 && roles.includes("Admin")
	const onlyUser = roles.length === 1 && roles.includes("User")
	const userAndAdminonly = roles.length == 2 && roles.includes("Admin") && roles.includes("User");
	const blockedAccess = onlyAdmin || onlyUser || userAndAdminonly;
	const { showToast } = useToast()



	useEffect(() => {
		getAllComponents();
		// Initialize condition list with If-Else and Merge
		setConditionList([
			{
				id: 'if-else',
				name: 'If-Else',
				type: 'Condition',
				description: 'Conditional branching based on a condition'
			},
			{
				id: 'merge',
				name: 'Merge',
				type: 'Condition',
				description: 'Merge multiple branches back into a single flow',
				icon: mergeicon
			}
		]);
	}, [])
	useEffect(() => {
		if (!workflowData) return; // early return if no data

		setIsInitialLoad(true);
		if (workflowData && workflowData?.latestversiondata) {
			setSelectedVersion(workflowData.latestversiondata.id)
		}
		if (workflowData && workflowData?.latestversiondata?.uicontent) { // Loading existing workflow
			let uicontent = JSON.parse(workflowData.latestversiondata.uicontent)
			if (uicontent?.nodes) {
				setNodes(uicontent.nodes)
				nodeIdCounter.current = uicontent.nodes.length; // Set the counter based on existing nodes
			}
			if (uicontent?.edges) {
				setEdges(uicontent.edges)
			}

			// Restore workflow settings from the saved content
			if (workflowData.latestversiondata.content) {
				try {
					const content = JSON.parse(workflowData.latestversiondata.content);
					if (content.executionTime !== undefined) {
						setWorkflowSetting(prev => ({
							...prev,
							executionTime: content.executionTime
						}));
					}
					if (content.result?.nodename) {
						setWorkflowSetting(prev => ({
							...prev,
							finalAgent: content.result.nodename
						}));
					}
				} catch (e) {
					console.log('Error parsing workflow content:', e);
				}
			}

			setIsSaved(true);
		}
		else { // Initialize the start node
			setNodes((nds) => [
				...nds,
				{
					id: "0",
					type: "agent",
					nodeType: "Start",
					position: { x: 100, y: 200 },
					data: {
						uiConfig: {
							icon: starticon
						},
						params: [
							{
								name: "name", displayname: "Component Name", description: NODE_NAME_DESCRIPTION, valuetype: "string", isencrypted: false, isrequired: true, iseditable: false, value: "Start"
							},
							{
								name: "descrition", displayname: "Component Description", description: "Start of Workflow", valuetype: "text", isencrypted: false, isrequired: true, iseditable: false, value: "Start of Workflow"
							},
							{
								name: "inupt_type", displayname: "Input", description: "Input Type", valuetype: "options", options:
									[{ label: "Text", value: "text" }, { label: "File", value: "file" }, { label: "Both", value: "both" }, { label: "None", value: "none" }], isencrypted: false, isrequired: true, iseditable: true, value: "none"
							},
							{
								name: "chat", displayname: "Chat", description: "Enable chat at workflow start", valuetype: "boolean", isencrypted: false, isrequired: false, iseditable: true, value: "false"
							},
						],
					},

				},
			]);
			setIsSaved(false)
		}
		setTimeout(() => setIsInitialLoad(false), 100);
	}, [workflowData])

	const getAllComponents = async () => {
		setLoader(true)
		setMessageHeader('Fetching Component Library')
		const payload = {
			userid: localStorage.getItem("user_id"),
			compid: localStorage.getItem("comp_id")
		}
		try {
			const res = await WorkFlowService.getComponent(payload.compid, payload.userid)
			if (res.status === 200) {
				setAgentList(res.data.agents)
				setTeamList(res.data.teams)
				setLlmList(res.data.models)
				setToolList(res.data.tools)
				setKbSubTypeList(res.data.kbsubtypes)
				setConnectorList(res.data.connectors)

			}
		} catch (e) {
			console.log(e)
		} finally {
			setLoader(false)
		}
	}

	useEffect(() => {
		previousNodeIds.current = new Set(nodes.map(n => n.id));
	}, [nodes]);

	const previousNodeIds = useRef(new Set());

	useEffect(() => {
		if (!isInitialLoad) {
			setIsSaved(false); // ✅ Satisfies requirement 3
		}
	}, [nodes, edges]);

	const removeHtmlTags = (html) => {
		if (!html) return "";
		const doc = new DOMParser().parseFromString(html, "text/html");
		return doc.body.textContent || "";
	};
	const delteWorkflow = async () => {
		setLoader(true)
		setMessageHeader('Deleting Workflow')
		try {
			const payload = {
				workflowid: workflowData.workflowid,
				userid: localStorage.getItem("user_id"),
				compid: localStorage.getItem("comp_id"),
				useremail: localStorage.getItem("email"),
			}
			const res = await WorkFlowService.deleteWorkflow(payload)
			if (res.status === 200) {
				// setWorkflows(workflows.filter(w => w.workflowid !== workflowData.workflowid));
				handleView("list", null);
				getAllworkflow()
			}
		} catch (e) {
			console.log(e)
		} finally {
			setLoader(false)
		}
	}
	const publishWorkflow = async () => {
		setLoader(true)
		setMessageHeader("Publishing Workflow")
		const payload = {
			compid: localStorage.getItem("comp_id"),
			userid: localStorage.getItem("user_id"),
			useremail: localStorage.getItem("email"),
			workflowid: workflowData.workflowid,
			workflowversionid: selectedVersion,
			envstatus:workflowData.envstatus
		}
		try {
			const res = await WorkFlowService.publishWorkflow(payload)
			// setReadonly(true)

		} catch (err) {
			console.log(err)
		} finally {
			setLoader(false)
		}
	}
	const make_latest_version = async () => {
		setLoader(true)
		setMessageHeader("Publishing Workflow")
		const payload = {
			compid: localStorage.getItem("comp_id"),
			userid: localStorage.getItem("user_id"),
			useremail: localStorage.getItem("email"),
			workflowid: workflowData.workflowid,
			versionnumber: workflowData.versions[0].versionnumber,
		}
		try {
			const res = await WorkFlowService.change_latest_version(payload)

		} catch (err) {
			console.log(err)
		} finally {
			setLoader(false)
		}
	}
	const delteWorkflowVerion = async () => {
		setLoader(true)
		setMessageHeader('Deleting Workflow')
		try {
			const payload = {
				workflowid: workflowData.workflowid,
				userid: localStorage.getItem("user_id"),
				compid: localStorage.getItem("comp_id"),
				useremail: localStorage.getItem("email"),
				workflowversionid: selectedVersion
			}
			const res = await WorkFlowService.delteWorkflowVerion(payload)
		} catch (e) {
			console.log(e)
		} finally {
			setLoader(false)
		}
	}

	const createWorkflowContent = async () => {
		let validationErrors = [];
		const buildNodeData = (node, allNodes) => {
			console.log("buildNodeData",node)
			const paramsObject = {
				componentid: node.data.componentid || "",
				prompts: {},
				methodid: node.data.methodid || ""
			};

			const childNodes = allNodes.filter(child => child.parentNode === node.id);
			node.data.params.forEach(param => {
				console.log("params",param)
				if (param.name !== "name" && param.name !== "description") {
					if (param.name == 'persona' || param.name == 'task' || param.name == 'instructions' || param.name == 'boundaryConditions' || param.name == 'terminationCondition' || param.name == 'additional' || param.name == 'sampleInputOutput') {
						paramsObject.prompts[param.name] = removeHtmlTags(param.value);
					}
					else {
						paramsObject[param.name] = param.value;
					}
				}
				if (param.name === "tools" && Array.isArray(param.value)) {
					paramsObject.tools = param.value.map((tool) => ({
						id: crypto.randomUUID(),
						params: {
							name: tool.label,
							companycomponentid: tool.value
						}
					}));
				}

				// Only perform required validation if nodeType is not 'Condition'
				if (node.nodeType !== 'IFELSE' && param.isrequired && (!param.value || param.value.trim() === "")) {
					validationErrors.push({
						agentname: node.data.params.find(p => p.name === "name")?.value,
						fieldname: param.displayname,
						errormsg: `${param.displayname} is required.`
					});
				}
			});

			return {
				id: node.id,
				type: node.type,
				nodeType: node.nodeType,
				name: node.data.params.find(param => param.name === "name")?.value || "",
				description: node.data.params.find(param => param.name === "description")?.value || "",
				params: paramsObject,
				nodes: childNodes.map(child => buildNodeData(child, allNodes))
			};
		};

		const jsonSnapshot = {
			executionTime: workflowSetting.executionTime,
			result: {
				nodename: workflowSetting.finalAgent,
			},
			nodes: nodes.filter(node => !node.parentNode).map(parentNode => buildNodeData(parentNode, nodes)),
			edges: edges.map(edge => ({
				id: edge.id,
				source: edge.source,
				target: edge.target,
				sourceHandle: edge.sourceHandle,
				targetHandle: edge.targetHandle,
				style: edge.style,
				markerEnd: edge.markerEnd,
				data: edge.data // Include edge data like conditionsource
			}))
		};

		return { jsonSnapshot, validationErrors };
	}

	const onNodesChangeEnhanced = useCallback((changes) => {
		const isReset = changes.every(change => change.type === 'reset');
		if (isReset) {
			const currentNodeIds = new Set(changes.map(change => change.item?.id || change.id));
			const removedNodeIds = [...previousNodeIds.current].filter(id => !currentNodeIds.has(id));
			if (removedNodeIds.length > 0) {
				setEdges((eds) =>
					eds.filter(
						(e) =>
							!removedNodeIds.includes(e.source) &&
							!removedNodeIds.includes(e.target)
					)
				);
			}

			// Update ref with new state
			previousNodeIds.current = currentNodeIds;
		}

		onNodesChange(changes);
	}, [onNodesChange, setEdges]);

	const addWorkflow = async (new_version_flag = false) => {
		setLoader(true)
		setMessageHeader('saving the workflow data')
		try {
			const { validationErrors, jsonSnapshot } = await createWorkflowContent();
			if (validationErrors.length > 0) {
				setLoader(false);
				const errorMessage = validationErrors
					.map(error => `${error.agentname} →  ${error.errormsg}`)
					.join('\n');
				showToast(errorMessage, 'danger', false);
				return false;
			}
			const nodeNames=nodes.map(node=>{
				const nameParam=node.data?.params?.find(p=>p.name==='name');
				return nameParam?.value?.trim()
			}).filter(Boolean)
			const duplicates=nodeNames.filter((name,index,arr)=>arr.indexOf(name)!==index)
			if(duplicates.length>0){
				const uniqueDuplicates=[...new Set(duplicates)]
				showToast(`Duplicate node names found: ${uniqueDuplicates.join(', ')}`, 'danger', false);
				return false;
			}
			const payload = {
				compid: localStorage.getItem('comp_id'),
				useremail: localStorage.getItem('email'),
				userid: localStorage.getItem("user_id"),
				workflowid: workflowData?.workflowid || null,
				new_version_flag: !workflowData.workflowid ? true : new_version_flag,
				workflowversionid: !workflowData.workflowid ? null : selectedVersion,
				name: workflowData.name,
				description: workflowData.description,
				// version:workflowData.version,
				icon: workflowData.icon,
				backgroundcolor: workflowData.backgroundcolor,
				fontcolor: workflowData.fontcolor,
				uicontent: {
					nodes: nodes,
					edges: edges
				},
				content: jsonSnapshot,

			}
			// console.log("Payload for saving workflow:", payload);
			const res = await WorkFlowService.add_Workflows(payload)

			const updatedWorkflow = {
				...workflowData,
				workflowid: res.data.workflowid,
				latestversiondata: res.data.currentversiondata,
				versions: res.data.versions,
				icon: res.data.icon,
				latestversion: res.data.latestversion,
				backgroundcolor: res.data.backgroundcolor,
				fontcolor: res.data.fontcolor,
				envstatus: res.data.envstatus,
				created_at: res.data.created_at,
				updated_at: res.data.updated_at,
				updated_at: res.data.updated_at,
				updated_by: res.data.created_by,
			};
			setWorkflowData(updatedWorkflow);
			// setWorkflows([...workflows, updatedWorkflow]);
			getAllworkflow()
			setSelectedVersion(res.data.currentversiondata.id);
			setIsSaved(true)
			return true;

		} catch (e) {
			console.log(e)
		} finally {
			setLoader(false)
		}
	}
	const getWorkflowVersions = async (workflowId, selectedVersionId) => {
		setLoader(true)
		setMessageHeader('Fetching Workflow Versions')
		const payload = {
			workflowid: workflowId,
			workflowversionid: selectedVersionId
		}
		try {
			const res = await WorkFlowService.getWorkflowVersions(payload.workflowid, payload.workflowversionid)
			if (res.status === 200) {
				let uicontent = JSON.parse(res.data.uicontent);
				if (uicontent?.nodes) {
					setNodes(uicontent.nodes)
				}
				if (uicontent?.edges) {
					setEdges(uicontent.edges)
				}
				
				// Restore workflow settings from the saved content
				if (res.data.content) {
					const content = JSON.parse(res.data.content);
					if (content.executionTime !== undefined) {
						setWorkflowSetting(prev => ({
							...prev,
							executionTime: content.executionTime
						}));
					}
					if (content.result?.nodename) {
						setWorkflowSetting(prev => ({
							...prev,
							finalAgent: content.result.nodename
						}));
					}
				}
			}
		} catch (e) {
			console.log(e)
		} finally {
			setLoader(false)
		}
	}

	const onConnect = useCallback((params) => {
		// const sourceNode = nodes.find(n => n.id === params.source);
		// const targetNode = nodes.find(n => n.id === params.target);

		let edgeStyle = {};
		// let isDotted = false;

		// if (
		//     sourceNode?.data?.nodeType === 'chatManager' &&
		//     targetNode?.data?.nodeType === 'chatManager' &&
		//     sourceNode?.parentId === targetNode?.parentId
		// ) 
		// {
		//     edgeStyle = { strokeDasharray: '4 2' };
		//     isDotted = true;
		// }
		
		// Check if this is a condition-specific connection
		const isConditionConnection = params.sourceHandle && params.sourceHandle.startsWith('condition');
		
		const edgeId = `edge-${params.source}-${params.target}-${Date.now()}`;
		const newEdge = {
			id: edgeId,
			...params,
			// type: "step",
			style: {
				strokeWidth: 2,
				...edgeStyle,
			},
			markerEnd: {
				type: 'arrowclosed',
			},
			// Add metadata for condition connections
			data: isConditionConnection ? {
				isConditionConnection: true,
				conditionIndex: params.sourceHandle ? parseInt(params.sourceHandle.replace('condition', '')) : null,
				conditionsource: params.sourceHandle // Add the condition ID as conditionsource
			} : undefined
		};
		setEdges((eds) => {
			const updatedEdges = addEdge(newEdge, eds);
			return updatedEdges;
		});
	}, [setEdges, nodes]);

	const generateNodeId = () => {
		const id = `${nodeIdCounter.current}`;
		nodeIdCounter.current += 1;
		return id;
	};
	// Handle edge click (deletes edge)
	const onEdgeClick = (event, edge) => {
		event.stopPropagation();
		setEdges((eds) => eds.filter((e) => e.id !== edge.id));
	};


	const addConditionNode = (node, icon, parentId) => {
		const { description, name } = node;
		let fixedparams;
		let nodeType = "Condition";
		if (name === "If-Else") {
			nodeType = "IFELSE";
			// Default to one condition
			fixedparams = [
				{
					name: "name", displayname: "Component Name", description: NODE_NAME_DESCRIPTION, valuetype: "string", isencrypted: false, isrequired: true, iseditable: true, value: name
				},
				{
					name: "description", displayname: "Component Description", description: "Description of the Node", valuetype: "text", isencrypted: false,
					isrequired: true, iseditable: true, value: description
				},
				// Instead of a single 'conditions' param, add condition1 by default
				{
					name: "condition1", displayname: "Condition 1", description: "If-Else Condition 1", valuetype: "condition", isencrypted: false, isrequired: true, iseditable: true, value: { operator: "contains", value: "" }
				}
			];
		} else {
			fixedparams = [
				{
					name: "name", displayname: "Component Name", description: NODE_NAME_DESCRIPTION, valuetype: "string", isencrypted: false, isrequired: true, iseditable: true, value: name
				},
				{
					name: "description", displayname: "Component Description", description: "Description of the Node", valuetype: "text", isencrypted: false,
					isrequired: true, iseditable: true, value: description
				},
				{
					name: "conditions", displayname: "Conditions", description: "Conditional logic", valuetype: "conditions", isencrypted: false, isrequired: true, iseditable: true, value: {
						conditions: [
							{
								id: 1,
								operator: "contains",
								text: ""
							}
						]
					}
				}
			];
		}

		setNodes((nds) => {
			let parentNode = null;
			let children = [];
			let yoffset = 100;
			let xoffset = 100 + nds.length * 180;
			const updatedNodes = [...nds];

			if (parentId) {
				parentNode = nds.find(n => n.id === parentId);
				if (parentNode) {
					children = nds.filter(n => n.parentNode === parentId);
				}
				xoffset = 10;
				yoffset = 40 + children.length * 40;
			}

			// Update parent height if child is being added
			if (parentNode) {
				const updatedParent = {
					...parentNode,
					style: {
						...parentNode.style,
						height: Math.max(200, yoffset + 80),
						width: Math.max(parentNode.style?.width || 300, 300),
					},
				};
				const index = updatedNodes.findIndex(n => n.id === parentId);
				updatedNodes[index] = updatedParent;
			}

			// Creating new condition node
			const newNode = {
				id: generateNodeId(),
				type: name === "If-Else" ? "ifElse" : "agent",
				nodeType: nodeType,
				position: { x: xoffset, y: yoffset },
				parentNode: parentId || null,
				extent: parentId ? "parent" : undefined,
				style: name === "If-Else" ? {
					width: 250,
					minHeight: 120
				} : undefined,
				data: {
					uiConfig: {
						icon: icon
					},
					params: fixedparams,
					nodeType: nodeType,
					isChild: !!parentId,
				}
			};
			return [...updatedNodes, newNode];
		});
        
		setOpenLibrary(false);
	};

	const addMergeNode = (node, icon, parentId) => {
		const { description, name } = node;
		const fixedparams = [
			{
				name: "name", displayname: "Component Name", description: NODE_NAME_DESCRIPTION, valuetype: "string", isencrypted: false, isrequired: true, iseditable: true, value: name
			},
			{
				name: "description", displayname: "Component Description", description: "Description of the Node", valuetype: "text", isencrypted: false,
				isrequired: true, iseditable: true, value: description
			}
		];

		setNodes((nds) => {
			let parentNode = null;
			let children = [];
			let yoffset = 100;
			let xoffset = 100 + nds.length * 180;
			const updatedNodes = [...nds];

			if (parentId) {
				parentNode = nds.find(n => n.id === parentId);
				if (parentNode) {
					children = nds.filter(n => n.parentNode === parentId);
				}
				xoffset = 10;
				yoffset = 40 + children.length * 40;
			}

			// Update parent height if child is being added
			if (parentNode) {
				const updatedParent = {
					...parentNode,
					style: {
						...parentNode.style,
						height: Math.max(200, yoffset + 80),
						width: Math.max(parentNode.style?.width || 300, 300),
					},
				};
				const index = updatedNodes.findIndex(n => n.id === parentId);
				updatedNodes[index] = updatedParent;
			}

			// Creating new merge node
			const newNode = {
				id: generateNodeId(),
				type: "merge",
				nodeType: "Merge",
				position: { x: xoffset, y: yoffset },
				parentNode: parentId || null,
				extent: parentId ? "parent" : undefined,
				style: {
					width: 250,
					minHeight: 120
				},
				data: {
					uiConfig: {
						icon: icon
					},
					params: fixedparams,
					nodeType: "Merge",
					isChild: !!parentId,
				}
			};
			return [...updatedNodes, newNode];
		});
        
		setOpenLibrary(false);
	};

	const addAgentNode = (node, icon, parentId) => {
		const { componentid, description, name, params, type, requires_llm,requires_prompt,requires_kb,methodid,output } = node;
		let fixedparams = [
			{
				name: "name", displayname: "Component Name", description: NODE_NAME_DESCRIPTION, valuetype: "string", isencrypted: false, isrequired: true, iseditable: true, value: name
			},
			{
				name: "description", displayname: "Component Description", description: "Description of the Node", valuetype: "text", isencrypted: false,
				isrequired: true, iseditable: true, value: description
			}
		]
		const models = node.models || []
		const options=models.length>0 ?models.map((llm)=>({label:llm.name,value:llm.modelcompanycomponentid})):[{label:"no models avaliable",value:""}]
		if (requires_llm) {
			fixedparams.push({
				name: "modelcompanycomponentid",
				displayname: "LLM Model",
				description: "LLM Models",
				valuetype: "options",
				options: options,
				isencrypted: false,
				isrequired: true,
				iseditable: true,
				value: ""
			});
		}

		if (requires_kb) {
			if (node.kbs_types) {
				node.kbs_types.forEach(kbType => {
					const matchingKbs = kbSubTypeList.filter(kb => kb.kbtype === kbType);
					const kbOptions = matchingKbs.map(kb => ({ 
						label: kb.name, 
						value: kb.kbsubtypeinstanceid 
					}));
					
					fixedparams.push({
						name: kbType,
						displayname: `${kbType}`,
						description: `${kbType} Knowledge Base`,
						valuetype: "options",
						options: kbOptions,
						isencrypted: false,
						isrequired: true,
						iseditable: true,
						value: ""
					});
				});
			}
		}


		// if (type === 'Agent') {
		if (requires_prompt) {
			fixedparams.push(
				// {
				// 	name: "modelcompanycomponentid", displayname: "LLM Model", description: "LLM Models", valuetype: "options",
				// 	options: llmList.map((llm) => ({ label: llm.name, value: llm.modelcompanycomponentid })), isencrypted: false, isrequired: true, iseditable: true, value: ""
				// },
				{
					name: "tools", displayname: "Tools", description: "Tools", valuetype: "multioptions",
					options: toolList.map((tool) => ({ label: tool.name, value: tool.companycomponentid })), isencrypted: false, isrequired: false, iseditable: true, value: ""
				},
				{
					name: "persona", displayname: "Persona", description: "Instructions for the AI", valuetype: "quill",
					isencrypted: false, isrequired: true, iseditable: true, value: "", sectionheading: "Prompts Section"
				},
				{
					name: "task", displayname: "Task", description: "Instructions for the AI", valuetype: "quill",
					isencrypted: false, isrequired: true, iseditable: true, value: ""
				},
				{
					name: "instructions", displayname: "Instructions", description: "Instructions for the AI", valuetype: "quill",
					isencrypted: false, isrequired: false, iseditable: true, value: ""
				},
				{
					name: "boundaryConditions", displayname: "Boundary Conditions", description: "Instructions for the AI", valuetype: "quill",
					isencrypted: false, isrequired: false, iseditable: true, value: ""
				},
				{
					name: "sampleInputOutput", displayname: "Sample input/output", description: "Instructions for the AI", valuetype: "quill",
					isencrypted: false, isrequired: false, iseditable: true, value: ""
				},
				{
					name: "terminationCondition", displayname: "Termination Condition", description: "Instructions for the AI", valuetype: "quill",
					isencrypted: false, isrequired: false, iseditable: true, value: ""
				},
				{
					name: "additional", displayname: "Additional", description: "Instructions for the AI", valuetype: "quill",
					isencrypted: false, isrequired: false, iseditable: true, value: ""
				}
			)
			// }
		}

		// Push additional parameters and use the complete array. If params does not have iseditable, then add the key with true value
		if (params && params.length > 0) {
			params.forEach(param => {
				if (!param.hasOwnProperty('iseditable')) param.iseditable = true; // Default to true if not specified
				if (!param.hasOwnProperty('value')) param.value = ""; // Default to empty string if not specified
				if (param.valuetype === 'options' && !param.options) param.options = []; // Default to empty array if not specified
				if (param.valuetype === 'int') param.valuetype = "integer";
				if (param.valuetype === 'bool') param.valuetype = "boolean";
			});
		}
		fixedparams.push(...(params || []));



		setNodes((nds) => {
			let parentNode = null;
			let children = [];
			let yoffset = 100;
			let xoffset = 100 + nds.length * 180;
			const updatedNodes = [...nds];


			if (parentId) {
				parentNode = nds.find(n => n.id === parentId);
				if (parentNode) {
					children = nds.filter(n => n.parentNode === parentId);
				}
				xoffset = 10;
				yoffset = 40 + children.length * 40;
			}
			// Update parent height if child is being added
			if (parentNode) {
				const updatedParent = {
					...parentNode,
					style: {
						...parentNode.style,
						height: Math.max(200, yoffset + 80),
						width: Math.max(parentNode.style?.width || 300, 300),
					},
				};
				const index = updatedNodes.findIndex(n => n.id === parentId);
				updatedNodes[index] = updatedParent;
			}

			// Creating new node
			const newNode = {
				id: generateNodeId(),
				type: "agent",
				nodeType: type,
				position: { x: xoffset, y: yoffset },
				className: type === 'Team' ? "chatManagerNode" : "",
				parentNode: parentId || null, // Set parentNode if provided
				extent: parentId ? "parent" : undefined,
				data: {
					uiConfig: {
						icon: icon
					},
					params: fixedparams,
					componentid: componentid,
					methodid:methodid,
					output: output, // Add output field for connector methods
					nodeType: type,
					isChild: !!parentId, // Indicate if this is a child node
				}
			};
			return [...updatedNodes, newNode];

		});
        
		setOpenLibrary(false);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};
	const handleOpenUserMenu = (event) => {
		setAnchorElUser(event.currentTarget);
	};


	// Check ellipsis for workflow name
	useEffect(() => {
		const el = nameRef.current;
		if (!el) return;
		const checkEllipsis = () => {
			const isEllipsed = el.scrollWidth > el.clientWidth + 1; // Horizontal overflow
			setShowNameTooltip(isEllipsed);
		};
		checkEllipsis();

		const resizeObserver = new ResizeObserver(checkEllipsis);
		resizeObserver.observe(el);
		return () => resizeObserver.disconnect();
	}, [workflowData.workflowName]);

	const startNodeInputType = nodes.find(node => node.nodeType === 'Start')?.data?.params?.find(param => param.name === 'inupt_type')?.value || 'none';
	const startNodeChatEnabled = nodes.find(node => node.nodeType === 'Start')?.data?.params?.find(p => p.name === 'chat')?.value === true;
   
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);
	const isDisabled = !workflowData?.workflowid;
	return (
		<div className="canvasContainer">
			<div className="back-icon" onClick={() => {
				if (!isSaved) {
					const confirmed = window.confirm("You have unsaved changes. Are you sure you want to go back?");
					if (!confirmed) return;
				}
				handleView("list", workflowData);
			}}
			>
				<IoMdArrowBack size={20} />
			</div>
			<div className="agent-name" ref={nameRef} title={showNameTooltip ? workflowData.name : ""}>{workflowData.name}</div>
			<div className="versionDropdown">
				<select onChange={(e) => {
					const selectedVersionId = e.target.value;
					getWorkflowVersions(workflowData.workflowid, selectedVersionId);
					setSelectedVersion(selectedVersionId)
				}}
					style={{ "border": "none" }}
					value={selectedVersion}>
					{workflowData.versions.map((version) => (
						<option key={version.id} value={version.id}>v{version.versionnumber}</option>
					))}
				</select>
			</div>
			<Box sx={{ flexGrow: 0 }}>
				<div className="action" onClick={!blockedAccess ? handleOpenUserMenu : undefined} style={{
					pointerEvents: blockedAccess ? 'none' : 'auto', opacity: blockedAccess ? 0.5 : 1, cursor: blockedAccess ? 'not-allowed' : 'pointer'
				}}>
					Action
				</div>
				<Menu
					sx={{ mt: '45px' }}
					id="menu-appbar"
					anchorEl={anchorElUser}
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
					keepMounted
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
					open={Boolean(anchorElUser)}
					onClose={handleCloseUserMenu}
				>
					<MenuItem onClick={() => { handleCloseUserMenu(); addWorkflow(false); }}>
						<Box display="flex" alignItems="center" px={0} >
							<IoMdSave style={{ marginRight: "2vh" }} color="#525354" />
							<Typography color="#525354">Save</Typography >
						</Box>
					</MenuItem>
					<MenuItem onClick={() => { handleCloseUserMenu(); addWorkflow(true) }} disabled={!workflowData.workflowid} >
						<Box display="flex" alignItems="center" px={0}  >
							<MdSaveAs style={{ marginRight: "2vh" }} color="#525354" />
							<Typography color="#525354" >Save As New Version</Typography >
						</Box>
					</MenuItem>
					<MenuItem onClick={()=>{handleCloseUserMenu;make_latest_version()}} >
						<Box display="flex" alignItems="center" px={0} >
							<BsLightningChargeFill style={{ marginRight: "2vh" }} color="#525354" />
							<Typography color="#525354" >Make Latest Version</Typography >
						</Box>
					</MenuItem>
					<MenuItem onClick={() => { handleCloseUserMenu; publishWorkflow() }} >
						<Box display="flex" alignItems="center" px={0} >
							<IoIosRocket style={{ marginRight: "2vh" }} color="#525354" />
							<Typography color="#525354" >Publish</Typography >
						</Box>
					</MenuItem>
					{/* <MenuItem onClick={()=>{handleCloseUserMenu,delteWorkflowVerion()}} disabled={!workflowData.workflowid}>
						<Box display="flex" alignItems="center" px={0} >
							<AiFillDelete style={{ marginRight: "2vh" }} color="#FF2A38" />
							<Typography color="#FF2A38" >Delete this Version</Typography >
						</Box>
					</MenuItem> */}
					<MenuItem onClick={() => { handleCloseUserMenu, delteWorkflow() }} disabled={!workflowData.workflowid}>
						<Box display="flex" alignItems="center" px={0} >
							<AiFillDelete style={{ marginRight: "2vh" }} color="#FF2A38" />
							<Typography color="#FF2A38" >Delete Workflow</Typography >
						</Box>
					</MenuItem>
				</Menu>
			</Box>
			<div className="test-setting">
				<div style={{ cursor: isDisabled ? "not-allowed" : "pointer", opacity: isDisabled ? 0.5 : 1 }} onClick={!isDisabled ? handleOpenModal : undefined}><PiPlayFill style={{ marginRight: '2px' }} />
					<span style={{ fontSize: "14px" }}>Test</span> </div>
				<span>|</span>
				<GoChecklist style={{ cursor: 'pointer' }} />
				<span>|</span>
				<TbSettings2 style={{ cursor: 'pointer' }} onClick={handleOpen} />
				<WorkFlowSettingModal 
					open={open} 
					handleClose={handleClose} 
					workflowSetting={workflowSetting} 
					nodes={nodes} 
					setWorkflowSetting={setWorkflowSetting}
					onSave={() => addWorkflow(false)}
				/>
			</div>
			<div className="plus-icon" onClick={!blockedAccess?() => setOpenLibrary(true):"undefined"}
				style={{ cursor: blockedAccess ? 'not-allowed' : 'pointer', opacity: blockedAccess ? 0.5 : 1,}}><FaPlus /></div>

			<div style={{ flexGrow: 1 }}>
				<FlowProvider value={{ agentList, teamList, llmList, toolList, kbSubTypeList, connectorList, addAgentNode, addConditionNode, addMergeNode }}>
					<ReactFlow
						nodes={nodes}
						edges={edges}
						nodeTypes={nodeTypes}
						onNodesChange={onNodesChangeEnhanced}
						onEdgesChange={onEdgesChange}
						onConnect={onConnect}
						onEdgeClick={onEdgeClick}
						proOptions={{ hideAttribution: true }}
						panOnDrag
						panOnScroll
					// fitView
					>
						<Background />
						<MiniMap />
						<Controls />
					</ReactFlow>
				</FlowProvider>
			</div>

			{openLibrary && (
				<ComponentLibrary agentList={agentList} teamList={teamList} connectorList={connectorList} conditionList={conditionList} onClose={() => setOpenLibrary(false)} addAgentNode={addAgentNode} addConditionNode={addConditionNode} addMergeNode={addMergeNode} />
			)}
			<TestModal workflowData={workflowData} show={showTestModal} onHide={handleCloseModal} selectedVersion={selectedVersion} startNodeInputType={startNodeInputType} isSaved={isSaved} addWorkflow={addWorkflow} startNodeChatEnabled={startNodeChatEnabled}/>
			<MessageLoader
				isOpen={loader}
				icon={<BeatLoader color="#FF0087" />}
				headerMessage={messageHeader}
			/>
		</div>
	);
};

export default WorkFlowCanvas;

