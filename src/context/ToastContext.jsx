// src/context/ToastContext.js
import { createContext, useContext, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toastData, setToastData] = useState({
    show: false,
    message: "",
    variant: "danger",
    autohide: true  
  });

  const showToast = (message, variant = "danger",autohide = true) => {
    setToastData({ show: true, message, variant,autohide });
  };

  const hideToast = () => {
    setToastData((prev) => ({ ...prev, show: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer position="top-center" className="p-3">
        <Toast bg={toastData.variant} onClose={hideToast} show={toastData.show} delay={3000} autohide={toastData.autohide}>
          <Toast.Header>
            <strong className="me-auto">
              {toastData.variant === "danger" ? "Error" : "Notice"}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastData.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </ToastContext.Provider>
  );
};