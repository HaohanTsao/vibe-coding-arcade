import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-400">
          Vibe Coding Arcade
        </Link>
      </div>
    </header>
  );
};

export default Header;