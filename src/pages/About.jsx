// src/pages/About.js
import React, { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { realtimeDB } from '../firebase';
import './About.css';

const About = () => {
  const [aboutText, setAboutText] = useState('Se încarcă...');

  useEffect(() => {
    // Preluăm datele din nodul 'siteSettings'
    const settingsRef = ref(realtimeDB, 'siteSettings');
    get(settingsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setAboutText(data.about || 'Descrierea nu este disponibilă.');
        } else {
          setAboutText('Descrierea nu este disponibilă.');
        }
      })
      .catch((error) => {
        console.error("Eroare la preluarea datelor:", error);
        setAboutText('Eroare la preluarea descrierii.');
      });
  }, []);

  return (
    <div className="about-container container">
      <h1>Despre Casa Ciordas</h1>
      <p>{aboutText}</p>
    </div>
  );
};

export default About;
