import React from "react";
import { useState } from "react";
import { Button, Modal, Form, Checkbox } from "react-bootstrap";

// This Modal help Add a new friend
export function AddNewGroup(props) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [publicKey, setPublicKey] = useState(props.randomAddress);

  return (
    <div
      className="AddNewChat"
      style={{
        padding: "10px",
      }}
    >
      <Button variant="success" className="mb-2" onClick={handleShow}>
        + New Group
      </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title> Add New Group </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Control
              required
              id="addPublicKey"
              size="text"
              type="text"
              placeholder="Enter Friends Public Key"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
            />
            <br />
            <Form.Control
              required
              id="addName"
              size="text"
              type="text"
              placeholder="Name"
            />
            <br />
            <Form.Control
              required
              id="avatar"
              size="text"
              type="text"
              placeholder="Your group avatar"
            />
            <br />
            <Form.Check
              label="is this a group of asset owner"
              type="checkbox"
              id="isAssetGroup"
            />

            <br />
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
                document.getElementById("addName").value,
                document.getElementById("addPublicKey").value,
                document.getElementById("isAssetGroup").checked,
                document.getElementById("avatar").value
              );
              handleClose();
            }}
          >
            Create New Group
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}