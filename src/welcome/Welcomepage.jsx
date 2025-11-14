import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Spinner, Container, Row, Col, Image, Alert } from "react-bootstrap";
import companyService from "../services/companyService";
import Logo from "../assets/OrigamisAILogo.png";

const Welcomepage = () => {
    const location = useLocation();
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;

            const queryParams = new URLSearchParams(location.search);
            const token = queryParams.toString();

            if (token) {
                companyEmailVerification(token);
            } else {
                setMessage("No token found in the URL.");
                setIsLoading(false);
            }
        }
    }, [location.search]);

    const companyEmailVerification = async (token) => {
        try {
            const res = await companyService.companyEmailVerification(token);
            if (res.status === 200) {
                if (res.data.message === "Company Verification successfully") {
                    setMessage("Thank you for verifying your email!");
                } else if (res.data.message === "User is already verified") {
                    setMessage(
                        "Your account is already verified. If you encounter any issues, please contact your administrator."
                    );
                }
            }
        } catch (err) {
            console.log("Error during verification:", err);

            if (err.response && err.response.data && err.response.data.detail) {
                if (err.response.data.detail === "404: Invalid or expired token") {
                    setMessage("The verification link is expired.");
                } else {
                    console.log("Other error:", err.response.data.detail);
                }
            } else {
                console.log("Unexpected error:", err);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: "#e9e9e9", height: "100vh" }}>
            <Container className="d-flex flex-column align-items-center justify-content-center pt-5">
                <Image src={Logo} alt="logo" style={{ width: "20%", height: "auto" }} />
                <Row className="mt-4">
                    <Col className="text-center">
                        {isLoading && <Spinner animation="border" variant="danger" />}
                        {message && (
                            <Alert variant="light">
                                <h5>{message}</h5>
                                {message !== "The verification link is expired." && (
                                    <>
                                        <p className="mb-1">Click here to go to the</p>
                                        <a href="/" className="text-decoration-none text-danger">
                                            Login page
                                        </a>
                                    </>
                                )}
                            </Alert>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
export default Welcomepage;