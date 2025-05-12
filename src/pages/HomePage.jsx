import { games } from "../data/games";
import GameCard from "../components/GameCard";
import Header from "../components/Header";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-400">
          Vibe Coding Arcade
        </h1>
        <p className="text-center text-gray-300 mb-12 text-lg">
          歡迎來到 Vibe Coding Arcade！選擇一個遊戲開始你的冒險
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;