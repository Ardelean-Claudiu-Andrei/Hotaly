// src/components/Footer.js
import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer>
      <p>&copy; {new Date().getFullYear()} Casa Ciordaş. Toate drepturile rezervate.</p>
    </footer>
  );
}

export default Footer;
