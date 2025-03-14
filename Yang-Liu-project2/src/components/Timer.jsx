import React, {useState, useEffect} from "react";

import "../styles/Timer.css";

const Timer = ({ gameStarted, gameOver, onTimeUpdate }) => {
    const [time, setTime] = useState(0);

    useEffect(() => {
        let interval;
        
        if (gameStarted && !gameOver) {
            interval = setInterval(() => {
                setTime(prevTime => prevTime + 1);
                onTimeUpdate(prevTime => prevTime + 1);
            }, 1000);
        } else {
            clearInterval(interval);
            if (!gameStarted) setTime(0); 
        }

        return () => clearInterval(interval);
    }, [gameStarted, gameOver]); 

    return <div className="timer">Time Started: {time < 10 ? `00:0${time}` : `00:${time}`}</div>;
};

export default Timer;