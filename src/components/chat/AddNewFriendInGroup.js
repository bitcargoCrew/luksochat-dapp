import React from "react";
import { useState } from "react";
import { Button, Modal, Form, Image } from "react-bootstrap";

// This Modal help Add a new friend
export function AddNewFriendInGroup(props) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <div
    >
      {/* <Button variant="success" className="mb-2" onClick={handleShow} style={{float : "right"}}>
        + New Friend for Group
      </Button> */}
      <Image src="plususer.svg" style={{cursor: "pointer"}} onClick={handleShow} ></Image>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title> Add New Friend for Group </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Control
              required
              id="addPublicKey"
              size="text"
              type="text"
              placeholder="Enter Friends Public Key"
              value={props.randomAddress}
            />
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
                document.getElementById("addPublicKey").value
              );
              handleClose();
            }}
          >
            Add Friend
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}