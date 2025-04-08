import React, { useEffect, useState } from "react";
import "../styles/Timer.css";

const Timer = ({ active, initialTime = 30 }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (!active) return;

    setTimeLeft(initialTime); // Reset on turn change
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active, initialTime]);

  return (
    <div className="timer">
      <span>Time Left: {timeLeft}s</span>
    </div>
  );
};

export default Timer;
