import React from "react";

const Ship = ({ length, onDragStart }) => {
    return (
        <>
            <div
                className="ship"
                draggable
                onDragStart={(e) => onDragStart(e, length)} 
                style={{
                    width: `${length * 30}px`, 
                    height: "30px", 
                    backgroundColor: "blue",
                    margin: "5px",
                    padding: "5px",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    userSelect: "none",
                }}
            >
                Ship {length}
            </div>
            {length === 3 && (
                <div
                    className="ship"
                    draggable
                    onDragStart={(e) => onDragStart(e, length)} 
                    style={{
                        width: `${length * 30}px`, 
                        height: "30px", 
                        backgroundColor: "blue",
                        margin: "5px",
                        padding: "5px",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        userSelect: "none",
                    }}
                >
                    Ship {length}
                </div>
            )}
        </>
    );
};

export default Ship;
