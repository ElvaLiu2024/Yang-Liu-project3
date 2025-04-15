import React, { useEffect, useState } from "react";

const Timer = ({ initialTime, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (typeof initialTime === "number") {
      setTimeLeft(initialTime);
    }
  }, [initialTime]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          clearInterval(timerInterval);
          onTimeUp && onTimeUp();
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timeLeft, onTimeUp]);

  return (
    <div className="time-left" style={{ color: "red", fontWeight: "bold" }}>
      Time Left: {timeLeft}s
    </div>
  );
};

export default Timer;
