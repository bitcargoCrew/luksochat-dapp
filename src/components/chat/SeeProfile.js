import React from "react";
import { useState } from "react";
import { Button, Modal, Form, InputGroup } from "react-bootstrap";
import { Image } from 'semantic-ui-react'
const DEFAULT_AVATAR = "logo.svg"

import {
  UserAssets
} from "./Components.js";

// This Modal help Add a new friend
export function SeeProfile(props) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  var background = "background.png";
  if (props.fullProfile && props.fullProfile.profile && props.fullProfile.profile.backgroundImage && props.fullProfile.profile.backgroundImage[0] && props.fullProfile.profile.backgroundImage[0].url ) {
    background = props.fullProfile.profile.backgroundImage[0].url.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  var avatar = DEFAULT_AVATAR;
  var links = []
  if (props.fullProfile && props.fullProfile.profile && props.fullProfile.profile.links) {
    links = props.fullProfile.profile.links;
  }
  if (props.fullProfile && props.fullProfile.avatar) {
    avatar = props.fullProfile.avatar;
  }

  return (
    <div
      className="Profile"
      style={{
        float : "right"
      }}
    >
      {props.showAvatar 
        ? <div style={{ "paddingRight" : "10px", "paddingTop": "2px" }} onClick={handleShow}>
            <Image avatar={true} src={props.fullProfile.avatar} />
            {props.fullProfile.name}
          </div>
        : <Image 
          src="binoculars.svg" 
          style={{cursor: "pointer"}} 
          onClick={handleShow} 
          ></Image>}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title> 
            {props.fullProfile?.name}<br/>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text>Address</InputGroup.Text>
            <Form.Control defaultValue={props.fullProfile?.publicKey} />
          </InputGroup>
          <h5 style={{textAlign: "center"}}>{props.fullProfile?.profile?.description}</h5>
          <div style={{width : "470px", height: "470px", backgroundImage : "url("+background+")", backgroundSize: "cover"}}>
            {/* <Image  src={background} /> */}
            <div style={{
              "position": "relative", marginLeft: "auto", top: "35%", "marginRight": "auto", width: "35%"
            }}>
              <Image src={avatar} style={{
                  "position": "relative", top: "0",left: "0", background : "white",
                  borderRadius: "50%", width: "160px", height: "160px", borderRadius : "50%"
              }}/>
            </div>
          </div>
          {links[0] 
            ? <>
                <hr/>
                <h6 style={{textAlign: "center"}}>
                  Links <br/>
                  {links.map((l)=>{
                    return <a key={l["url"]} href={l["url"]} >{l["title"]}</a>
                  })}
                </h6>
              </>
            : <></>
          }
        <hr/>
        {props.fullProfile?.userType == 1 || props.showAvatar == true
          ? <UserAssets address={props.fullProfile?.publicKey} />
          : <></>}

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