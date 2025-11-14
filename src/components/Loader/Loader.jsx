import React from "react";
import { Spinner } from "react-bootstrap";

const CenteredLoader = ({
    message = "Loading...",
    height = "60vh",
    size = "sm",
    color = "#FF008A"
}) => {
    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{ height }}
        >
            <p
                className="d-flex align-items-center gap-2 m-0"
                style={{ color }}
            >
                <Spinner
                    size={size}
                    animation="border"
                    style={{
                        borderColor: `${color}50`,
                        borderTopColor: color,
                    }}
                />
                {message}
            </p>
        </div>
    );
};

export default CenteredLoader;