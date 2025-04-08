export const createEmptyGrid = () => {
    const grid = [];
    for (let row = 0; row < 10; row++) {
        const newRow = [];
        for (let col = 0; col < 10; col++) {
            newRow.push("empty"); 
        }
        grid.push(newRow);
    }
    return grid;
};

export const createGridWithShips = () => {
    const grid = createEmptyGrid();
    const ships = [
        { size: 5, name: "5x1" },
        { size: 4, name: "4x1" },
        { size: 3, name: "3x1" },
        { size: 3, name: "3x1" },
        { size: 2, name: "2x1" }
    ];

    ships.forEach(ship => {
        placeShip(grid, ship);
    });

    return grid;
};

export const placeShip = (grid, ship) => {
    const shipLength = ship.size;
    const orientation = Math.random() < 0.5 ? "horizontal" : "vertical";
    let placed = false;

    while (!placed) {
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);

        if (isValidPlacement(grid, row, col, shipLength, orientation)) {
            // If valid, place the ship
            for (let i = 0; i < shipLength; i++) {
                if (orientation === "horizontal") {
                    grid[row][col + i] = ship.name;  
                } else {
                    grid[row + i][col] = ship.name;
                }
            }
            placed = true; 
        }
    }
};

export const isValidPlacement = (grid, row, col, size, orientation) => {
    if (orientation === "horizontal" && col + size > 10) return false;
    if (orientation === "vertical" && row + size > 10) return false;

    for (let i = 0; i < size; i++) {
        const r = orientation === "horizontal" ? row : row + i;
        const c = orientation === "horizontal" ? col + i : col;

        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length) {
            return false; 
        }

        if (grid[r][c] !== "empty") {
            return false; 
        }
    }
    return true;
};


export const aiAttackPlayer = (grid) => {
    let newGrid = grid.map(row => [...row]); 
    let attackSuccess = false;

    while (!attackSuccess) {
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);

        if (newGrid[row][col] === "empty") {
            newGrid[row][col] = "miss"; 
            attackSuccess = true;
        } else if (newGrid[row][col] === "ship") {
            newGrid[row][col] = "hit"; 
            attackSuccess = true;
        }
    }

    return newGrid;
};


export const checkIfGameOver = (grid) => {
    let remainingShips = 0;
    for (let row of grid) {
        for (let cell of row) {
            if (cell === "ship") {
                remainingShips++;
            }
        }
    }
    return remainingShips === 0;
};

