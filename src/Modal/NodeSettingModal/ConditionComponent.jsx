import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { RxPlus, RxCross2 } from "react-icons/rx";
import './ConditionComponent.scss';

const ConditionComponent = ({ conditions, onChange }) => {
	const handleConditionChange = (conditionIndex, field, value) => {
		const updatedConditions = [...conditions];
		updatedConditions[conditionIndex] = { ...updatedConditions[conditionIndex], [field]: value };
		onChange(updatedConditions);
	};

	const addCondition = () => {
		const newCondition = {
			id: Date.now(),
			operator: "contains",
			text: ""
		};
		onChange([...conditions, newCondition]);
	};

	const removeCondition = (conditionIndex) => {
		const updatedConditions = conditions.filter((_, idx) => idx !== conditionIndex);
		onChange(updatedConditions);
	};

	return (
		<div className="conditions-container">
			{conditions.map((condition, conditionIndex) => (
				<div key={condition.id} className="condition-item mb-3 p-3 border rounded">
					<div className="d-flex justify-content-between align-items-center mb-2">
						<span className="fw-bold">Condition {conditionIndex + 1}</span>
						{conditions.length > 1 && (
							<RxCross2
								onClick={() => removeCondition(conditionIndex)}
								style={{ cursor: 'pointer', color: 'red' }}
							/>
						)}
					</div>
					<div className="row">
						<div className="col-md-4 d-flex align-items-center">
							<span className="me-2">Message</span>
							<Form.Select
								value={condition.operator}
								onChange={(e) => handleConditionChange(conditionIndex, 'operator', e.target.value)}
								className='modal-input'
							>
								<option value="contains">Contains</option>
								<option value="does_not_contain">Does not contain</option>
							</Form.Select>
						</div>
						<div className="col-md-8">
							<Form.Control
								type="text"
								value={condition.text}
								onChange={(e) => handleConditionChange(conditionIndex, 'text', e.target.value)}
								className='modal-input'
								placeholder="Enter text to check"
							/>
						</div>
					</div>
				</div>
			))}
			<Button
				variant="outline-primary"
				size="sm"
				onClick={addCondition}
				className="mt-2"
			>
				<RxPlus style={{ marginRight: '4px' }} />
				Add More Condition
			</Button>
		</div>
	);
};

export default ConditionComponent; 