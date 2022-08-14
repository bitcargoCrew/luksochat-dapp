import React from "react";
import { useState, useEffect } from "react";

export function Test() {
  const [count, setCount] = useState(0);
  const [intervalId, setIntervalId] = useState(0);

  const handleClick = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(0);
      return;
    }

    const newIntervalId = setInterval(() => {
      setCount(prevCount => prevCount + 1);
    }, 1000);
    setIntervalId(newIntervalId);
  };

  return (
    <div>
      <h1>The component has been rendered for {count} seconds</h1>
      <button onClick={handleClick}>
        {intervalId ? "Stop counting" : "Start counting"}
      </button>
    </div>
  );
};