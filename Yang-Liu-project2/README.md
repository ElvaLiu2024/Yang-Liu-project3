# Yang-Liu-project2/Yang-Liu-project2

Github repo : https://github.com/ElvaLiu2024/Yang-Liu-project2

A video Link :

Render Link : https://yang-liu-project2-1.onrender.com

Writeup: 

1. What were some challenges you faced while making this app?
Given more time, what additional features, functional or design changes would you make?

While developing this Battleship game, I encountered several challenges, both technical and design-related:
Managing Game State: Ensuring that the game state persisted correctly across user interactions, especially for the enemy board where ships should remain hidden initially but become visible when hit.
Click Handling on Enemy Board: Implementing the logic to reveal hits (✅) and misses (X) without showing the ships initially was tricky, as we needed to track revealed cells separately.
AI Attack Logic: The AI attack function had to ensure that it didn't randomly target the same cell multiple times while also attempting to create a reasonable gameplay experience.


Given more time, what additional features, functional or design changes would you make?

Given more time, we would like to make the following enhancements:

Better AI Logic

Implement a smarter AI opponent that strategically selects targets rather than attacking randomly.
Introduce difficulty levels (Easy, Normal, Hard) where the AI adapts to the player’s moves.
Multiplayer Mode

Enable two-player functionality over a network where players can challenge each other instead of playing against AI.


What assumptions did you make while working on this assignment?

The game would follow the classic Battleship rules: the player and AI take turns attacking each other's board.
Players will use a 10x10 grid, as this is the standard for Battleship.
The enemy board ships are completely hidden until hit.
The AI does not have predictive targeting beyond random selection.
A ship must be placed entirely within the grid bounds and cannot overlap with another ship.
Players are expected to click on the enemy board to take their turn, and AI automatically attacks the player’s board after that.


How long did this assignment take to complete?
It maybe almost 10days to prepare and debug the project.

Bonus Features Attempted:
✅ Implemented AI attack logic with randomized targeting.
✅ Ensured ship placements are hidden until hit.
✅ Created a smooth restart experience with a full reset of the game state.
