import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Pensiune Tășnad</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:text-blue-600">Acasă</Link>
        <Link to="/despre" className="hover:text-blue-600">Despre Noi</Link>
        <Link to="/galerie" className="hover:text-blue-600">Galerie</Link>
        <Link to="/contact" className="hover:text-blue-600">Contact</Link>
      </div>
    </nav>
  );
}

export default Navbar;