import React, { useContext, useEffect, useRef, useState } from 'react'
import { Modal, Button, Form } from 'react-bootstrap';
import workflowservice from '../../services/workflowservice';
import MessageLoader from '../MessageLoader/MessageLoader';
import { BeatLoader } from 'react-spinners';
import { useToast } from '../../context/ToastContext';
import { CentralizeContext } from '../../context/ContextProvider';
import { tableBodyClasses } from '@mui/material';
const TestModal = (props) => {
    const { show, onHide, selectedVersion, startNodeInputType, isSaved, addWorkflow, startNodeChatEnabled, workflowData } = props
    const [loader, setLoader] = useState(false)
    const { setCreditBalance, creditBalance } = useContext(CentralizeContext)
    const [messageHeader, setMessageHeader] = useState('')
    const [testData, setTestData] = useState('')
    const [inputData, setInputData] = useState('')
    const [file, setFile] = useState([]);
    const { showToast } = useToast()
    const [inputsDisabled, setInputsDisabled] = useState(false)
    const wsRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [answerText, setAnswerText] = useState("");
    const [chatStarted, setChatStarted] = useState(false);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [awaitingResponse, setAwaitingResponse] = useState(false);


    const WEBSOCKET_URL = import.meta.env.VITE_WS_API_URL;


    useEffect(() => {
        if (!show) {
            setFile([])
            setInputData('')
            setTestData('')
            setInputsDisabled(false)
            setMessages([])
            setAnswerText('')
            setChatStarted(false)
        }
        if (wsRef.current) {
            wsRef.current.close()
            wsRef.current = null
        }
    }, [show])

    const executeTest = async () => {
        const formData = new FormData();
        formData.append('compid', localStorage.getItem('comp_id'));
        formData.append('userid', localStorage.getItem('user_id'));
        formData.append('useremail', localStorage.getItem('email'));
        formData.append('workflowversionid', selectedVersion);

        if ((startNodeInputType === 'file' || startNodeInputType === 'both') && file) {
            file.forEach((f) => {
                formData.append(`inputfile`, f);
            });
        }
        if (startNodeInputType === 'text' || startNodeInputType === 'both') {
            formData.append('inputtext', inputData);
        }
        try {
            const res = await workflowservice.addExecuteWorkflowVersion(formData)   
            setTestData(res.data.result.output.final_output)
            setCreditBalance(res.data.result.creditbalance.user_credits)
        } catch (e) {
           console.log(e)
            const errMsg = e?.response?.data?.error || "Unknown error occurred";
            showToast(errMsg, 'danger');
        }
    }
    const execute_workflow_version = async (e) => {
        e.preventDefault()
        if (creditBalance < 0) {
            showToast("Credit Balance is not sufficient", "danger");
            return;
        }

        setMessageHeader("Executing Workflow Version")
        setLoader(true)
        setTestData('')
        try {
            if (!isSaved) {
                const success = await addWorkflow()
                if (!success) {
                    return;
                }
            }
            await executeTest()
        }
        catch (e) {
            console.log(e)
        } finally {
            // onHide()
            setLoader(false)
        }
    }

    const submitchat = (e) => {
        e.preventDefault();
        setInputsDisabled(true)
        setChatStarted(true);
        setAwaitingResponse(true)
        console.log("##################### WEBSOCKET_URL:", WEBSOCKET_URL)
        const ws = new WebSocket(WEBSOCKET_URL);
        wsRef.current = ws;
        ws.onopen = () => {
            console.log("✅ WebSocket Connected!");
            setIsSocketConnected(true);
            const json = {
                token: localStorage.getItem("token"),
                workflowversionid: selectedVersion,
                ...(inputData !== null && inputData !== undefined && inputData !== "" ? { inputtext: inputData } : {})
            }
            ws.send(JSON.stringify(json));
            console.log("🔄 Sent message to WebSocket:", json);
        };
        ws.onmessage = async (event) => {

            try {
                console.log("🔄 Received message from WebSocket:", event.data);
                const data = JSON.parse(event.data)
                let parsedMessage = data.message;
                // If message is a string, parse it to JSON
                if (typeof parsedMessage === 'string') {
                    parsedMessage = JSON.parse(parsedMessage);
                }
                // ✅ Handle question
                if (parsedMessage?.question) {
                    setMessages(prev => [...prev, { type: 'question', text: parsedMessage.question }]);
                    setAwaitingResponse(false);
                    setInputsDisabled(false);
                    return;
                }
                if (parsedMessage?.error) {
                    setMessages(prev => [...prev, { type: 'error', text: parsedMessage.error }]);
                    setInputsDisabled(true)
                    setAwaitingResponse(false)
                    wsRef.current?.close();
                    return;
                }
                if (parsedMessage?.status === 'ok') {
                    const ans = parsedMessage?.result?.output?.final_output;
                    if (ans) {
                        setMessages(prev => [...prev, { type: 'question', text: ans }]);
                    }
                    // Optionally update credit balances
                    const credits = parsedMessage?.result?.creditbalance?.user_credits;
                    if (credits) {
                        setCreditBalance(credits);
                    }
                    setInputsDisabled(true);
                    setAwaitingResponse(false)
                    wsRef.current?.close();
                }

            } catch (error) {
                setAwaitingResponse(false)
                console.error("❌ Error parsing WebSocket message:", error);
                ws.close();
            }
        };

        ws.onerror = (error) => {
            console.error("⚠️ WebSocket Error:", error);
        };

        ws.onclose = (event) => {
            console.warn(`🔴 WebSocket Closed: Code ${event.code}, Reason: ${event.reason}`);
            setIsSocketConnected(false);
            setAwaitingResponse(false);
            // Auto-reconnect after 5 seconds
            // setTimeout(() => {
            //     console.log("🔄 Reconnecting WebSocket...");
            //     ws = new WebSocket(WEBSOCKET_URL);
            // }, 5000);
        };

        // Cleanup function to close WebSocket on unmount
        // return () => {
        //     if (ws) {
        //         ws.close();
        //         console.log("🔌 WebSocket Disconnected.");
        //     }
        // };

    }
    const handleSendAnswer = () => {
        const answer = answerText.trim();
        if (!answer) return;
        // Show answer aligned right
        setMessages(prev => [...prev, { type: 'answer', text: answer }]);
        // Send to backend
        wsRef.current?.send(JSON.stringify({ answer }));
        setAnswerText("");
        setAwaitingResponse(true)
        setInputsDisabled(true);
    };


    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton style={{ border: "none" }}>
                <Modal.Title>Test</Modal.Title>
            </Modal.Header>
            <Form onSubmit={startNodeChatEnabled ? submitchat : execute_workflow_version}>
                <Modal.Body>
                    {(startNodeInputType === 'text' || startNodeInputType === 'both') && (
                        <Form.Group className="mb-3">
                            <Form.Label>Text Input<span style={{ color: 'red' }}>*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={inputData}
                                disabled={inputsDisabled}
                                required
                                onChange={(e) => setInputData(e.target.value)}
                                placeholder="Enter input data here..."
                            />
                        </Form.Group>
                    )}
                    {(startNodeInputType === 'file' || startNodeInputType === 'both') && (
                        <Form.Group className="mb-3">
                            <Form.Label>File Input <span style={{ color: 'red' }}>*</span></Form.Label>
                            <Form.Control
                                type="file"
                                accept=".pdf"
                                required
                                multiple
                                disabled={inputsDisabled}
                                onChange={(e) => setFile([...e.target.files])}
                            />
                            {file.length > 0 && (
                                <div className="mt-2">
                                    <strong>Selected Files:</strong>
                                    <ul>
                                        {file.map((f, i) => (
                                            <li key={i}>{f.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </Form.Group>
                    )}

                    <div>{testData}</div>
                    {chatStarted && (
                        <>
                            <div className="chat-box mb-3">
                                {messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`d-flex mb-2 ${msg.type === 'answer'
                                            ? 'justify-content-end'
                                            : 'justify-content-start'
                                            }`}
                                    >
                                        <div
                                            className={`p-2 rounded ${msg.type === 'error'
                                                ? 'bg-danger text-white'
                                                : msg.type === 'answer'
                                                    ? 'bg-primary text-white'
                                                    : 'bg-light'
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {awaitingResponse && (
                                    <div className="d-flex justify-content-start">
                                        <div className="p-2">
                                            <BeatLoader size={15} color="#FF0087" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="d-flex">
                                <Form.Control
                                    type="text"
                                    value={answerText}
                                    onChange={(e) => setAnswerText(e.target.value)}
                                    placeholder="Enter your answer"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSendAnswer();
                                        }
                                    }}
                                />
                                <Button
                                    className="ms-2"
                                    onClick={handleSendAnswer}
                                    disabled={!answerText.trim() || !isSocketConnected || awaitingResponse}
                                >
                                    Send
                                </Button>
                            </div>
                        </>
                    )}

                </Modal.Body>

                <Modal.Footer className="d-flex justify-content-center w-100">
                    <Button className='pink-button' type='submit' disabled={inputsDisabled}>
                        {startNodeChatEnabled ? 'Chat' : 'Execute'}
                    </Button>
                </Modal.Footer>

            </Form>
            <MessageLoader
                isOpen={loader}
                icon={<BeatLoader color="#FF0087" />}
                headerMessage={messageHeader}
            />
        </Modal>
    )
}

export default TestModal
