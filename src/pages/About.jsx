// src/pages/About.js
import React, { useState, useEffect } from 'react';
import { ref, get, onValue } from 'firebase/database';
import { realtimeDB } from '../firebase';
import './About.css';

const About = () => {
  const [aboutText, setAboutText] = useState('Se încarcă...');
  const [siteSettings, setSiteSettings] = useState({ companyName: 'Your Name' });
  const [heroImage, setHeroImage] = useState('');

  useEffect(() => {
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

  useEffect(() => {
    const settingsRef = ref(realtimeDB, 'siteSettings');
    onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSiteSettings(snapshot.val());
      }
    });
  }, []);

  useEffect(() => {
    const backgroundRef = ref(realtimeDB, 'background');
    onValue(backgroundRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const backgroundArray = Object.keys(data).map(key => data[key]);
        if (backgroundArray.length > 0) {
          setHeroImage(backgroundArray[0].imageBase64);
        }
      } else {
        setHeroImage('');
      }
    });
  }, []);

  return (
    <>
      <section
        className="hero-section-about"
        style={{
          backgroundImage: heroImage ? `url(${heroImage})` : 'none'
        }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-text container">
          <h1>Despre {siteSettings.companyName}</h1>
        </div>
      </section>
      <div className="about-container container">
        <div className="about-content">
          <p>{aboutText}</p>
        </div>
      </div>
    </>
  );
};

export default About;
