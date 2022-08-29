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
  ShareModal,
  Loading,
  VoteManagement
} from "./Components.js";
// import { ethers } from "ethers";
// import { abi } from "./abi";
import Web3 from 'web3';

import {getProfileData, fetchProfile, getBackground} from "./ReadProfileFn.js";

import chatDatabaseABI from "./chat_database.json";
import { Image } from 'semantic-ui-react'

import InputEmoji from 'react-input-emoji'

// Add the contract address inside the quotes
const CONTRACT_ADDRESS = "0x2ba4F98CAcbE1172bC36e71920547D21265a8cd5";
// const DEFAULT_AVATAR = "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/default-avatar.png"
const DEFAULT_AVATAR = "logo.svg"

export default function LskHome() {
  const [friends, setFriends] = useState(null);
  const [myName, setMyName] = useState(null);
  const [myAvatar, setMyAvatar] = useState("");
  const [myPublicKey, setMyPublicKey] = useState(null);
  const [myProfile, setMyProfile] = useState({});
  const [ msgText, setMsgText ] = useState('');
  const [ searchText, setSearchText ] = useState('');

  const [ loadingActive, setLoadingActive ] = useState(false);

  const [messagesEnd, setMyMessagesEnd] = useState(null);
  const [showAlert, setShowAlert] = useState({show : false, title: "Error", content: "Error"});
  const [ allUsers, setAllUsers ] = useState([])
  const [effectStep, setEffectStep] = useState(0);

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
    // setLoadingActive(true);

    web3 = new Web3(window.ethereum);
    web3.eth.handleRevert = true;

    window.web3 = web3;

    var address = await web3.eth.requestAccounts();
    await autoLogin();
    
    // setLoadingActive(false);

  }
  
  async function autoLogin() {
    web3 = new Web3(window.ethereum);
    web3.eth.handleRevert = true;

    window.web3 = web3;
    
    let address = await web3.eth.getAccounts();
    
    if (!(address && address[0])) {
      address = await web3.eth.requestAccounts();
    }
    address = address[0];
    setMyPublicKey(address);    
    
    setMyAddress(address);
    
    try {
      const contract = new web3.eth.Contract(
        chatDatabaseABI.abi,
        CONTRACT_ADDRESS
      );
      
      setMyContract(contract);
      
      let present = await contract.methods.checkUserExists(address).call();
      
      let myFProfile = await getProfileData(address);

      let username;
      if (present) {
        username = await contract.methods.getUsername(address).call();
      } else if (myFProfile.name) {
        username = myFProfile.name;
        await contract.methods.createAccount(username).send({
          from : address
        });
      } else {
        setShowAlert({show: true, title: "ERROR", content: "You do not have universal profile yet, please create one"});
      }
      

      var myFullProfile = {};
      myFullProfile.name = username;
      myFullProfile.profile = myFProfile;
      myFullProfile.publicKey = address;

      if (myFProfile && myFProfile.profileImage && myFProfile.profileImage[0]) {
        var fAvatar = (myFProfile.profileImage[0].url).replace("ipfs://", "https://ipfs.io/ipfs/");
        setMyAvatar(fAvatar);
        myFullProfile.avatar=fAvatar;
      }
      setMyName(username);
      setShowConnectButton("none");

      setMyProfile(myFullProfile);
      // fnRandomGroupId();
      // await makeFriendViaInvitationLink();
    } catch (err) {
      setShowAlert({show: true, title: "ERROR", content: err.message});
    }
    // } else {
    //   alert("Couldn't connect to Metamask");
    // }
  }

  async function makeFriendViaInvitationLink() {
    if (router.query && router.query.invite) {
      setLoadingActive(true);

      await addChat(undefined, router.query.invite);

      setLoadingActive(false);

    }
  }

  // Add a friend to the users' Friends List
  async function addChat(name, publicKey) {
    try {
      setLoadingActive(true);

      let present = await myContract.methods.checkUserExists(publicKey).call();
      if (!present) {
        setShowAlert({show: true, title: "ERROR", content: "Address not found: Ask them to join the app :)"});

        return;
      }
      try {

        var frProfile = await getProfileData(publicKey);
        var userType = 1;
        if (name) {
          await myContract.methods.addFriend(publicKey, name).send({
            from : myAddress
          });
        } else {

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
        var frAvatar = "";
        if (frProfile && frProfile.profileImage && frProfile.profileImage[0]) {
          frAvatar = (frProfile.profileImage[0].url).replace("ipfs://", "https://ipfs.io/ipfs/");
        }
        if (!frAvatar) {
          frAvatar = (await myContract.methods.viewUser(publicKey).call())[5];
          frAvatar = frAvatar.replace("ipfs://", "https://ipfs.io/ipfs/");
          if (!frAvatar) {
            frAvatar = DEFAULT_AVATAR;
          }
        }

        frnd.avatar = frAvatar;

        setFriends(friends.concat(frnd));

        setLoadingActive(false);

      } catch (err) {
        setLoadingActive(false);

        setShowAlert({show: true, title: "WARNING", content: "Friend already added!"});

      }
    } catch (err) {

      setLoadingActive(false);

      setShowAlert({show: true, title: "ERROR", content: "Your friend address is invalid"});

    }
  }

  // Add a friend to the users' Friends List
  async function addGroup(name, publicKey, isAssetGroup, avatar) {
    try {
      // publicKey = "0x9a5aaD239C4485861B05051bFB506EfdbEe92b25";
      try {
        setLoadingActive(true);

        try{
          await myContract.methods.createGroup(publicKey, name, isAssetGroup, avatar).send({
            from : myAddress
          })
          const frnd = { name: name, publicKey: publicKey, userType : 2,  avatar: avatar};
          setFriends(friends.concat(frnd));
          setLoadingActive(false);
        } catch(err2) {
          setLoadingActive(false);

          setShowAlert({show: true, title: "INFO", content: "Please check again your input or you have no right to create this group.\nError message:"+err2.message});
        };

      } catch (err1) {

        setLoadingActive(false);

        setShowAlert({show: true, title: "INFO", content: "Your group address is already added.\nError message:"+err1.message});
      }
    } catch (err) {
      setLoadingActive(false);

      setShowAlert({show: true, title: "ERROR", content: "Your group address is not valid.\nError message:"+err.message});
    }
  }

  // Add a friend to the users' Friends List
  async function addNewFriendInGroup(publicKey) {
    try {
      // publicKey = "0x9a5aaD239C4485861B05051bFB506EfdbEe92b25";
      try {
        setLoadingActive(true);

        await myContract.methods.addMemToGroup(activeChat.publicKey, publicKey).send({
          from : myAddress
        })

        setLoadingActive(false);

      } catch (err) {
        setLoadingActive(false);
        setShowAlert({show: true, title: "ERROR", content: "We can not add your friend, please check with the group admin"});
      }
    } catch (err) {
      setLoadingActive(false);

      setShowAlert({show: true, title: "WARNING", content: "Your friend address is not valid"});
    }
  }

  // Sends messsage to an user
  async function sendMessage(data) {
    if (!(activeChat && activeChat.publicKey)) return;
    try{
      setLoadingActive(true);

      const recieverAddress = activeChat.publicKey;
      await myContract.methods.sendMessage(recieverAddress, data).send({
        from : myAddress
      });
      // refreshActiveMsg();
      await getMessage(activeChat.publicKey);
      setLoadingActive(false);
      scrollToBottom();

    }catch(e) {
      setLoadingActive(false);
      setShowAlert({show: true, title: "WARNING", content: "We can not send your messsage. ERROR:"+e.message});
    }
  }

  function getFriendInfor(friendsPublicKey) {
    for (var i in friends) {
      if (friends[i].publicKey === friendsPublicKey) {
        return friends[i];
      }      
    }

    return {name : "Unknown"};
  }

  function collectFuncInMessage(publicKey, data, targetVotingAddress) {
    // #vote/create/id/title/description
    // #vote/vote/id/value
    // #vote/show/id
    // #vote/close/id
    if (data.indexOf("#")==0) {
      var lsDt = data.split("/");
      if (lsDt[0]=="#vote"){
        if (lsDt[1]=="create") {
          window.vote={
            id : lsDt[2],
            title : lsDt[3],
            description: lsDt[4],
            targetVotingAddress,
            votes : {},
            voteAcc : {}
          }
          return "<i><b><u>Bot: </u></b></i><i>Has created a poll:"+lsDt[3]+", lets vote</i>";
        } else if (lsDt[1]=="vote" && window.vote.votes) {
          if (!window.vote.voteAcc[publicKey]) {
            var currValue = window.vote.votes[lsDt[3]];
            window.vote.votes[lsDt[3]] = (currValue ? currValue : 0 ) + 1;
            window.vote.voteAcc[publicKey]=lsDt[3];
            return "<i><b><u>Bot: </u></b></i><i>Has a vote '"+window.vote.title+"' for "+lsDt[3]+"</i>";
          }
          return "<i><b><u>Bot:</u></b></i><i>Has a vote for "+lsDt[3]+" but it is a duplicated vote, the next votes are not valid</i>";
        } else if (lsDt[1]=="show" && window.vote.votes) {
          var rs = "<i><b><u>Bot: </u></b></i><i>Vote id "+lsDt[2]+" : "+window.vote.title+"<br/> Description:"+window.vote.description+"</i><br/>";
          var lsRs = window.vote.votes;
          for(var vi in lsRs) {
            rs += "<i> • " + vi + ":" + lsRs[vi]+"</i><br/>"
          }
          return rs;
        } else if (lsDt[1]=="close") {
          var rs = "<i><b><u>Bot: </u></b></i><i>Vote id "+lsDt[2]+" : "+window.vote.title+"<br/> Description:"+window.vote.description+"</i><br/>";
          var lsRs = window.vote.votes;
          var totalVote = 0;
          for(var vi in lsRs) {
            totalVote += lsRs[vi];
          }
          for(var vi in lsRs) {
            rs += "<i> • " + vi + " : " + parseInt(lsRs[vi]*100/totalVote) +"%</i><br/>"
          }
          rs += "<i>The vote has been requested to close, thank for your contribution</i>"
          window.vote = {};
          return rs;
        }
      }
      return "<i><b><u>Bot: </u></b></i><i>has created an invalid query, it will be not visible</i>"
    }
    return data;
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

    window.vote = {};

    data.forEach((item) => {
      const timestamp = new Date(1000 * parseInt(item[1])).toUTCString();
      messages.push({
        publicKey: item[0],
        timeStamp: timestamp,
        data: collectFuncInMessage(item[0], item[2], friendsPublicKey)
      });
    });

    setActiveChat({ friendname: nickname, publicKey: friendsPublicKey, userType: userType, avatar });
    setActiveChatMessages(messages);

  }

  async function loadFriends() {
    let friendList = [];
    // Get Friends
    try {
      
      setLoadingActive(true);

      const data = await myContract.methods.getMyFriendList().call({
        from : myAddress
      });
      data.forEach((item) => {
        friendList.push({ publicKey: item[0], name: item[1], userType : parseInt(item[2]) });
      });

      for (var f in friendList) {
        var frProfile = await getProfileData(friendList[f].publicKey);
        friendList[f].profile = frProfile;
        var frAvatar = "";
        if (frProfile && frProfile.profileImage && frProfile.profileImage[0]) {
          frAvatar = (frProfile.profileImage[0].url).replace("ipfs://", "https://ipfs.io/ipfs/");
        }
        if (!frAvatar) {
        // console.log("####################################");
          frAvatar = (await myContract.methods.viewUser(friendList[f].publicKey).call())[5];
          frAvatar = frAvatar.replace("ipfs://", "https://ipfs.io/ipfs/");
          if (!frAvatar) {
            frAvatar = DEFAULT_AVATAR;
          }
        }
        friendList[f].avatar = frAvatar;
      }

      setFriends(friendList);
      setAllUsers(await myContract.methods.viewAllUsers().call());
      
      setEffectStep(1);
      
      setLoadingActive(false);

    } catch (err) {
      console.log(err);
      setLoadingActive(false);

      // friendList = [];
      setFriends([]);
    }

    // console.log(friends)
    // makeFriendViaInvitationLink();
  }

  useEffect(() => {
    // console.log("useEffect");
    if (myContract) {
      // console.log("before load friends");
      loadFriends();
      // console.log(friends);
      if (friends) {
        makeFriendViaInvitationLink();
      }
    } else {
      autoLogin();
    }
  }, [myContract, effectStep]);

  // Makes Cards for each Message
  const Messages = activeChatMessages
    ? activeChatMessages.map((message, index) => {
        let margin = "5%";
        let sender = activeChat.friendname;
        if (message.publicKey === myPublicKey) {
          margin = "36%";
          sender = "You";
        }
        // console.log("msg:"+index + " ");
        return (
          <Message
            key={message.publicKey+message.timeStamp}
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
              key={friend.publicKey}
              publicKey={friend.publicKey}
              name={friend.name}
              avatar={friend.avatar}
              isFriend={true}
              fullProfile={friend}
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

      // console.log(allUsers);
      // console.log(friends);
      var pbFriends = friends.map(x => x.publicKey);
      // console.log(pbFriends);
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
      // var frAvatar = "https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/default-avatar.png";
      var frAvatar = DEFAULT_AVATAR;

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
      // setRandomAddress(window.web3.utils.randomHex(20));

      return (<AddNewGroup
        randomAddress={window.web3.utils.randomHex(20)}
        myContract={myContract}
        addHandler={(name, publicKey, isAssetGroup, avatar) => addGroup(name, publicKey, isAssetGroup, avatar)}
      />)
    } else {
      return (<></>)
    }
  }

  return (
    <div style={{ padding: "0px"}}>
      {/* This shows the navbar with connect button */}
      <ModelAlert 
        showAlert={showAlert}
        onHide={()=>{setShowAlert({show: false})}}
      ></ModelAlert>
      <Loading active={loadingActive}></Loading>
      <NavBar
        
        username={myName}
        avatar={myAvatar}
        publicKey={myPublicKey}
        fullProfile={myProfile}
        logout={async () => logout()}
        login={async () => login()}
        showButton={showConnectButton}
      />
      <Row style={{height: "100%"}}>
        {/* Here the friends list is shown */}
        <Col style={{ paddingRight: "0px", borderRight: "1px solid grey" }}>
          <div
            style={{
              backgroundColor: "#cac9c9",
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
              style={{ height: "603px", overflowY: "auto", paddingTop: "2mm" }}
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
                  margin: "0 0 0 15px",
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
                              <ShareModal url={window.location.origin+window.location.pathname + "?invite=" +activeChat.publicKey} />
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
              style={{ ...getBackground(), height: "600px", overflowY: "auto" }}
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
                padding: "10px",
                margin: "0 95px 0 0",
                width: "100%",
              }}
            >
              <Form>
                <Form.Row className="align-items-center">
                  <Col xs={11}>
                    <InputEmoji
                      placeholder={"Type your message.."}
                      value={msgText}
                      onChange={setMsgText}
                      onEnter={onSendMsgText}
                    />
                  </Col>
                  <Col xs={1}>
                    {activeChat && activeChat.userType==1 
                      ? <AttachAsset
                          name={myName}
                          address={myPublicKey}
                          currActivFriend={activeChat}
                          sendNoti={onSendMsgText}
                          setLoadingActive={setLoadingActive}
                        />
                      : <></>}
                    {activeChat && activeChat.userType==2
                      ? <VoteManagement
                          address={myPublicKey}
                          sendNoti={onSendMsgText}
                        />
                      : <></>}
                  </Col>
                </Form.Row>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}