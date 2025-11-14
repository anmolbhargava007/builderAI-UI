import React, { useEffect, useState } from 'react'
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import Select, { components } from 'react-select';
import { BeatLoader } from 'react-spinners';
import Message_loader from '../../../Modal/MessageLoader/MessageLoader'
import departmentService from '../../../services/departmentService';
import authService from '../../../services/authService';
import { VscChevronLeft } from "react-icons/vsc";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import userService from '../../../services/userService';
import { useToast } from '../../../context/ToastContext';

const UserForm = (props) => {
  const { handleView, updateRecord, get_All_Users } = props
  const [isModal, setIsModal] = useState(false)
  const [messageHeader, setMessageHeader] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [roleOption, setRoleOption] = useState([])
  const [showPassword, setShowPassword] = useState(false)
  const [isEdit, setIsEdit] = useState(false);
  const [creditAction, setCreditAction] = useState("Assigned")
  const [departmentsoption, setDepartmentsOption] = useState([])
  const { showToast } = useToast();
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const [formValues, setFormValues] = useState({
    name: "",
    userEmail: "",
    phoneNumber: "",
    countryCode: "91",
    password: "",
    credit_assigned: "",
    userRole: "",
    departments: []
  });

  useEffect(() => {
    get_All_Roles();
    get_departments();
  }, [])


  useEffect(() => {
    if (Object.keys(updateRecord).length > 0) {
      fillUpateForm();
      setIsEdit(true);
    } else {
      setIsEdit(false);
    }
  }, [updateRecord]);
  const fillUpateForm = () => {
    setFormValues({
      name: updateRecord.name || "",
      userEmail: updateRecord.email || "",
      userRole: updateRecord.roleid || "",
      phoneNumber: updateRecord.phonenumber || "",
      countryCode: updateRecord.countrycode || "91",
      departments: updateRecord.deptid || [],
      credit_assigned: 0
    });
  };
  const get_departments = async () => {
    setIsModal(true)
    setMessageHeader("Fetching all departments")
    try {

      const res = await departmentService.get_departments(localStorage.getItem("comp_id"))
      const departmentList = res.data.departments.map((department) => ({
        label: department.name,
        value: department.id
      }))
      setDepartmentsOption(departmentList)
    } catch (e) {
      console.log(e)
    } finally {
      setIsModal(false)
    }
  }
  const get_All_Roles = async () => {
    setIsModal(true)
    setMessageHeader("fetching Roles")
    try {
      const res = await authService.getAllRoles()
      const rolelist = res.data.roles.map((role) => ({
        label: role.name,
        value: role.id
      }))
      setRoleOption(rolelist)
    } catch (e) {
      console.log(e)
    } finally {
      setIsModal(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (!isEdit) {
      if (name === "password") {
        if (value.length >= 8) {
          e.target.setCustomValidity("")
        } else {
          e.target.setCustomValidity("password must be more than 8 characters")
        }
        e.target.reportValidity();
      }
    }
    if (isEdit) {
      if (name === "credit_assigned" && creditAction === "Revoked") {
        if (parseFloat(value) > (updateRecord.credits || 0)) {
          e.target.setCustomValidity("Cannot revoke more than current credits");
        } else {
          e.target.setCustomValidity("");

        }
      }
    }
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };
  const customMultiValue = (props) => {
    const maxToShow = 2;
    const { index, getValue } = props;
    const selected = getValue();

    if (index < maxToShow) {
      return <components.MultiValue {...props} />;
    }

    if (index === maxToShow) {
      const remaining = selected.length - maxToShow;
      return (
        <div style={{ padding: "5px", fontSize: "0.9rem", color: "#666" }}>
          +{remaining} more
        </div>
      );
    }

    return null;
  };

  const validateForm = () => {
    if (creditAction === "Revoked") {
      if (formValues.credit_assigned > updateRecord.credit_balance) {
        toast({
          title: "Error",
          description: "You cannot revoke more credits than the user has",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        return false
      }
    }
    return true
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(isEdit)
    if (isEdit) {
      handleEdit();
    } else {
      handleAdd();
    }
  };

  const handleAdd = async () => {
    const isValid = validateForm();
    if (!isValid) {
      setIsModal(false);
      return;
    }
    setMessageHeader("Adding new user");
    setMessageBody(`Do not refresh or close this window`);
    setIsModal(true);
    const payload = {
      compid: localStorage.getItem("comp_id"),
      name: formValues.name,
      email: formValues.userEmail,
      roleid: formValues.userRole,
      phonenumber: Number(formValues.phoneNumber),
      countrycode: Number(formValues.countryCode),
      password: formValues.password,
      deptid: formValues.departments,
      credits: parseFloat(formValues.credit_assigned) || 0
    };
    try {
      const res = await userService.add_User(payload);
      if (res?.data?.message === "User added successfully") {
        get_All_Users();
        handleView("table");
      }

    } catch (err) {
      console.log("err:", err);
      if (err.response && err.response.status === 409) {
        if (err.response.data.detail === "User Email already exists") {
          const emailInput = document.getElementById('input[name="userEmail"]')
          emailInput?.setCustomValidity("Email already exists")
        }
        else if (err.response.data.detail === "User Mobile already exists") {
          const phoneInput = document.getElementById('input["phoneNumber"]')
          phoneInput?.setCustomValidity("Mobile number alreday exists")
        }
      }
      if (err.response && err.response.status === 400) {

      } else {
        console.error("Unexpected error:", err);
        toast({
          title: err.response.data.detail,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        })
      }
    } finally {
      setIsModal(false);
    }
  };

  const handleEdit = async () => {
    setMessageHeader("Editing User");
    setMessageBody(`Do not refresh or close this window`);
    setIsModal(true);
    const isValid = validateForm();
    if (!isValid) {
      setIsModal(false);  // Hide the modal if validation fails
      return;  // Stop the submit process if validation fails
    }
    const credit = parseFloat(formValues.credit_assigned) || 0;

    const payload = {
      compid: localStorage.getItem("comp_id"),
      name: formValues.name,
      userid: updateRecord.id,
      email: formValues.userEmail,
      roleid: formValues.userRole,
      phonenumber: Number(formValues.phoneNumber),
      countrycode: Number(formValues.countryCode),
      password: formValues.password,
      deptid: formValues.departments,
      credits: credit,
      creditservicetype: creditAction
    };


    try {
      const res = await userService.update_User(payload);
      if (res?.data?.message === "User updated successfully") {
        get_All_Users();
        handleView("table");
      }
    } catch (err) {
      console.log("err:", err);
      showToast({
        title: err.response.data.detail,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      })
    } finally {
      setIsModal(false);
    }
  };


  return (
    <div className="setup-parent">
      <div className="form-field mt-3">
        <hr className="horizantal-line" />
        <div className="d-flex align-items-center gap-4">
          <VscChevronLeft onClick={() => handleView('table')} style={{ cursor: 'pointer', width: '50px', height: '50px', marginBottom: "6px" }} />
          <h2 className="heading1">{isEdit ? 'Edit User' : 'Create New User'}</h2>
        </div>
        <hr className="horizantal-line" />
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="name">
                <Form.Label className="heading4">Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  required
                  className='input-field'
                  value={formValues.name}
                  onChange={handleChange}
                  placeholder="Enter Full Name"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="userEmail">
                <Form.Label className="heading4">User Email <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="email"
                  name="userEmail"
                  required
                  className='input-field'
                  value={formValues.userEmail}
                  onChange={handleChange}
                  placeholder="Enter User Email"
                  disabled={isEdit}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="password">
                <Form.Label className="heading4">Password {!isEdit && <span className="text-danger">*</span>}</Form.Label>
                <InputGroup>
                  <Form.Control
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className='input-field'
                    required={!isEdit}
                    value={formValues.password}
                    onChange={handleChange}
                    placeholder="Enter Password"
                  />
                  <div className="position-absolute end-0 top-50 translate-middle-y me-3" style={{ cursor: 'pointer' }}
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </div>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="userRole">
                <Form.Label className="heading4">Role <span className="text-danger">*</span></Form.Label>
                <Select
                  name="userRole"
                  isMulti
                  options={roleOption}
                  required
                  classNamePrefix="react-select"
                  value={roleOption?.filter((opt) => formValues.userRole.includes(opt.value))}
                  onChange={(selectedOption) => {
                    const selectedId = selectedOption.map((opt) => opt.value)
                    setFormValues({ ...formValues, userRole: selectedId })
                  }}
                  components={{ MultiValue: customMultiValue }}
                >
                </Select>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="phoneNumber">
                <Form.Label className="heading4">Mobile Number <span className="text-danger">*</span></Form.Label>
                <InputGroup>
                  <Form.Select
                    name="countryCode"
                    value={formValues.countryCode}
                    className='input-field'
                    required
                    onChange={handleChange}
                    style={{ maxWidth: '80px' }}
                  >
                    <option value="91">(+91)</option>
                    <option value="1">(+1)</option>
                  </Form.Select>
                  <Form.Control
                    type="number"
                    className='input-field'
                    name="phoneNumber"
                    required
                    value={formValues.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter Mobile Number"
                  />
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="Department">
                <Form.Label className="heading4">Department <span className="text-danger">*</span></Form.Label>
                <Select
                  name="department"
                  isMulti
                  required
                  classNamePrefix="react-select"
                  options={departmentsoption}
                  value={departmentsoption.filter((opt) => formValues.departments.includes(opt.value))}
                  onChange={(selectedOption) => {
                    const selectedId = selectedOption.map((opt) => opt.value)
                    setFormValues({ ...formValues, departments: selectedId })
                  }}
                  components={{ MultiValue: customMultiValue }}
                >
                </Select>
              </Form.Group>
            </Col>
          </Row>
          <Row className="align-items-center">
            <Col md={6}>
              <Form.Group controlId="credit_assigned">
                <Form.Label className="heading4 d-flex align-items-center">
                  Assign Credits
                  {isEdit && updateRecord?.credits !== undefined && (
                    <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: '#6c757d' }}>
                      (Current Credits: {(updateRecord.credits || 0).toFixed(2)})
                    </span>
                  )}
                </Form.Label>
                <Form.Control
                  className="input-field"
                  type="number"
                  name="credit_assigned"
                  value={formValues.credit_assigned}
                  onChange={handleChange}
                  placeholder="Enter Assign Credits"
                />
                {/* {errors.assignCredits && (
        <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>
          {errors.assignCredits}
        </div>
      )} */}
              </Form.Group>
            </Col>

            {/* Radio Button Section */}
            <Col md={6} className="mt-3">
              <div className="d-flex gap-4 mt-2">
                <Form.Check
                  type="radio"
                  id="assign"
                  name="creditAction"
                  value="Assigned"
                  label="Assign"
                  checked={creditAction === "Assigned"}
                  onChange={(e) => setCreditAction(e.target.value)}
                />
                <Form.Check
                  type="radio"
                  id="revoke"
                  name="creditAction"
                  value="Revoked"
                  label="Revoke"
                  checked={creditAction === "Revoked"}
                  disabled={!isEdit}
                  onChange={(e) => setCreditAction(e.target.value)}
                />
              </div>
            </Col>
          </Row>

          <div className="d-flex gap-4 my-4">
            <Button
              // variant="outline-primary"
              className="cancel-button w-100"
              onClick={() => handleView('table')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="submit-button w-100"
              style={{ backgroundColor: '#FF0087', color: 'white', border: "none" }}
            >
              Submit
            </Button>
          </div>
        </Form>
      </div>
      <Message_loader isOpen={isModal} icon={<BeatLoader color="#FF0087" />} headerMessage={messageHeader} bodyContent={messageBody} />
    </div>
  )
}

export default UserForm
