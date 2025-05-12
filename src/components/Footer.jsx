const Footer = () => {
    return (
      <footer className="bg-gray-800 py-6">
        <div className="container mx-auto px-4 text-center text-gray-300">
          <p>© {new Date().getFullYear()} Vibe Coding Arcade. 保留所有權利.</p>
        </div>
      </footer>
    );
  };
  
  export default Footer;