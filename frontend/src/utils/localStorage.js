
export const saveGameState = (gameState) => {
    localStorage.setItem("battleshipGame", JSON.stringify(gameState));
};

export const loadGameState = () => {
    const savedGame = JSON.parse(localStorage.getItem("battleshipGame"));
    return savedGame || null; 
};

export const clearGameState = () => {
    localStorage.removeItem("battleshipGame");
};

export const saveHighScore = (score) => {
    let highScores = JSON.parse(localStorage.getItem("highScores")) || [];
    highScores.push(score);
    highScores.sort((a, b) => a - b);  
    highScores = highScores.slice(0, 5);  
    localStorage.setItem("highScores", JSON.stringify(highScores));
};

export const getHighScores = () => {
    return JSON.parse(localStorage.getItem("highScores")) || [];
};
