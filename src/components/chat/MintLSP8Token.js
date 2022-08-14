import React from "react";
import { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";

// This Modal help Add a new friend
export function MintLSP8Token(props) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <div>
      <Button variant="success" onClick={handleShow}>
        + Create Your LSP8 Token
      </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title> Add New LSP 8 Token </Modal.Title>
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
              id="firstId"
              size="text"
              type="text"
              placeholder="Enter the first Id"
            />
          <br/>
          <Form.Control
              required
              id="tokenURL"
              size="text"
              type="text"
              placeholder="Enter Image URL"
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
                document.getElementById("firstId").value,
                document.getElementById("tokenURL").value
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