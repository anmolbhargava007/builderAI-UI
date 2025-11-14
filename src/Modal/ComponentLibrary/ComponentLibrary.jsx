import React, { useEffect, useState } from 'react';
import { Dropdown, DropdownButton, Accordion } from 'react-bootstrap';
import { RxCross2 } from "react-icons/rx"
import './ComponentLibrary.scss';
import agenticon from '../../assets/agent.svg'
import teamicon from '../../assets/groupmanager.svg'
import ifElseIcon from '../../assets/ifElse.svg'
import mergeIcon from '../../assets/merge.svg'

const ComponentLibrary = ({ agentList, teamList, connectorList, conditionList, onClose, addAgentNode, addConditionNode, addMergeNode }) => {
	const [selectedAgentValue, setSelectedAgentValue] = useState('');
	const addNewNode = (node) => {
		let icon  = agenticon
		if (node.type == 'Team'){
			icon = teamicon
		}
		if (node.type == 'Condition'){
			if (node.id === 'if-else') {
				icon = ifElseIcon
			} else if (node.id === 'merge') {
				icon = mergeIcon
			}
		}

		// Use appropriate method based on node type
		if (node.type === 'Condition') {
			if (node.id === 'if-else') {
				addConditionNode(node, icon, null)
			} else if (node.id === 'merge') {
				addMergeNode(node, icon, null)
			}
		} else {
			addAgentNode(node, icon, null)
		}
	}



	return (
		<div className="card-container">
			<div className='d-flex justify-content-between align-items-center'>
				<h4 className='modal-title'>Component Library</h4>
				<RxCross2 onClick={onClose} />
			</div>

			<Accordion defaultActiveKey="0" className="mt-3">
				{agentList.length > 0 && (
					<Accordion.Item eventKey="0">
						<Accordion.Header >
							<img src={agenticon} alt="agent icon" style={{ width: "30px", marginRight: "8px" }} />Agents
						</Accordion.Header>
						<Accordion.Body>
							{agentList.map(option => (
								<>
									<div key={option.id} onClick={() => addNewNode(option)} className='agent-option'>
										<hr />
										<img src={agenticon} alt="agent icon" style={{ width: "30px", marginRight: "8px" }} /> {option.name}
									</div>
								</>
							))}
						</Accordion.Body>
					</Accordion.Item>
				)}
				{teamList.length > 0 && (<>
					<hr className="custom-divider" />
					<Accordion.Item eventKey="1">
						<Accordion.Header >
							<img src={teamicon} alt="agent icon" style={{ width: "30px", marginRight: "8px" }} />
							Group Manager
						</Accordion.Header>
						<Accordion.Body>
							{teamList.map(option => (
								<div key={option.id} onClick={() => addNewNode(option)} className='agent-option'>
									<hr />
									<img src={teamicon} alt="agent icon" style={{ width: "30px", marginRight: "8px" }} />
									{option.name}
								</div>
							))}
						</Accordion.Body>
					</Accordion.Item>
				</>
				)}
				{conditionList.length > 0 && (<>
					<hr className="custom-divider" />
					<Accordion.Item eventKey="2">
						<Accordion.Header >
							<img src={ifElseIcon} alt="condition icon" style={{ width: "30px", marginRight: "8px" }} />
							Conditions
						</Accordion.Header>
						<Accordion.Body>
							{conditionList.map(option => (
								<div key={option.id} onClick={() => addNewNode(option)} className='agent-option'>
									<hr />
									<img src={option.id === 'if-else' ? ifElseIcon : mergeIcon} alt="condition icon" style={{ width: "30px", marginRight: "8px" }} />
									{option.name}
								</div>
							))}
						</Accordion.Body>
					</Accordion.Item>
				</>
				)}
				{connectorList.length > 0 && (<>
					<hr className="custom-divider" />
					<Accordion.Item eventKey="3">
						<Accordion.Header >
							<img src={agenticon} alt="connector icon" style={{ width: "30px", marginRight: "8px" }} />
							Connectors
						</Accordion.Header>
						<Accordion.Body>
							{connectorList.map(connector => (
								<div key={connector.id} className='connector-section'>
									<div className='connector-title'><strong>{connector.name}</strong></div>
									{connector.methods && connector.methods.length > 0 ? (
										connector.methods.map(method => (
											<div key={method.id || method.name} onClick={() => addNewNode(method)} className='agent-option'>
												<hr />
												<img src={agenticon} alt="method icon" style={{ width: "30px", marginRight: "8px" }} />
												{method.name}
											</div>
										))
									) : (
										<div className='no-methods'>No methods available</div>
									)}
								</div>
							))}
						</Accordion.Body>
					</Accordion.Item>
				</>
				)}
			</Accordion>
		</div>
	);
}

export default ComponentLibrary;
