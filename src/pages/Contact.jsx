// src/pages/Contact.js
import React, { useState, useEffect } from 'react';
import { realtimeDB } from '../firebase';
import { ref, get } from 'firebase/database';
import './Contact.css';

const Contact = () => {
  const [siteSettings, setSiteSettings] = useState({ phone: '', email: '' });

  useEffect(() => {
    const settingsRef = ref(realtimeDB, 'siteSettings');
    get(settingsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setSiteSettings(snapshot.val());
        } else {
          console.log("No site settings available");
        }
      })
      .catch((error) => {
        console.error("Error fetching site settings:", error);
      });
  }, []);

  return (
    <div className="contact-container container">
      <div className="contact-text">
        <h1>Contact</h1>
        <p>
          Pentru informații suplimentare ne gǎsiți la:
          <br />
          Telefon: <a href={`tel:${siteSettings.phone}`}>{siteSettings.phone}</a>
          <br />
          Email: <a href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a>
          <br />
          Adresa: Strada Ștefan cel Mare 84 A, Tășnad 445300
          <br />
        </p>
      </div>
      <div className="map-container">
        <iframe
          title="Location Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2728.517620306425!2d22.600556315654132!3d47.32301507916159!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47497831f7fbe1f1%3A0xf3d24a22ac11f41a!2sStrada%20%C8%98tefan%20cel%20Mare%2084A%2C%20T%C4%83%C8%99nad%20445300!5e0!3m2!1sro!2sro!4v1680344545958!5m2!1sro!2sro"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen=""
          aria-hidden="false"
          tabIndex="0"
        ></iframe>
      </div>
    </div>
  );
};

export default Contact;
