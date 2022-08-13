import React from "react";
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import {
  NavBar,
  ChatCard,
  Message,
  AddNewChat,
} from "./Components.js";
import { ethers } from "ethers";
import { abi } from "./abi";


import { encrypt } from '@metamask/eth-sig-util';
const ascii85 = require('ascii85');

// Add the contract address inside the quotes
const CONTRACT_ADDRESS = "0x51a4e112D51B6fAa24fcDEfA6e2adF8332626F01";

export function EncrypedHome() {
  const [friends, setFriends] = useState(null);
  const [myName, setMyName] = useState(null);
  const [myPublicKey, setMyPublicKey] = useState(null);
  const [activeChat, setActiveChat] = useState({
    friendname: null,
    publicKey: null,
  });
  const [activeChatMessages, setActiveChatMessages] = useState(null);
  const [showConnectButton, setShowConnectButton] = useState("block");
  const [myContract, setMyContract] = useState(null);

  // Save the contents of abi in a variable
  const contractABI = abi;
  let provider;
  let signer;

  // Login to Metamask and check the if the user exists else creates one
  async function login() {
    let res = await connectToMetamask();
    if (res === true) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      console.log(signer);
      try {
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractABI,
          signer
        );
        console.log(CONTRACT_ADDRESS);
        
        setMyContract(contract);
        const address = await signer.getAddress();
        let present = await contract.checkUserExists(address);
        let username;
        if (present) username = await contract.getUsername(address);
        else {
          username = prompt("Enter a username", "Guest");
          if (username === "") username = "Guest";
          await contract.createAccount(username);
        }
        setMyName(username);
        setMyPublicKey(address);
        setShowConnectButton("none");
      } catch (err) {
        alert("CONTRACT_ADDRESS not set properly!");
      }
    } else {
      alert("Couldn't connect to Metamask");
    }
  }

  // Check if the Metamask connects
  async function connectToMetamask() {
    try {
      await window.ethereum.enable();
      return true;
    } catch (err) {
      return false;
    }
  }

  // Add a friend to the users' Friends List
  async function addChat(name, publicKey) {
    try {
      let present = await myContract.checkUserExists(publicKey);
      if (!present) {
        alert("Address not found: Ask them to join the app :)");
        return;
      }
      try {
        await myContract.addFriend(publicKey, name);
        const frnd = { name: name, publicKey: publicKey };
        setFriends(friends.concat(frnd));
      } catch (err) {
        alert(
          "Friend already added! You can't be friends with the same person twice ;P"
        );
      }
    } catch (err) {
      alert("Invalid address!");
    }
  }

  // Sends messsage to an user
  async function sendMessage(data) {
    if (!(activeChat && activeChat.publicKey)) return;
    const recieverAddress = activeChat.publicKey;
    await myContract.sendMessage(recieverAddress, data);
  }

  async function testFun() {
    let res = await connectToMetamask();
    if (res === true) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      console.log(signer);
      const account = await signer.getAddress();

      const keyB64 = await window.ethereum.request({
        method: 'eth_getEncryptionPublicKey',
        params: [account],
      });
      console.log(account);
      console.log(keyB64);
      const publicKey = Buffer.from(keyB64, 'base64');
      console.log(publicKey);

      const encryptedData = encryptData(publicKey, "test1234");
      console.log(encryptedData);
      const decriptedData = await decryptData(account, encryptedData);
      console.log(decriptedData);
      console.log(decriptedData.toString("base64"));
    } else {
      alert("Couldn't connect to Metamask");
    }
  }

  function encryptData(publicKey, data) {
    // Returned object contains 4 properties: version, ephemPublicKey, nonce, ciphertext
    // Each contains data encoded using base64, version is always the same string
    const bdata = Buffer.from(data, 'base64')
    console.log("bdata");
    console.log(bdata);
    console.log(bdata.toString("base64"));
    console.log(publicKey.toString('base64'));
    const enc = encrypt({
      publicKey: publicKey.toString('base64'),
      data: ascii85.encode(bdata).toString(),
      version: 'x25519-xsalsa20-poly1305',
    });
  
    // We want to store the data in smart contract, therefore we concatenate them
    // into single Buffer
    const buf = Buffer.concat([
      Buffer.from(enc.ephemPublicKey, 'base64'),
      Buffer.from(enc.nonce, 'base64'),
      Buffer.from(enc.ciphertext, 'base64'),
    ]);
    
    // In smart contract we are using `bytes[112]` variable (fixed size byte array)
    // you might need to use `bytes` type for dynamic sized array
    // We are also using ethers.js which requires type `number[]` when passing data
    // for argument of type `bytes` to the smart contract function
    // Next line just converts the buffer to `number[]` required by contract function
    // THIS LINE IS USED IN OUR ORIGINAL CODE:
    // return buf.toJSON().data;
    
    // Return just the Buffer to make the function directly compatible with decryptData function
    return buf;
  }

  async function decryptData(account, data) {
    // Reconstructing the original object outputed by encryption
    const structuredData = {
      version: 'x25519-xsalsa20-poly1305',
      ephemPublicKey: data.slice(0, 32).toString('base64'),
      nonce: data.slice(32, 56).toString('base64'),
      ciphertext: data.slice(56).toString('base64'),
    };
    // Convert data to hex string required by MetaMask
    const ct = `0x${Buffer.from(JSON.stringify(structuredData), 'utf8').toString('hex')}`;
    // Send request to MetaMask to decrypt the ciphertext
    // Once again application must have acces to the account
    const decrypt = await window.ethereum.request({
      method: 'eth_decrypt',
      params: [ct, account],
    });
    // Decode the base85 to final bytes
    return ascii85.decode(decrypt);
  }
  

  // Fetch chat messages with a friend
  async function getMessage(friendsPublicKey) {
    let nickname;
    let messages = [];
    friends.forEach((item) => {
      if (item.publicKey === friendsPublicKey) nickname = item.name;
    });
    // Get messages
    const data = await myContract.readMessage(friendsPublicKey);
    data.forEach((item) => {
      const timestamp = new Date(1000 * item[1].toNumber()).toUTCString();
      messages.push({
        publicKey: item[0],
        timeStamp: timestamp,
        data: item[2],
      });
    });
    setActiveChat({ friendname: nickname, publicKey: friendsPublicKey });
    setActiveChatMessages(messages);
  }

  // This executes every time page renders and when myPublicKey or myContract changes
  useEffect(() => {
    async function loadFriends() {
      let friendList = [];
      // Get Friends
      try {
        const data = await myContract.getMyFriendList();
        data.forEach((item) => {
          friendList.push({ publicKey: item[0], name: item[1] });
        });
      } catch (err) {
        friendList = null;
      }
      setFriends(friendList);
    }
    loadFriends();
  }, [myPublicKey, myContract]);

  // Makes Cards for each Message
  const Messages = activeChatMessages
    ? activeChatMessages.map((message) => {
        let margin = "5%";
        let sender = activeChat.friendname;
        if (message.publicKey === myPublicKey) {
          margin = "15%";
          sender = "You";
        }
        return (
          <Message
            marginLeft={margin}
            sender={sender}
            data={message.data}
            timeStamp={message.timeStamp}
          />
        );
      })
    : null;

  // Displays each card
  const chats = friends
    ? friends.map((friend) => {
        return (
          <ChatCard
            publicKey={friend.publicKey}
            name={friend.name}
            getMessages={(key) => getMessage(key)}
          />
        );
      })
    : null;

  return (
    <Container style={{ padding: "0px", border: "1px solid grey" }}>
      {/* This shows the navbar with connect button */}
      <NavBar
        username={myName}
        login={async () => login()}
        showButton={showConnectButton}
      />
      <Row>
        {/* Here the friends list is shown */}
        <Col style={{ paddingRight: "0px", borderRight: "2px solid #000000" }}>
          <div
            style={{
              backgroundColor: "#DCDCDC",
              height: "100%",
              overflowY: "auto",
            }}
          >
            <Row style={{ marginRight: "0px" }}>
              <Card
                style={{
                  width: "100%",
                  alignSelf: "center",
                  marginLeft: "15px",
                }}
              >
                <Card.Header>Chats</Card.Header>
              </Card>
            </Row>
            {chats}
            <AddNewChat
              myContract={myContract}
              addHandler={(name, publicKey) => addChat(name, publicKey)}
            />
          </div>
        </Col>
        <Col xs={8} style={{ paddingLeft: "0px" }}>
          <div style={{ backgroundColor: "#DCDCDC", height: "100%" }}>
            {/* Chat header with refresh button, username and public key are rendered here */}
            <Row style={{ marginRight: "0px" }}>
              <Card
                style={{
                  width: "100%",
                  alignSelf: "center",
                  margin: "0 0 5px 15px",
                }}
              >
                <Card.Header>
                  {activeChat.friendname} : {activeChat.publicKey}
                  <Button
                    style={{ float: "right" }}
                    variant="warning"
                    onClick={() => {
                      if (activeChat && activeChat.publicKey)
                        getMessage(activeChat.publicKey);
                    }}
                  >
                    Refresh
                  </Button>
                  <Button
                    style={{ float: "right" }}
                    variant="success"
                    onClick={async() => {
                      testFun();
                    }}
                  >
                    Test
                  </Button>
                </Card.Header>
              </Card>
            </Row>
            {/* The messages will be shown here */}
            <div
              className="MessageBox"
              style={{ height: "400px", overflowY: "auto" }}
            >
              {Messages}
            </div>
            {/* The form with send button and message input fields */}
            <div
              className="SendMessage"
              style={{
                borderTop: "2px solid black",
                position: "relative",
                bottom: "0px",
                padding: "10px 45px 0 45px",
                margin: "0 95px 0 0",
                width: "97%",
              }}
            >
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(document.getElementById("messageData").value);
                  document.getElementById("messageData").value = "";
                }}
              >
                <Form.Row className="align-items-center">
                  <Col xs={9}>
                    <Form.Control
                      id="messageData"
                      className="mb-2"
                      placeholder="Send Message"
                    />
                  </Col>
                  <Col>
                    <Button
                      className="mb-2"
                      style={{ float: "right" }}
                      onClick={() => {
                        sendMessage(
                          document.getElementById("messageData").value
                        );
                        document.getElementById("messageData").value = "";
                      }}
                    >
                      Send
                    </Button>
                  </Col>
                </Form.Row>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}