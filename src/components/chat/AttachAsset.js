import React from "react";
import { useState } from "react";
import { Button, Modal, Form, ListGroup, Tabs, Tab, Image, Row, Col, Card, InputGroup } from "react-bootstrap";
import {getLSP5ReceivedAssets, sendLSP7Token, getBalanceOf, sendLYX, createAndMintLSP7Token, createAndMintLSP8Token, sendLSP8Token} from "./ReadProfileFn.js";
// import {ReactComponent as AttachLogo} from './icons/attach.svg';

// This Modal help Add a new friend
export function AttachAsset(props) {
  const [show, setShow] = useState(false);
  const [myAssetList, setMyAssetList] = useState([]);
  const [myBalance, setMyBalance] = useState(0);

  const [selectedTab, setSelectedTab] = useState('lyx');
  const [selectedToken, setSelectedToken] = useState({});

  const [amount, setAmount] = useState(0);


  const handleClose = () => setShow(false);
  const handleShow = async () => {
    await updateMyAssetList()
    setMyBalance(await getBalanceOf(props.address));
    setShow(true);
  }

  async function updateMyAssetList() {
    const myAls = await getLSP5ReceivedAssets(props.address);
    setMyAssetList(myAls);
  }

  async function fnSend() {
    var toAddr = props.currActivFriend.publicKey;
    var fromAddr = props.address;
    try {
      props.setLoadingActive(true);

      if (selectedTab=="token") {
        var tokenAddress = selectedToken.address;

        const tx = await sendLSP7Token(fromAddr, toAddr, amount, tokenAddress);

        await props.sendNoti(props.name+" has just sent "+amount+" "+selectedToken.name+" (LSK7Token) to "+props.currActivFriend.friendname+" at <a href='https://explorer.execution.l16.lukso.network/tx/"+tx.transactionHash+"'>txhash</a>");
        setShow(false);

      } else if (selectedTab == "lyx") {
        const tx = await sendLYX(fromAddr, toAddr, amount);

        await props.sendNoti(props.name+" has just sent "+amount+" LYX to "+props.currActivFriend.friendname+" at <a href='https://explorer.execution.l16.lukso.network/tx/"+tx.transactionHash+"'>txhash</a>");
        setShow(false);
      } else if (selectedTab == "nft") {
        var tokenAddress = selectedToken.address;
        var tokenId = selectedToken.id;
        const tx = await sendLSP8Token(fromAddr, toAddr, tokenId, tokenAddress);

        await props.sendNoti(props.name+" has just sent an NFT "+selectedToken.name+" (LSK8Token) to "+props.currActivFriend.friendname+" at <a href='https://explorer.execution.l16.lukso.network/tx/"+tx.transactionHash+"'>txhash</a>");
        setShow(false);

      }
      props.setLoadingActive(false)

    }catch(e) {
      props.setLoadingActive(false)
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
      }}
      key={"attachasset"+(new Date().timestamp)}
    >
        <Image 
          src="attach.svg" avatar="true"
          style={{cursor: "pointer"}} 
          onClick={() => {
            if (props.currActivFriend.publicKey && props.currActivFriend.userType==1) {
              handleShow();
            }
          }}
        ></Image>
        {/* // Attach */}
      {/* // </Button> */}
      <Modal 
        show={show} onHide={handleClose}
        key={"attachasset-modal-"+(new Date().timestamp)}
      >
        <Modal.Header closeButton>
          <Modal.Title> Attach and send to  {props.currActivFriend.friendname} </Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Tabs 
          onSelect={(selectedTab) => {
            setSelectedTab(selectedTab);
          }}
          activeKey={selectedTab}
          justify={true}
        >
          <Tab eventKey="lyx" title="LYX">
            <div style={{"paddingTop": "10px"}}>
              <h5> Your UP LYX Balance : {myBalance} LYX </h5>
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
                <InputGroup className="mb-3">
                  <InputGroup.Text>Token Address</InputGroup.Text>
                  <Form.Control value={selectedToken.address} />
                </InputGroup>
              <hr/>
              <div style={{"textAlign": "center"}}>or</div>
              <hr/>
              <a href="https://universalpage.dev/assets/create" style={{"padding" : "10px", "background" : "blue", "color": "white", "borderRadius": "9px" }}>Create New Token</a>
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
              <hr/>
              <div style={{"textAlign": "center"}}>or</div>
              <hr/>
              <a href="https://universalpage.dev/assets/create" 
                style={{"padding" : "10px", "background" : "blue", "color": "white", "borderRadius": "9px" }}>
                  Create New NFT
              </a>
              {/* <a href="https://universalpage.dev/assets/create" 
                style={{"padding" : "10px", "background" : "blue", "color": "white", "borderRadius": "9px", "marginLeft" : "10px" }}>
                  Join asset group
              </a> */}
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