import React from "react";
import { useState } from "react";
import { Button, Modal, Form, ListGroup, Tabs, Tab, Image, Row, Col, Card } from "react-bootstrap";
import {getLSP5ReceivedAssets, sendLSP7Token, getBalanceOf, sendLYX, createAndMintLSP7Token, createAndMintLSP8Token, sendLSP8Token} from "./ReadProfileFn.js";

import {
  MintLSP7Token, MintLSP8Token
} from "./Components.js";

// This Modal help Add a new friend
export function AttachAsset(props) {
  const [show, setShow] = useState(false);
  const [myAssetList, setMyAssetList] = useState([]);
  const [myBalance, setMyBalance] = useState(0);

  const [selectedTab, setSelectedTab] = useState('lyx');
  const [selectedToken, setSelectedToken] = useState('');

  const [amount, setAmount] = useState(0);


  const handleClose = () => setShow(false);
  const handleShow = async () => {
    await updateMyAssetList()
    setMyBalance(await getBalanceOf(props.address));
    setShow(true);
  }

  async function updateMyAssetList() {
    console.log("updateMyAssetList");
    console.log(props.address);
    const myAls = await getLSP5ReceivedAssets(props.address);
    console.log(myAls);
    setMyAssetList(myAls);
  }

  async function fnSend() {
    var toAddr = props.currActivFriend.publicKey;
    var fromAddr = props.address;

    if (selectedTab=="token") {
      var tokenAddress = selectedToken.address;
      // var amount = parseInt(document.getElementById("amount").value);

      console.log(tokenAddress + " : " + amount + " : " + toAddr + " "+ tokenAddress);
      const tx = await sendLSP7Token(fromAddr, toAddr, amount, tokenAddress);

      await props.sendNoti(props.name+" has just sent "+amount+" "+selectedToken.name+" (LSK7Token) to "+props.currActivFriend.friendname+" at <a href='https://explorer.execution.l16.lukso.network/tx/"+tx.transactionHash+"'>txhash</a>");
      setShow(false);

    } else if (selectedTab == "lyx") {
      console.log(amount);
      console.log( "Send LYX : " + amount + " : " + toAddr + " "+ tokenAddress);
      const tx = await sendLYX(fromAddr, toAddr, amount);

      await props.sendNoti(props.name+" has just sent "+amount+" LYX to "+props.currActivFriend.friendname+" at <a href='https://explorer.execution.l16.lukso.network/tx/"+tx.transactionHash+"'>txhash</a>");
      setShow(false);
    } else if (selectedTab == "nft") {
      console.log(selectedToken);
      var tokenAddress = selectedToken.address;
      var tokenId = selectedToken.id;
      const tx = await sendLSP8Token(fromAddr, toAddr, tokenId, tokenAddress);

      await props.sendNoti(props.name+" has just sent 1 "+selectedToken.name+" (LSK8Token) to "+props.currActivFriend.friendname+" at <a href='https://explorer.execution.l16.lukso.network/tx/"+tx.transactionHash+"'>txhash</a>");
      setShow(false);

    }
  }

  function ckEnableSend() {
    if (selectedTab=="token") {
      if (selectedToken && selectedToken.address && parseFloat(amount)> 0 ) {
        return true;
      }
      return false;
    } else if (selectedTab == "lyx") {
      if (parseFloat(amount)> 0 ) {
        return true;
      }
      return false;
    } else if (selectedTab == "nft") {
      if (selectedToken && selectedToken.address ) {
        return true;
      }
      return false;
    }
    return false;
  }

  return (
    <div
      style={{
        padding: "10px",
      }}
    >
      <Button 
        variant="success" className="mb-2" onClick={handleShow}
        disabled={ !(props.currActivFriend.publicKey) }
        >
        Attach
      </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title> Attach and send to  {props.currActivFriend.friendname} </Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Tabs 
          onSelect={(selectedTab) => setSelectedTab(selectedTab)}
          activeKey={selectedTab}
        >
          <Tab eventKey="lyx" title="LYX">
            <div style={{"paddingTop": "10px"}}>
              <h3> Your LYX Balance : {myBalance} LYX </h3>
              <Form.Control
                  required
                  id="amount"
                  size="text"
                  type="text"
                  placeholder="Enter Amount"
                  defaultValue={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                  }}
                />
            </div>
          </Tab>
          <Tab eventKey="token" title="LS7Tokens">
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
                        onClick={()=>{setSelectedToken(als)}}
                      >
                        {als.name} : {als.balance} {als.symbol} 
                      </ListGroup.Item>            
                      </>)
                    }
                }) }
              </ListGroup>
              <br/>
              <Form.Control
                  required
                  id="amount"
                  size="text"
                  type="text"
                  placeholder="Enter Amount"
                  defaultValue={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                  }}
                />
              <hr/>
              <div style={{"textAlign": "center"}}>or</div>
              <hr/>
              <a href="https://universalpage.dev/assets/create" style={{"padding" : "10px", "background" : "blue", "color": "white", "borderRadius": "9px" }}>Create New Token</a>
            </div>
          </Tab>
          <Tab eventKey="nft" title="NFT">
            <div style={{"paddingTop": "10px"}}>
              {/* <ListGroup
                  activeKey={selectedToken.address}
              >
                { myAssetList.map( (als) => 
                  { 
                    if (als.type=="LSP8") {
                      return (<>
                      <ListGroup.Item 
                        key={als.address}
                        active={als.address == selectedToken.address}
                        onClick={()=>{setSelectedToken(als)}}
                      >
                        <Image src={als.icon} avatar />
                        <span>{als.name} : {als.balance} {als.symbol} </span>
                      </ListGroup.Item>            
                      </>)
                    }
                }) }
              </ListGroup> */}
              {/* <br/>
              <Form.Control
                  required
                  id="amount"
                  size="text"
                  type="text"
                  placeholder="Enter Amount"
                  defaultValue={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                  }}
                /> */}
              <Row xs={1} md={3} className="g-4">
                {  
                  myAssetList.map( (als) => {
                    if (als.type=="LSP8") {
                      return (<Col>
                        <Card border={selectedToken.address==als.address ? "primary" : ""} onClick={(e)=>{setSelectedToken(als)}}>
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
              <div style={{"textAlign": "center"}}>or</div>
              <hr/>
              <a href="https://universalpage.dev/assets/create" style={{"padding" : "10px", "background" : "blue", "color": "white", "borderRadius": "9px" }}>Create New NFT</a>
            </div>
          </Tab>
        </Tabs>
          
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            disabled={!ckEnableSend()}
            onClick={async () => {
              await fnSend();
            }}
          >
            Send
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}