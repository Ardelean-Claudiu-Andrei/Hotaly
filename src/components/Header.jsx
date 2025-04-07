// src/components/Header.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const toggleMenu = () => setMenuOpen(!menuOpen);
  
  // Închid meniul atunci când se face click pe un link
  const handleLinkClick = () => setMenuOpen(false);

  return (
    <header className="header-section">
      <div className="container nav-container">
        <div className="logo">
          <h1>Casa Ciordaş</h1>
        </div>
        <nav className="nav-menu">
          <div className="hamburger" onClick={toggleMenu}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
          <ul className={menuOpen ? 'open' : ''}>
            <li onClick={handleLinkClick}><Link to="/">Acasă</Link></li>
            <li onClick={handleLinkClick}><Link to="/about">Despre</Link></li>
            <li onClick={handleLinkClick}><Link to="/gallery">Galerie</Link></li>
            <li onClick={handleLinkClick}><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
