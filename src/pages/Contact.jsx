// src/pages/Contact.js
import React, { useState, useEffect } from 'react';
import { realtimeDB } from '../firebase';
import { ref, get } from 'firebase/database';
import './Contact.css';

const Contact = () => {
  // Include phone, email, address and mapSrc in state.
  const [siteSettings, setSiteSettings] = useState({ 
    phone: '', 
    email: '', 
    address: '', 
    mapSrc: '' 
  });

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
          Pentru informații suplimentare ne găsiți la:
          <br />
          Telefon: <a href={`tel:${siteSettings.phone}`}>{siteSettings.phone}</a>
          <br />
          Email: <a href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a>
          <br />
          Adresa: {siteSettings.address}
          <br />
        </p>
      </div>
      <div className="map-container">
        <iframe
          title="Location Map"
          src={siteSettings.mapSrc || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1489.795138393055!2d22.56875250304182!3d47.47561181099307!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4747e62fd53a64bd%3A0xb2e48b56b4746f1c!2sCasa%20Ciordas!5e1!3m2!1sen!2sro!4v1744384870159!5m2!1sen!2sro"}
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
