# Vibe Coding Arcade

I vibe coded these games.

## Quick Start

### First-time Setup with Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/HaohanTsao/vibe-coding-arcade.git
cd vibe-coding-arcade
```

2. Build and start with Docker:
```bash
docker compose up --build
```

3. Access the arcade at http://localhost:5173

## Running the Project

### With Docker
```bash
# Start containers
docker compose up

# Stop containers
docker compose down

# Rebuild after Dockerfile changes
docker compose up --build
```

## Adding a New Game

1. Create a game folder in `src/games/`
2. Add your game component, e.g., `PuzzleGame.jsx`
3. Register your game in `src/data/games.js`
4. Import and add your game component to `gameComponents` in `src/pages/GamePage.jsx`
5. Add a cover image to `public/assets/images/game-covers/`