import React, { useEffect, useState } from 'react'
import DataTable from '../../components/DataTable/DataTable'
import UserForm from './UserForm/UserForm'
import Message_loader from '../../Modal/MessageLoader/MessageLoader'
import { BeatLoader } from 'react-spinners'
import userService from '../../services/userService'

const User = () => {
    const [hiddenColumnList, setHiddenColumnList] = useState([]);
    const [isModal, setIsModal] = useState(false)
    const [userList, setUserList] = useState([])
    const [messageHeader, setMessageHeader] = useState('')
    const [messageBody, setMessageBody] = useState('')
    const [updateRecord, setUpdateRecord] = useState({})
    const [page, setPage] = useState('table')


    useEffect(() => {
        get_All_Users()
    }, [])

    const get_All_Users = async () => {
        setIsModal(true)
        setMessageHeader("Loading Users")
        try {
            const res = await userService.get_All_Users(localStorage.getItem("comp_id"))
            setUserList(res.data.users)
            setHiddenColumnList(['compid', 'id', 'deptid', 'updated_by', 'updated_at', 'created_at', 'created_by', 'password',
                'jwt_token', 'last_logged_in', 'access_token', 'sessionid', 'roleid', 'credits'
            ])
        } catch (e) {
            console.log(e)
        } finally {
            setIsModal(false)
        }
    }
    const handleView = (item, obj = {}) => {
        setPage(item)
        setUpdateRecord({})
        if (Object.keys(obj).length > 0) {
            if (item === 'form') {
                setUpdateRecord(obj)
            }
        }
    };
    const handleStatusChange = async (obj = {}) => {
        if (Object.keys(obj).length > 0 && obj.id) {
            try {
                setMessageHeader("Updating Status");
                setMessageBody(`Do not refresh or close this window`);
                setIsModal(true);
                const payload = {
                    userid: obj.id,
                    status: obj.status,
                    useremail: obj.updateRecord.email
                }
                const res = await userService.change_User_status(payload);
                 get_All_Users()
            } catch (err) {
                console.log("err:", err.response);
            } finally {
                // setIsLoading(false)
                setIsModal(false);
            }
        }
    };
    const refreshUserList = async (updatedUserList) => {
        setUserList(updatedUserList)
        // Loop through the userList and if email matches, update the credit
        updatedUserList.map((item) => {
            if (item.email === email) {
                setCredit(item.credit_balance)
            }
        })
    }
    return (
        <>
            {page === 'table' && <DataTable data={userList} title="User" hiddenColumnList={hiddenColumnList} handleView={handleView} switchChange={handleStatusChange} />}
            {page === "form" && <UserForm handleView={handleView} updateRecord={updateRecord} get_All_Users={get_All_Users} />}
            <Message_loader isOpen={isModal} icon={<BeatLoader color="#FF0087" />} headerMessage={messageHeader} />
        </>
    )
}

export default User
