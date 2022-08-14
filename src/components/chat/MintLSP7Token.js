import React from "react";
import { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";

// This Modal help Add a new friend
export function MintLSP7Token(props) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <div>
      <Button variant="success" onClick={handleShow}>
        + Create Your LS7 Token
      </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title> Add New LSP 7 Token </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Control
              required
              id="tokenName"
              size="text"
              type="text"
              placeholder="Enter Token Name"
            />
          <br/>
          <Form.Control
            required
            id="tokenSymbol"
            size="text"
            type="text"
            placeholder="Enter Token Symbol"
          />
          <br/>
          <Form.Control
              required
              id="tokenAmount"
              size="text"
              type="text"
              placeholder="Enter Token Amount"
            />
          <br/>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              props.addHandler(
                document.getElementById("tokenName").value,
                document.getElementById("tokenSymbol").value,
                document.getElementById("tokenAmount").value
              );
              handleClose();
            }}
          >
            Mint
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}