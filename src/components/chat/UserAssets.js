import React from "react";
import { useState, useEffect } from "react";

import { Button, Modal, Form, ListGroup, Tabs, Tab, Image, Row, Col, Card, InputGroup } from "react-bootstrap";
import {getLSP5ReceivedAssets, sendLSP7Token, getBalanceOf, sendLYX, createAndMintLSP7Token, createAndMintLSP8Token, sendLSP8Token} from "./ReadProfileFn.js";
// import {ReactComponent as AttachLogo} from './icons/attach.svg';

// This Modal help Add a new friend
export function UserAssets(props) {
  const [myAssetList, setMyAssetList] = useState([]);

  const [selectedTab, setSelectedTab] = useState('nft');
  const [selectedToken, setSelectedToken] = useState({});

  useEffect(() => {
    console.log("useEffect 22");
    if (props.address) {
      updateMyAssetList()
    }
  }, []);

  async function updateMyAssetList() {
    // console.log("updateMyAssetList");
    // console.log(props.address);
    const myAls = await getLSP5ReceivedAssets(props.address);
    // console.log(myAls);
    setMyAssetList(myAls);
  }
  // nav card-header-tabs nav-tabs nav-justified
  //                      navbar-nav nav-tabs nav-justified
  // nav card-header-tabs nav-tabs nav-justified
  return (
    <div
      style={{
      }}
      key={"user-asset-"+(new Date().timestamp)}
    >
        <Tabs 
          onSelect={(selectedTab) => {
            setSelectedTab(selectedTab);
          }}
          activeKey={selectedTab}
          justify={true}
          style={{
            flexDirection : "row"
          }}
        >
          <Tab eventKey="token" title="Token">
            <div style={{"paddingTop": "10px"}}>

              <ListGroup
                  activeKey={selectedToken.address}
              >
                { myAssetList.map( (als) => 
                  { 
                    if (als.type=="LSP7") {
                      return (<>
                      <ListGroup.Item 
                        key={als.address}
                        active={als.address == selectedToken.address}
                        onClick={()=>{
                          navigator.clipboard.writeText(als.address);
                          setSelectedToken(als);
                        }}
                      >
                        {als.name} : {als.balance} {als.symbol} 
                      </ListGroup.Item>            
                      </>)
                    }
                }) }
              </ListGroup>
              <hr/>
                <InputGroup className="mb-3">
                  <InputGroup.Text>Token Address</InputGroup.Text>
                  <Form.Control value={selectedToken.address} />
                </InputGroup>
            </div>
          </Tab>
          <Tab eventKey="nft" title="NFT">
            <div style={{"paddingTop": "10px"}}>
              <Row xs={1} md={3} className="g-4">
                {  
                  myAssetList.map( (als) => {
                    if (als.type=="LSP8") {
                      return (<Col>
                        <Card 
                          border={selectedToken.address==als.address && selectedToken.id==als.id ? "primary" : ""} 
                          onClick={(e)=>{
                            navigator.clipboard.writeText(als.address);
                            setSelectedToken(als)
                          }}>
                          <Card.Img variant="top" src={als.icon} />
                          <Card.Body style={{"textAlign" : "center"}}>
                            <Card.Title >{als.symbol}</Card.Title>
                            <Card.Text>
                              {als.name}
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>)
                    }
                  }
                )}
              </Row>
              <hr/>
              <InputGroup className="mb-3">
                <InputGroup.Text>Token Address</InputGroup.Text>
                <Form.Control value={selectedToken.address} />
              </InputGroup>
            </div>
          </Tab>
        </Tabs>
        
    </div>
  );
}