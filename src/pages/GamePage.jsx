import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { games } from "../data/games";
import BackButton from "../components/BackButton";
import Header from "../components/Header";

// 動態導入遊戲組件
import SpaceShooterGame from "../games/space-shooter/SpaceShooterGame";

// 遊戲組件映射
const gameComponents = {
  SpaceShooterGame
  // 當添加新遊戲時，在這裡添加更多遊戲組件
};

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  
  const game = games.find(g => g.id === gameId);
  
  useEffect(() => {
    if (!game) {
      navigate("/");
    }
  }, [game, navigate]);
  
  if (!game) {
    return null;
  }
  
  const GameComponent = gameComponents[game.component];
  
  if (!GameComponent) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">遊戲組件未找到</h2>
          <button 
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            返回主頁
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center mb-4">
          <BackButton onClick={() => navigate("/")} />
          <h1 className="text-2xl font-bold ml-4">{game.title}</h1>
        </div>
        <div className="game-container bg-gray-800 rounded-lg p-4 shadow-lg">
          <GameComponent />
        </div>
      </div>
    </div>
  );
};

export default GamePage;