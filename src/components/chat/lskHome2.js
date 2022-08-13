import React from "react";
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import {
  NavBar,
  ChatCard,
  Message,
  AddNewChat,
  AddNewGroup,
  AddNewFriendInGroup
} from "./Components.js";
import { ethers } from "ethers";
import { abi } from "./abi";
import Web3 from 'web3';

import {getProfileData, fetchProfile} from "./ReadProfileFn.js";

import chatDatabaseABI from "./chat_database.json";
import { Image } from 'semantic-ui-react'

import InputEmoji from 'react-input-emoji'

// Add the contract address inside the quotes
const CONTRACT_ADDRESS = "0xe2E9CB682DbC7b34940F9cf881910DcEdD6dE899";

export default function LskHome() {
  const [friends, setFriends] = useState(null);
  const [myName, setMyName] = useState(null);
  const [myAvatar, setMyAvatar] = useState("");
  const [myPublicKey, setMyPublicKey] = useState(null);
  const [ msgText, setMsgText ] = useState('')
  const [messagesEnd, setMyMessagesEnd] = useState(null);

  const [activeChat, setActiveChat] = useState({
    friendname: null,
    publicKey: null,
    userType: 1
  });
  const [activeChatMessages, setActiveChatMessages] = useState(null);
  const [showConnectButton, setShowConnectButton] = useState("block");
  const [myContract, setMyContract] = useState(null);
  const [myAddress, setMyAddress] = useState(null);

  // Save the contents of abi in a variable
  const contractABI = abi;
  let provider;
  let signer;
  let web3;

  async function logout() {
    setMyName(undefined);
    setMyPublicKey(undefined);
    setShowConnectButton("block");
  }
  // Login to Metamask and check the if the user exists else creates one
  async function login() {

    web3 = new Web3(window.ethereum);
    web3.eth.handleRevert = true;
    console.log(web3);

    window.web3 = web3;
    
    let address = await web3.eth.getAccounts();
    
    console.log(address);
    
    address = await web3.eth.requestAccounts();
    console.log(address);
    
    address = address[0];
    
    setMyAddress(address);
    
    // setConnected(address, "browserExtension");
    console.log("done");
    console.log(address);
    
    // return;

    // let res = await connectToMetamask();
    // if (res === true) {
    // provider = web3;
    // signer = provider.getSigner();
    
    try {
      const contract = new web3.eth.Contract(
        chatDatabaseABI.abi,
        CONTRACT_ADDRESS
      );
      console.log(CONTRACT_ADDRESS);
      
      setMyContract(contract);
      
      console.log(contract)
      
      // const address = await signer.getAddress();
      
      let present = await contract.methods.checkUserExists(address).call();
      console.log(present);
      
      let myProfile = await getProfileData(address);

      console.log(myProfile);

      // console.log(await getProfileData(address);)

      let username;
      if (present) {
        username = await contract.methods.getUsername(address).call();
      } else if (myProfile.name) {
        username = myProfile.name;
        await contract.methods.createAccount(username).send({
          from : address
        });
      } else {
        username = prompt("Enter a username", "Guest");
        if (username === "") username = "Guest";
        await contract.methods.createAccount(username).send({
          from : address
        });
      }
      
      if (myProfile && myProfile.profileImage && myProfile.profileImage[0]) {
        setMyAvatar((myProfile.profileImage[0].url).replace("ipfs://", "https://ipfs.io/ipfs/"));
      }
      setMyName(username);
      setMyPublicKey(address);
      setShowConnectButton("none");
      // fnRandomGroupId();
    } catch (err) {
      console.log(err);
      alert("CONTRACT_ADDRESS not set properly!");
    }
    // } else {
    //   alert("Couldn't connect to Metamask");
    // }
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
    console.log(myContract);
    try {
      let present = await myContract.methods.checkUserExists(publicKey).call();
      if (!present) {
        alert("Address not found: Ask them to join the app :)");
        return;
      }
      try {
        console.log("myAddress:"+myAddress+ " > "+present);
        if (name) {
          console.log("name:"+name);
          await myContract.methods.addFriend(publicKey, name).send({
            from : myAddress
          });
        } else {
          console.log("add default friend");
          console.log(publicKey);
          await myContract.methods.addDefaultFriend(publicKey).send({
            from : myAddress
          });
        }
        const frnd = { name: name, publicKey: publicKey, userType : 1 };
        setFriends(friends.concat(frnd));
      } catch (err) {
        console.log(err);
        alert(
          "Friend already added! You can't be friends with the same person twice ;P"
        );
      }
    } catch (err) {
      console.log(err);
      alert("Invalid address!");
    }
  }

  // Add a friend to the users' Friends List
  async function addGroup(name, publicKey) {
    console.log(myContract);
    try {
      // publicKey = "0x9a5aaD239C4485861B05051bFB506EfdbEe92b25";
      try {
        console.log("myAddress:"+myAddress+ " > "+ publicKey);
        
        console.log(  await myContract.methods.checkUserExists(publicKey).call())

        console.log("name:"+name);
        await myContract.methods.createGroup(publicKey, name).send({
          from : myAddress
        }).catch((err) => {
          console.log(err);
          return;
         });

        const frnd = { name: name, publicKey: publicKey, userType : 2 };
        setFriends(friends.concat(frnd));
      } catch (err) {
        console.log(err);
        console.log(err.message);
        alert(
          "Friend already added! You can't be friends with the same person twice ;P"
        );
      }
    } catch (err) {
      console.log(err);
      alert("Invalid address!");
    }
  }

  // Add a friend to the users' Friends List
  async function addNewFriendInGroup(publicKey) {
    console.log(myContract);
    try {
      // publicKey = "0x9a5aaD239C4485861B05051bFB506EfdbEe92b25";
      try {
        console.log("myAddress:"+myAddress+ " > "+ publicKey);
        
        await myContract.methods.addMemToGroup(activeChat.publicKey, publicKey).send({
          from : myAddress
        })

      } catch (err) {
        console.log(err);
        console.log(err.message);
        alert(
          "Friend already added! You can't be friends with the same person twice ;P"
        );
      }
    } catch (err) {
      console.log(err);
      alert("Invalid address!");
    }
  }

  // Sends messsage to an user
  async function sendMessage(data) {
    if (!(activeChat && activeChat.publicKey)) return;

    const recieverAddress = activeChat.publicKey;
    await myContract.methods.sendMessage(recieverAddress, data).send({
      from : myAddress
    });
    refreshActiveMsg();
  }

  function getFriendInfor(friendsPublicKey) {
    console.log("getFriendInfor:" + friendsPublicKey);
    console.log(friends);
    for (var i in friends) {
      if (friends[i].publicKey === friendsPublicKey) {
        console.log(friends[i]);
        console.log(friends[i].name);
        return friends[i];
      }      
    }

    return {name : "Unknown"};
  }

  // Fetch chat messages with a friend
  async function getMessage(friendsPublicKey) {
    let nickname;
    let userType;
    let avatar;
    let messages = [];
    friends.forEach((item) => {
      if (item.publicKey === friendsPublicKey) {
        nickname = item.name;
        userType = item.userType;
        avatar = item.avatar;
      }
    });
    // Get messages
    const data = await myContract.methods.readMessage(friendsPublicKey).call({
      from: myAddress
    });

    data.forEach((item) => {
      const timestamp = new Date(1000 * parseInt(item[1])).toUTCString();
      messages.push({
        publicKey: item[0],
        timeStamp: timestamp,
        data: item[2],
      });
    });

    setActiveChat({ friendname: nickname, publicKey: friendsPublicKey, userType: userType, avatar });
    setActiveChatMessages(messages);
    scrollToBottom();
  }

  async function testEncriptData() {

    // web3 = new Web3(window.ethereum);
    // web3.eth.handleRevert = true;
    // console.log(web3);

    // window.web3 = web3;
    
    // let address = await web3.eth.getAccounts();
    
    // console.log(address);
    
    // address = await web3.eth.requestAccounts();
    // console.log(address);
    // console.log(web3.eth);

    // const keyB64 = await window.ethereum.request({
    //   method: 'eth_getEncryptionPublicKey',
    //   params: [account],
    // });
    // console.log(account);
    // console.log(keyB64);
    // const publicKey = Buffer.from(keyB64, 'base64');
    // console.log(publicKey);

    // const encryptedData = encryptData(publicKey, "test1234");
    // console.log(encryptedData);
    // const decriptedData = await decryptData(account, encryptedData);
    // console.log(decriptedData);
    // console.log(decriptedData.toString("base64"));
  }

  // function encryptData(publicKey, data) {
  //   // Returned object contains 4 properties: version, ephemPublicKey, nonce, ciphertext
  //   // Each contains data encoded using base64, version is always the same string
  //   const bdata = Buffer.from(data, 'base64')
  //   console.log("bdata");
  //   console.log(bdata);
  //   console.log(bdata.toString("base64"));
  //   console.log(publicKey.toString('base64'));
  //   const enc = encrypt({
  //     publicKey: publicKey.toString('base64'),
  //     data: ascii85.encode(bdata).toString(),
  //     version: 'x25519-xsalsa20-poly1305',
  //   });
  
  //   // We want to store the data in smart contract, therefore we concatenate them
  //   // into single Buffer
  //   const buf = Buffer.concat([
  //     Buffer.from(enc.ephemPublicKey, 'base64'),
  //     Buffer.from(enc.nonce, 'base64'),
  //     Buffer.from(enc.ciphertext, 'base64'),
  //   ]);
    
  //   // In smart contract we are using `bytes[112]` variable (fixed size byte array)
  //   // you might need to use `bytes` type for dynamic sized array
  //   // We are also using ethers.js which requires type `number[]` when passing data
  //   // for argument of type `bytes` to the smart contract function
  //   // Next line just converts the buffer to `number[]` required by contract function
  //   // THIS LINE IS USED IN OUR ORIGINAL CODE:
  //   // return buf.toJSON().data;
    
  //   // Return just the Buffer to make the function directly compatible with decryptData function
  //   return buf;
  // }

  // async function decryptData(account, data) {
  //   // Reconstructing the original object outputed by encryption
  //   const structuredData = {
  //     version: 'x25519-xsalsa20-poly1305',
  //     ephemPublicKey: data.slice(0, 32).toString('base64'),
  //     nonce: data.slice(32, 56).toString('base64'),
  //     ciphertext: data.slice(56).toString('base64'),
  //   };
  //   // Convert data to hex string required by MetaMask
  //   const ct = `0x${Buffer.from(JSON.stringify(structuredData), 'utf8').toString('hex')}`;
  //   // Send request to MetaMask to decrypt the ciphertext
  //   // Once again application must have acces to the account
  //   const decrypt = await window.ethereum.request({
  //     method: 'eth_decrypt',
  //     params: [ct, account],
  //   });
  //   // Decode the base85 to final bytes
  //   return ascii85.decode(decrypt);
  // }

  // This executes every time page renders and when myPublicKey or myContract changes
  useEffect(() => {
    async function loadFriends() {
      console.log("loadFriends");
      let friendList = [];
      // Get Friends
      try {
        // let allData = await myContract.methods["0x3b9f708d"].call();
        // console.log(allData);
        // const data1 = await myContract.methods.getAnyUser(myAddress).call();
        
        // console.log(data1);
        
        const data = await myContract.methods.getMyFriendList().call({
          from : myAddress
        });
        console.log(data);
        data.forEach((item) => {
          friendList.push({ publicKey: item[0], name: item[1], userType : parseInt(item[2]) });
        });

        console.log(friendList);
        for (var f in friendList) {
          var frProfile = await getProfileData(friendList[f].publicKey);
          friendList[f].profile = frProfile;
          var frAvatar = "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/default-avatar.png";
          if (frProfile && frProfile.profileImage) {
            frAvatar = (frProfile.profileImage[0].url).replace("ipfs://", "https://ipfs.io/ipfs/");
          }
          friendList[f].avatar = frAvatar;
        }

      } catch (err) {
        console.log(err);
        friendList = [];
      }
      setFriends(friendList);
    }
    loadFriends();
  }, [myPublicKey, myContract]);

  // Makes Cards for each Message
  const Messages = activeChatMessages
    ? activeChatMessages.map((message, index) => {
        let margin = "5%";
        let sender = activeChat.friendname;
        if (message.publicKey === myPublicKey) {
          margin = "15%";
          sender = "You";
        }
        // console.log("msg:"+index + " "+activeChatMessages);
        return (
          <Message
            marginLeft={margin}
            sender={activeChat.userType==1 || sender == "You" ? sender : getFriendInfor(message.publicKey).name}
            avatar={sender == "You" ? myAvatar :  getFriendInfor(message.publicKey).avatar}
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
            avatar={friend.avatar}
            getMessages={(key) => getMessage(key)}
          />
        );
      })
    : null;
  
  const onSendMsgText = function(text) {
    sendMessage(text);
    setMsgText("");
  }
  
  const refreshActiveMsg = function() {
    if (activeChat && activeChat.publicKey) {
      getMessage(activeChat.publicKey);
    }
  }

  const scrollToBottom = function() {
    messagesEnd.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <Container style={{ padding: "0px", border: "1px solid grey" }}>
      {/* This shows the navbar with connect button */}
      <NavBar
        
        username={myName}
        avatar={myAvatar}
        logout={async () => logout()}
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
            <div>
              <AddNewChat
                myContract={myContract}
                addHandler={(name, publicKey) => addChat(name, publicKey)}
              />
              {/* <AddNewGroup
                randomAddress={ window.web3 ? window.web3.utils.randomHex(20) : ""}
                myContract={myContract}
                addHandler={(name, publicKey) => addGroup(name, publicKey)}
              /> */}
            </div>
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
                  {
                    activeChat.publicKey 
                    ? <><Image src={activeChat.avatar} avatar /> {activeChat.friendname} : {activeChat.publicKey}</>
                    : <></>
                  }
                  <Button
                    style={{ float: "right" }}
                    variant="warning"
                    onClick={() => {
                      refreshActiveMsg();
                    }}
                  >
                    Refresh
                  </Button>
                  {/* <Button
                    style={{ float: "right" }}
                    variant="success"
                    onClick={async() => {
                      testEncriptData();
                    }}
                  >
                    Test
                  </Button> */}
                  {
                    activeChat.userType == 2 
                    ? <AddNewFriendInGroup
                      myContract={myContract}
                      addHandler={(publicKey) => addNewFriendInGroup(publicKey)}
                      />
                    : <></>
                  }
                </Card.Header>
              </Card>
            </Row>
            {/* The messages will be shown here */}
            <div
              className="MessageBox"
              style={{ height: "400px", overflowY: "auto" }}
            >
              {Messages}
              <div style={{ float:"left", clear: "both" }}
                ref={(el) => { setMyMessagesEnd(el); }}>
              </div>
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
              <Form>
                <Form.Row className="align-items-center">
                  {/* <Col xs={9}> */}
                    <InputEmoji
                      placeholder="Send Message"
                      value={msgText}
                      onChange={setMsgText}
                      onEnter={onSendMsgText}
                    />
                  {/* </Col> */}
                  {/* <Col>
                    <Button
                      className="mb-2"
                      style={{ float: "right" }}
                      onClick={() => {
                        onSendMsgText(msgText)
                      }}
                    >
                      Send
                    </Button>
                  </Col> */}
                </Form.Row>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}