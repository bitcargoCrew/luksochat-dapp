import React from "react";
import { Button, Navbar } from "react-bootstrap";
import { Image } from 'semantic-ui-react'

import {
  SeeProfile
} from "./Components.js";

// This component renders the Navbar of our application
export function NavBar(props) {
  return (
    <Navbar 
      style={{
        backgroundColor: "#cac9c9"
      }}
    >
      <Navbar.Brand href="/">
        <Image src="logo-full.svg" style={{height: "39px", paddingLeft : "4px"}} />
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text>
          <Button
            style={{ display: props.showButton }}
            variant="success"
            onClick={async () => {
              props.login();
            }}
          >
            Connect to UP Extension
          </Button>
          <div
            style={{ display: props.showButton === "none" ? "block" : "none" }}
          >
            {/* <a  href={"https://universalpage.dev/profiles/"+props.publicKey} style={{ "padding-right" : "10px" }}>
              <Image src={props.avatar} avatar />
              {props.username}
            </a> */}
            <Button
              style={{ display: !props.showButton, float : "right" }}
              variant="success"
              onClick={async () => {
                props.logout();
              }}
            >
              Logout
            </Button>

            <SeeProfile
              fullProfile={props.fullProfile}
              showAvatar={true}
            />
          </div>
        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
  );
}