import React from "react";
import { useState } from "react";
import { Button, Modal, Image, Form } from "react-bootstrap";

// This Modal help Add a new friend
export function VoteManagement(props) {
  const [show, setShow] = useState(false);
  const [divVoting, setDivVoting] = useState(null);
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

  function triggerVoteCalculation() {
    // console.log("Vote Management");
    if (window.vote) {
      var voteList = window.vote;
      var mapVoteList = [];
      for (var vi in voteList) {
        var voteLs = voteList[vi].votes;
        var voteLsMap = [];
        for (var vvi in voteLs) {
          voteLsMap.push({
            id : vvi,
            value : voteLs[vvi]
          })
        }
        voteList[vi].voteLsMap = voteLsMap;
        mapVoteList.push(voteList[vi]);
      }
      return mapVoteList.map((v)=> {
        // console.log(v)
        return (<div>
          <h4>{v.id} : {v.title}</h4><br/>
          <h5>{v.description}</h5><br/>
          {v.voteLsMap.map((vv)=>{
            return (<Form.Check
              label={vv.id + " ["+vv.value+"]"}
              type="radio"
              id={vv.id}
              onChange={async (e)=>{ await chooseVote(v.id, vv.id)}}
            />)
          })}
        </div>)
      })
    }
    return (<></>)
  }

  return (
    <div
      style={{
        padding: "13px",
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
          {triggerVoteCalculation()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}