import React from "react";
import { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";

// This Modal help Add a new friend
export function ModelAlert(props) {

  return (
    <div
    >
      <Modal show={props.showAlert.show} onHide={props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title> {props.showAlert.title} </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {props.showAlert.content}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.onHide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}