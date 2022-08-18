import React from "react";
import { Row, Card } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
import { Image } from 'semantic-ui-react'

import {
  SeeProfile
} from "./Components.js";

// This is a function which renders the friends in the friends list
export function ChatCard(props) {
  return (
    <Row style={{ marginRight: "0px" }}>
      <Card
        border="success"
        style={{ width: "100%", alignSelf: "center", marginLeft: "15px" }}
        onClick={() => {
          if (props.isFriend) {
            props.getMessages(props.publicKey);
          }
        }}
      >
        <Card.Body style={{padding: "0.60rem"}}>
          <Card.Title> 
            <Image src={props.avatar} avatar />
            {props.name} 
            <SeeProfile
              fullProfile={props.fullProfile}
            />
          </Card.Title>
          <Card.Subtitle>
            {" "}
            {props.publicKey.length > 28
              ? props.publicKey.substring(0, 28) + " ..."
              : props.publicKey}{" "}
            {!props.isFriend 
              ? (<span 
                    style={{"height": "20px", "float": "right", border : "1px solid #28a745",   borderRadius: "5px" , padding : "1px" , cursor: "pointer" }}
                    onClick={(e)=>{props.addFriend()}}
                  >
                  {props.userType=="1" ? "+Friend" : "+Join Group" }
                </span>) 
              : (<></>)}
          </Card.Subtitle>
        </Card.Body>
      </Card>
    </Row>
  );
}