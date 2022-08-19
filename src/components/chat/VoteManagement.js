import React from "react";
import { useState } from "react";
import { Button, Modal, Image, Form, InputGroup } from "react-bootstrap";

// This Modal help Add a new friend
export function VoteManagement(props) {
  const [show, setShow] = useState(false);
  const [newVote, setNewVote] = useState("");
  const [pollTitle, setPollTitle] = useState("");
  const [pollDescription, setPollDescription] = useState("");

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  async function chooseVote(voteId, value) {
    // console.log(props.address);
    // console.log(value);
    handleClose();
    try{
      await props.sendNoti("#vote/vote/"+voteId+"/"+value);
    }catch(e) {
      console.log(e);
    }
  }

  async function stopVote(voteId) {
    // console.log(props.address);
    // console.log(value);
    handleClose();
    try{
      await props.sendNoti("#vote/close/"+voteId);
    }catch(e) {
      console.log(e);
    }
  }

  function triggerVoteCalculation() {
    // console.log("Vote Management");
    if (window.vote) {
      var voteList = window.vote;
      var voteLs = voteList.votes;
      var voteLsMap = [];
      for (var vvi in voteLs) {
        voteLsMap.push({
          id : vvi,
          value : voteLs[vvi]
        })
      }
      voteList.voteLsMap = voteLsMap;
    
      window.currVoteId = voteList.id;
      return (<div>
        <h4><b>{voteList.id} : {voteList.title}</b></h4>
        <h5>{voteList.description}</h5>
        {voteList.voteLsMap.map((vv)=>{
          return (<Form.Check
            label={vv.id + " ["+vv.value+"]"}
            type="radio"
            id={vv.id}
            onChange={async (e)=>{ await chooseVote(voteList.id, vv.id)}}
          />)
        })}
      </div>)
    }
    return (<></>)
  }

  async function createNewPoll(voteId, title, description) {
    handleClose();
    try{
      await props.sendNoti("#vote/create/"+voteId+"/"+title+"/"+description);
    }catch(e) {
      console.log(e);
    }
  }

  function showCurrVote() {
    if (window.vote && window.vote.id) {
      return (
        <>
          {triggerVoteCalculation()}
          <hr/>
          <InputGroup className="mb-3">
            <InputGroup.Text>New Vote</InputGroup.Text>
            <Form.Control value={newVote} onChange={(e)=>{
              setNewVote(e.target.value);
            }} />
            <Button onClick={(e)=>{
              chooseVote(window.currVoteId, newVote);
            }}>Send</Button>
          </InputGroup>
        </>
      )
    } else {
      return (<Form.Group>
        <Form.Control
          required
          size="text"
          type="text"
          placeholder="Enter the title of vote"
          onChange={(e)=>{setPollTitle(e.target.value)}}
        />
        <br />
        <Form.Control
          id="pollDescription"
          size="text"
          type="text"
          placeholder="Enter the description of vote"
          onChange={(e)=>{setPollDescription(e.target.value)}}
        />
      </Form.Group>)
    }
  }

  return (
    <div
      style={{
        padding: "10px",
      }}
    >
      <Image 
          src="vote.svg"
          style={{cursor: "pointer"}} 
          onClick={handleShow}
        ></Image>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title> Voting Management </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showCurrVote()}
        </Modal.Body>
        <Modal.Footer>
          {window.vote && window.vote.id 
          ? <Button onClick={(e)=>{
              stopVote(window.currVoteId);
            }}>Stop voting</Button>
          : <Button onClick={(e)=>{
              createNewPoll( window.web3.utils.randomHex(3), pollTitle, pollDescription);
            }}>Create new poll</Button>}
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}