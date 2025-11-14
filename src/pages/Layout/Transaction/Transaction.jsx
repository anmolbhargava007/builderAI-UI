import React, { useContext, useEffect, useRef, useState } from "react";
import "./Transaction.scss";
import vector from '../../../assets/Vector.svg';
import { BeatLoader } from "react-spinners";
import Message_loader from "../../../Modal/MessageLoader/MessageLoader";
import TransactionTable from "./TransactionTable/TransactionTable";
import Switch from '@mui/material/Switch';
import workflowservice from "../../../services/authService";

const Transaction = () => {
    const [transactionData, setTransactionData] = useState([]);
    const [isModal, setIsModal] = useState(false);
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(today);
    const [messageHeader, setMessageHeader] = useState("");
    const [totalCreditUsed, setTotalCreditUsed] = useState(0);
    const [creditBalance, setCreditBalance] = useState(0);



    useEffect(() => {
        if (startDate <= endDate) getTransactionData();
    }, [startDate, endDate]);

    //   useEffect(() => {
    //     if (TransactionData.length > 0) calculateCardValues();
    //   }, [TransactionData]);

    const getTransactionData = async () => {
        setIsModal(true);
        setMessageHeader("Transaction Loading");
        const payload = {
            compid: localStorage.getItem("comp_id"),
            userid: localStorage.getItem("user_id"),
            startdate: startDate.toISOString().split('T')[0],
            enddate: endDate.toISOString().split('T')[0],
        };
        try {
            const res = await workflowservice.getTransactionHistory(payload);
            console.log(res.data)
            setCreditBalance(res.data.credit_balance)
            setTotalCreditUsed(res.data.credits_used_till_date)
            setTransactionData(res.data.history)
        } catch (error) {
            //   toast(error?.response?.data?.detail || "Error fetching data");
        } finally {
            setIsModal(false);
        }
    };

    const handleDateChange = (type, date) => {
        if (type === 1) setStartDate(date);
        else setEndDate(date);
    };

    const toInputDate = (d) => d.toLocaleDateString('en-CA');

    return (
        <div className="container-fluid mt-4 px-4" >
            {/* <div className="d-flex align-items-center mb-4">
        {isAdminView && <VscChevronLeft onClick={() => handleView("table")} className="me-3 fs-1 text-secondary" style={{ cursor: 'pointer' }} />}
        <h2>{isAdminView ? `Transaction History - (${userName})` : "Transaction History"}</h2>
      </div> */}
            <h2 className="mb-4">Transaction History</h2>
            <div className="d-flex flex-wrap gap-3 mb-4">
                {[
                    {
                        title: "Credits Remaining*",
                        value: creditBalance,
                        subtitle: "*Current Balance",
                    },
                ].map((stat, idx) => {
                    const [intPart, decimalPart] = Number(stat.value).toFixed(2).split(".");
                    return (
                        <div key={idx} className="card stat-box p-3">
                            <h5 className="stat-title">{stat.title}</h5>
                            <small className="subtitle-space">{stat.subtitle}</small>
                            <div className="stat-value">
                                <span className={`stat-int ${stat.type}`}>{intPart}</span>
                                <span className={`stat-decimal ${stat.type}`}>.{decimalPart}</span>
                            </div>

                        </div>
                    );
                })}

            </div>
            <div className="d-flex align-items-center mb-2 gap-4">
                <h5 className="mb-0">Credits Transaction Table </h5>
            </div>

            <div className="row mb-4">
                {[
                    { label: "Start Date", selected: startDate, type: 1 },
                    { label: "End Date", selected: endDate, type: 2 }
                ].map(({ label, selected, type }, idx) => (
                    <div key={idx} className="col-md-3 mb-3" >
                        <label><strong>{label}</strong></label>
                        <div >
                            <input
                                type="date"
                                className="form-control pe-3 date-input"
                                value={selected instanceof Date && !isNaN(selected) ? selected.toISOString().split('T')[0] : ''}
                                max={toInputDate(today)}
                                onChange={(e) => handleDateChange(type, new Date(e.target.value))}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <TransactionTable TransactionData={transactionData} />
            <Message_loader isOpen={isModal} icon={<BeatLoader color="#FF0087" />} headerMessage={messageHeader} />
        </div>
    );
};

export default Transaction;
