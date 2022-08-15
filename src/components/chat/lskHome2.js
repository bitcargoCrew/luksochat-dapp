import React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router'
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import {
  NavBar,
  ChatCard,
  Message,
  AddNewChat,
  AddNewGroup,
  AddNewFriendInGroup,
  AttachAsset,
  ModelAlert,
  ShareModal
} from "./Components.js";
// import { ethers } from "ethers";
// import { abi } from "./abi";
import Web3 from 'web3';

import {getProfileData, fetchProfile, getLSP5ReceivedAssets} from "./ReadProfileFn.js";

import chatDatabaseABI from "./chat_database.json";
import { Image } from 'semantic-ui-react'

import InputEmoji from 'react-input-emoji'

import LSP7Mintable from './LSKToken/LSP7Mintable.json';
import UniversalProfile from './LSKToken/UniversalProfile.json';

// Add the contract address inside the quotes
const CONTRACT_ADDRESS = "0xf13cF1aF062C60D543D51166A3bB7684b4F59ec0";

export default function LskHome() {
  const [friends, setFriends] = useState(null);
  const [myName, setMyName] = useState(null);
  const [myAvatar, setMyAvatar] = useState("");
  const [myPublicKey, setMyPublicKey] = useState(null);
  const [ msgText, setMsgText ] = useState('')
  const [ searchText, setSearchText ] = useState('')

  const [ msgPlaceholder, setMsgPlaceholder ] = useState('Type a message');

  const [messagesEnd, setMyMessagesEnd] = useState(null);
  const [showAlert, setShowAlert] = useState({show : false, title: "Error", content: "Error"});
  const [ allUsers, setAllUsers ] = useState([])

  const router = useRouter()

  const [activeChat, setActiveChat] = useState({
    friendname: null,
    publicKey: null,
    userType: 1
  });
  const [activeChatMessages, setActiveChatMessages] = useState(null);
  const [showConnectButton, setShowConnectButton] = useState("block");
  const [myContract, setMyContract] = useState(null);
  const [myAddress, setMyAddress] = useState(null);

  const [myTimer, setMyTimer] = useState(0);


  // Save the contents of abi in a variable
  // const contractABI = abi;
  // let provider;
  // let signer;
  let web3;

  async function logout() {
    setMyPublicKey("logout");
    setMyName(null);
    setActiveChatMessages(null);
    setShowConnectButton("block");
    setFriends(null);
    setActiveChat({
      friendname: null,
      publicKey: null,
      userType: 1
    });
  }
  // Login to Metamask and check the if the user exists else creates one
  async function login() {
    web3 = new Web3(window.ethereum);
    web3.eth.handleRevert = true;
    // console.log(web3);

    window.web3 = web3;

    var address = await web3.eth.requestAccounts();
    await autoLogin();
  }
  
  async function autoLogin() {
    console.log("autoLogin");
    web3 = new Web3(window.ethereum);
    web3.eth.handleRevert = true;
    // console.log(web3);

    window.web3 = web3;
    
    let address = await web3.eth.getAccounts();
    
    console.log(address);
    if (!(address && address[0])) {
      address = await web3.eth.requestAccounts();
    }
    address = address[0];
    setMyPublicKey(address);

    // console.log(address);
    
    
    setMyAddress(address);
    
    // setConnected(address, "browserExtension");
    // console.log("done");
    // console.log(address);
    
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
      // console.log(CONTRACT_ADDRESS);
      
      setMyContract(contract);
      
      let present = await contract.methods.checkUserExists(address).call();
      
      let myProfile = await getProfileData(address);

      console.log(await fetchProfile(address));

      let username;
      if (present) {
        username = await contract.methods.getUsername(address).call();
      } else if (myProfile.name) {
        username = myProfile.name;
        await contract.methods.createAccount(username).send({
          from : address
        });
      } else {
        // username = prompt("Enter a username", "Guest");
        // if (username === "") username = "Guest";
        // await contract.methods.createAccount(username).send({
        //   from : address
        // });
        console.log("You do not have universal profile yet, please create one");
      }
      
      if (myProfile && myProfile.profileImage && myProfile.profileImage[0]) {
        setMyAvatar((myProfile.profileImage[0].url).replace("ipfs://", "https://ipfs.io/ipfs/"));
      }
      setMyName(username);
      setShowConnectButton("none");
      // fnRandomGroupId();
      // await makeFriendViaInvitationLink();
    } catch (err) {
      console.log(err);
      // alert("CONTRACT_ADDRESS not set properly!");
      setShowAlert({show: true, title: "ERROR", content: err.message});
    }
    // } else {
    //   alert("Couldn't connect to Metamask");
    // }
  }

  async function makeFriendViaInvitationLink() {
    if (router.query && router.query.invite) {
      console.log("makeFriendViaInvitationLink");
      await addChat(undefined, router.query.invite);
    }
  }

  // async function updateMyAssetList() {
  //   console.log("updateMyAssetList");
  //   console.log(myPublicKey);
  //   const myAls = await getLSP5ReceivedAssets(myPublicKey);
  //   console.log(myAls);
  //   setMyAssetList(myAls);
  // }

  // // Check if the Metamask connects
  // async function connectToMetamask() {
  //   try {
  //     await window.ethereum.enable();
  //     return true;
  //   } catch (err) {
  //     return false;
  //   }
  // }

  // Add a friend to the users' Friends List
  async function addChat(name, publicKey) {
    console.log(myContract);
    try {
      let present = await myContract.methods.checkUserExists(publicKey).call();
      if (!present) {
        // alert("Address not found: Ask them to join the app :)");
        setShowAlert({show: true, title: "ERROR", content: "Address not found: Ask them to join the app :)"});

        return;
      }
      try {
        console.log("myAddress:"+myAddress+ " > "+present);

        var frProfile = await getProfileData(publicKey);
        var userType = 1;
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
          name = frProfile.name;
          if (!name) {
            //May be this is a group
            name = await myContract.methods.getUsername(publicKey).call();
            userType = 2;
          }
        }

        var frnd = { name: name, publicKey: publicKey, userType : userType };

        frnd.profile = frProfile;
        var frAvatar = "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/default-avatar.png";
        if (frProfile && frProfile.profileImage && frProfile.profileImage[0]) {
          frAvatar = (frProfile.profileImage[0].url).replace("ipfs://", "https://ipfs.io/ipfs/");
        }
        frnd.avatar = frAvatar;

        // console.log(friends.concat(frnd));
        setFriends(friends.concat(frnd));
      } catch (err) {
        console.log(err);
        // alert(
        //   "Friend already added! You can't be friends with the same person twice ;P"
        // );
        setShowAlert({show: true, title: "WARNING", content: "Friend already added!"});

      }
    } catch (err) {
      console.log(err);
      // alert("Invalid address!");
      setShowAlert({show: true, title: "ERROR", content: "Your friend address is invalid"});

    }
  }

  // Add a friend to the users' Friends List
  async function addGroup(name, publicKey, isAssetGroup) {
    try {
      // publicKey = "0x9a5aaD239C4485861B05051bFB506EfdbEe92b25";
      try {
        console.log("myAddress:"+myAddress+ " > "+ name, publicKey, isAssetGroup);
        console.log(myContract.methods);
        await myContract.methods.createGroup(publicKey, name, isAssetGroup).send({
          from : myAddress
        }).catch((err) => {
          console.log(err);
          setShowAlert({show: true, title: "INFO", content: "Please check again your input or you have no right to create this group"});

          return;
         });

        var frAvatar = "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/default-avatar.png";
        const frnd = { name: name, publicKey: publicKey, userType : 2,  avatar: frAvatar};
        setFriends(friends.concat(frnd));
      } catch (err) {
        console.log(err);
        console.log(err.message);
        setShowAlert({show: true, title: "INFO", content: "Your group address is already added"});
      }
    } catch (err) {
      console.log(err);
      setShowAlert({show: true, title: "ERROR", content: "Your group address is not valid"});
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
        // console.log(err.message);
        setShowAlert({show: true, title: "ERROR", content: "We can not add your friend, please check with the group admin"});
      }
    } catch (err) {
      console.log(err);
      setShowAlert({show: true, title: "WARNING", content: "Your friend address is not valid"});
    }
  }

  // Sends messsage to an user
  async function sendMessage(data) {
    if (!(activeChat && activeChat.publicKey)) return;
    setMsgPlaceholder("Sending your message...");

    const recieverAddress = activeChat.publicKey;
    await myContract.methods.sendMessage(recieverAddress, data).send({
      from : myAddress
    });
    refreshActiveMsg();
    setMsgPlaceholder("Type a message");

  }

  function getFriendInfor(friendsPublicKey) {
    // console.log("getFriendInfor:" + friendsPublicKey);
    for (var i in friends) {
      if (friends[i].publicKey === friendsPublicKey) {
        return friends[i];
      }      
    }

    return {name : "Unknown"};
  }

  // Fetch chat messages with a friend
  async function getMessage(friendsPublicKey) {
 
    if (!friends) {
      return;
    }

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
        if (frProfile && frProfile.profileImage && frProfile.profileImage[0]) {
          frAvatar = (frProfile.profileImage[0].url).replace("ipfs://", "https://ipfs.io/ipfs/");
        }
        friendList[f].avatar = frAvatar;
      }

    } catch (err) {
      console.log(err);
      friendList = [];
    }
    setFriends(friendList);

    setAllUsers(await myContract.methods.viewAllUsers().call());

    // console.log(friends)
    // makeFriendViaInvitationLink();
  }

  useEffect(() => {
    console.log("useEffect");
    if (myContract) {
      console.log("before load friends");
      loadFriends();
      console.log(friends);
      if (friends) {
        makeFriendViaInvitationLink();
      }
    } else {
      autoLogin();
    }
  }, [myContract, myName]);

  // Makes Cards for each Message
  const Messages = activeChatMessages
    ? activeChatMessages.map((message, index) => {
        let margin = "5%";
        let sender = activeChat.friendname;
        if (message.publicKey === myPublicKey) {
          margin = "15%";
          sender = "You";
        }
        // console.log("msg:"+index + " ");
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
        if (friend.name.toLowerCase().indexOf(searchText.toLowerCase())>-1 || friend.publicKey.toLowerCase().indexOf(searchText.toLowerCase())>-1) {
          return (
            <ChatCard
              publicKey={friend.publicKey}
              name={friend.name}
              avatar={friend.avatar}
              isFriend={true}
              getMessages={async (key) => {
                await getMessage(key);
                scrollToBottom();
              }}
            />
          );
        }
      })
    : null;

  function findNotInChat() {
    if (searchText && friends) {

      console.log(allUsers);
      console.log(friends);
      var pbFriends = friends.map(x => x.publicKey);
      console.log(pbFriends);
      var userList = [];
      for (var ui in allUsers) {
        if (!pbFriends.includes(allUsers[ui][1]) && allUsers[ui][1]!=myPublicKey ) {
          var userName = allUsers[ui][0];
          var userAddress = allUsers[ui][1];
          if (userName.toLowerCase().indexOf(searchText.toLowerCase())>-1 || userAddress.toLowerCase().indexOf(searchText.toLowerCase())>-1) {
            userList.push({
              publicKey :userAddress,
              name: userName,
              type : allUsers[ui][3]
            })
          }
        }
      }
      // console.log(userList);
      var frAvatar = "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/default-avatar.png";

      return userList.map((friend) => {
          return (
            <ChatCard
              publicKey={friend.publicKey}
              name={friend.name}
              isFriend={false}
              userType={friend.type}
              avatar={frAvatar}
              addFriend={(e)=>{addChat(friend.name, friend.publicKey)}}
            />
          );
        })
      return (<></>)
    }
    return (<></>)
  }
  
  const onSendMsgText = async function(text) {
    setMsgText("");
    await sendMessage(text);
  }
  
  const refreshActiveMsg = function() {
      if (activeChat && activeChat.publicKey) {
        // console.log("refreshActiveMsg");
        getMessage(activeChat.publicKey);
      }
  }

  useInterval(() => {
    refreshActiveMsg();
  }, 3000)

  function useInterval(callback, delay) {
    const savedCallback = useRef();
  
    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

  const scrollToBottom = function() {
    messagesEnd.scrollIntoView({ behavior: "smooth" });
  }

  // const fnMintNewLSP7Token = async function(tokenName, amount) {
  //   // create an instance
  //   const myToken = new window.web3.eth.Contract(LSP7Mintable.abi, {
  //     gas: 5_000_000,
  //     gasPrice: '1000000000',
  //   });

  //   // deploy the token contract
  //   const myDeployedToken = await myToken.deploy({
  //       data: LSP7Mintable.bytecode,
  //       arguments: [
  //         tokenName || "LS7", // token name
  //         'LSP7', // token symbol
  //         myPublicKey, // new owner, who will mint later
  //         false, // isNonDivisible = TRUE, means NOT divisible, decimals = 0)
  //       ]
  //     })
  //     .send({
  //       from: myPublicKey,
  //     });
    
  //   await myDeployedToken.methods.mint(myPublicKey, amount, false, '0x').send({
  //     from: myPublicKey,
  //   });
  // }

  function divGroupCreate() {
    if (myPublicKey) {
      return (<AddNewGroup
        randomAddress={  window.web3.utils.randomHex(20) }
        myContract={myContract}
        addHandler={(name, publicKey, isAssetGroup) => addGroup(name, publicKey, isAssetGroup)}
      />)
    } else {
      return (<></>)
    }
  }

  function shareGroup(e) {

  }

  return (
    <Container style={{ padding: "0px", border: "1px solid grey" }}>
      {/* This shows the navbar with connect button */}
      <ModelAlert 
        showAlert={showAlert}
        onHide={()=>{setShowAlert({show: false})}}
      ></ModelAlert>
      <NavBar
        
        username={myName}
        avatar={myAvatar}
        publicKey={myPublicKey}
        logout={async () => logout()}
        login={async () => login()}
        showButton={showConnectButton}
      />
      <Row>
        {/* Here the friends list is shown */}
        <Col style={{ paddingRight: "0px", borderRight: "1px solid grey" }}>
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
                <Card.Header>
                  <Form.Control
                    required
                    size="text"
                    type="text"
                    placeholder="Search or start new chat"
                    onChange={(e)=>{setSearchText(e.target.value)}}
                  />
                </Card.Header>
              </Card>
            </Row>
            <div
              style={{ height: "405px", overflowY: "auto", paddingTop: "2mm" }}
            >
              {chats}
              {(searchText 
                ? <div>
                    <div style={{textAlign : "center", lineHeight: "0.1em", borderBottom: "1px solid #000", margin: "10px"}}>
                      <span style={{background:"rgb(220, 220, 220)" }}>Not in your list</span>
                    </div>
                    {findNotInChat()}
                  </div> 
                : <></>)}
            </div>
            <div style={{ display: "flex", paddingTop: "10px" }}>
              <AddNewChat
                myContract={myContract}
                addHandler={(name, publicKey) => addChat(name, publicKey)}
              />
              {divGroupCreate()}
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
                    ? <div style={{height: "33px", display: "flex"}}>
                        <div>
                          <Image src={activeChat.avatar} avatar /> 
                          <span style={{padding: "3px"}}>{activeChat.friendname} : {activeChat.publicKey}</span>
                        </div>
                        {
                          activeChat.userType == 2 
                          ? <div style={{marginLeft: "auto", marginRight: "12px", "display" : "inline-flex" }}>
                              <ShareModal url={window.location.href + "?invite=" +activeChat.publicKey} />
                              <AddNewFriendInGroup
                              myContract={myContract}
                              addHandler={(publicKey) => addNewFriendInGroup(publicKey)}
                              />
                          </div>
                          : <></>
                        }
                      </div>
                    : <><div style={{height: "33px"}}></div></>
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
                borderTop: "1px solid gray",
                position: "relative",
                bottom: "0px",
                padding: "10px 10px 0 10px",
                margin: "0 95px 0 0",
                width: "97%",
              }}
            >
              <Form>
                <Form.Row className="align-items-center">
                  <Col xs={11}>
                    <InputEmoji
                      placeholder={msgPlaceholder}
                      value={msgText}
                      onChange={setMsgText}
                      onEnter={onSendMsgText}
                    />
                  </Col>
                  <Col xs={1}>
                    <AttachAsset
                      name={myName}
                      address={myPublicKey}
                      currActivFriend={activeChat}
                      sendNoti={onSendMsgText}
                    />
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