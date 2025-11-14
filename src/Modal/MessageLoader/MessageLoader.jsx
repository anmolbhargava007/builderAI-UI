import React from 'react';
import { Modal } from 'react-bootstrap';
import './MessageLoader.scss'; 
const MessageLoader = (props) => {
  const { isOpen, onClose, icon, headerMessage, bodyContent } = props;

  return (
    <Modal show={isOpen} onHide={onClose} centered backdrop="static" size="sm">
      <div className="modal-content">
        <Modal.Header  style={{ borderBottom: "none" }} >
          <div
            className="w-100 d-flex justify-content-center align-items-center gap-3"
          >
            {icon}
            <h5
            className='hader-message'
            >
              {headerMessage}
            </h5>
          </div>
        </Modal.Header>

        {bodyContent && (
          <Modal.Body className="text-center pt-0">
            <p style={{ fontSize: "14px", lineHeight: "1.2" }}>
              {bodyContent}
            </p>
          </Modal.Body>
        )}
      </div>
    </Modal>
  );
};

export default MessageLoader;
