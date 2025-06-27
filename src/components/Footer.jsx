// src/components/Footer.js
import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { realtimeDB } from '../firebase';
import './Footer.css';

function Footer() {
  const [companyName, setCompanyName] = useState('Your Name');

  useEffect(() => {
    const settingsRef = ref(realtimeDB, 'siteSettings');
    onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const settings = snapshot.val();
        if (settings.companyName) {
          setCompanyName(settings.companyName);
        }
      }
    });
  }, []);

  return (
    <footer>
      <p>&copy; {new Date().getFullYear()} {companyName}. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
