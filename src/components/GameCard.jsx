import { Link } from "react-router-dom";

const GameCard = ({ game }) => {
  return (
    <Link 
      to={`/game/${game.id}`} 
      className="block bg-gray-800 rounded-lg overflow-hidden shadow-lg transition transform hover:scale-105"
    >
      <div className="relative" style={{ paddingBottom: '66.66%' }}>
        <img 
          src={game.coverImage} 
          alt={`${game.title} 封面`} 
          className="absolute h-full w-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x266?text=' + encodeURIComponent(game.title);
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{game.title}</h3>
        <p className="text-gray-300 text-sm">{game.description}</p>
      </div>
    </Link>
  );
};

export default GameCard;