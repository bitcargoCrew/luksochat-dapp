import React from "react";
import { useState } from "react";
import { Button, Modal, Image, Form } from "react-bootstrap";

// This Modal help Add a new friend
export function ShareModal(props) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <div style={{paddingRight: "5px"}} >
      <Image src="share.svg" style={{padding: "3px", cursor: "pointer"}} onClick={handleShow}></Image>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title> Share to the social media </Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Form.Group>
            <h5>Your sharing link:</h5>
            <Form.Control
              required
              id="addPublicKey"
              size="text"
              type="text"
              value= {props.url}
            />
            <br />
          </Form.Group>
          <div>
            <a href={"https://twitter.com/intent/tweet?text=Lets join our group in "+props.url}>
              <Image src="twitter.svg" style={{padding: "0 11px"}}></Image>
            </a>
            <a href="">
              <Image src="facebook.svg" style={{padding: "0 11px"}}></Image>
            </a>
            <a href="">
              <Image src="whatsapp.svg" style={{padding: "0 11px"}}></Image>
            </a>
            <a href="">
              <Image src="linkedin.svg" style={{padding: "0 11px"}}></Image>
            </a>
            <a href={"mailto:abc@example.com?subject=Our group&body="+encodeURIComponent("Hi\nLets join our group at "+props.url+"\nRegards\nBitvia Team")}>
              <Image src="email.svg" style={{padding: "0 11px"}}></Image>
            </a>

            <Image src="copy.svg" style={{padding: "0 11px", cursor: "pointer"}} onClick={(e)=>{
              navigator.clipboard.writeText(props.url);
            }}></Image>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}