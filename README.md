# Yang-Liu-project3

Github repo : https://github.com/ElvaLiu2024/Yang-Liu-project3

A video Link : 

Render Link : https://yang-liu-project3.onrender.com

Write-Up
1. Challenges Faced While Making This App:
Game Logic Handling: One of the biggest challenges I faced while building this app was ensuring the game logic works correctly, especially handling the state transitions between players. Implementing the attack, turn switching, and win conditions involved careful state management, including handling timeouts and player actions.

Backend Integration: I had some challenges ensuring that data was consistently synced between the backend and frontend. Specifically, managing the game status (active, open, completed) across multiple players and updating the leaderboard correctly was tricky.

User Authentication & Cookies: Implementing user authentication securely and ensuring that the login, logout, and session persistence worked with cookies was a bit challenging, especially dealing with cookies in the frontend and backend.

Leaderboard Sorting: Sorting the leaderboard based on multiple criteria (wins, losses, and username) required careful thought to ensure accurate and efficient sorting, especially when users update their scores after each match.

2. Additional Features and Functional/Design Changes I Would Make Given More Time:
Drag-and-Drop Ship Placement (Bonus Feature): I would implement the drag-and-drop feature for ship placement, allowing users to move ships around their board for better interaction. This would require careful handling of grid placement logic and ensuring ships do not overlap.

AI Opponents (Bonus Feature): I would add AI functionality so users could play against a bot when no other player is available. The AI could be built to mimic simple game logic, offering players a challenging opponent when they don't have a partner.

More Detailed Game Over Screens: I would make the game-over screens more visually engaging by adding animations or graphics to celebrate the winner. This could include a scoreboard animation or something more interactive.

Mobile Responsiveness: Although the current design is functional, I would refine the app to ensure a smoother mobile experience by adjusting some components and ensuring the app is fully responsive across various screen sizes.

3. Assumptions Made During This Assignment:
Game Flow Assumption: I assumed that the game’s flow of actions (placing ships, attacking, waiting for a turn) would remain relatively simple and that handling these steps through API calls and frontend state changes would be manageable.

User Authentication Assumption: I assumed that users would only log in from one device at a time, which simplified some of the session management logic.

Leaderboard Data Source Assumption: I assumed that the database would store accurate user win/loss records and that no additional data validation was needed on the frontend. I did not foresee potential issues with score syncing between players.

4. How Long Did This Assignment Take to Complete?
Time Spent: The project took approximately 60 hours to complete over the course of two weeks. This included backend logic, frontend UI development, user authentication setup, and debugging. There were also challenges related to syncing the game state between players and ensuring real-time updates on the frontend.

Breakdown of Time: The time was primarily spent on:

Backend development (APIs, database schema, game logic): ~25 hours

Frontend development (UI, game board, interaction logic): ~20 hours

Testing and debugging: ~10 hours

User authentication setup: ~5 hours

Bonus part: 
Password Encryption: Ensured that user passwords are encrypted in the database to add an extra level of security.

Click and Drag Setup: Implemented click-and-drag ship placement functionality, where users can drag ships onto the board to decide their placement before the game starts.



