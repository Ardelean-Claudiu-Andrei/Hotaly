// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import './Home.css';
import BookingForm from '../components/BookingForm';
import ServicesList from '../components/ServicesList';
import { ref, onValue } from 'firebase/database';
import { realtimeDB } from '../firebase';

const Home = () => {
  // State-uri pentru Booking Modal și servicii
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [services, setServices] = useState([]);

  // Nou: State pentru hero image (background)
  const [heroImage, setHeroImage] = useState('');

  // Nou: State pentru setările site-ului (unde avem și numele firmei)
  const [siteSettings, setSiteSettings] = useState({ companyName: 'Your Name' });

  // Funcții de deschidere/închidere Booking Modal
  const openBookingModal = () => setShowBookingModal(true);
  const closeBookingModal = () => setShowBookingModal(false);

  // --------------------- Preluarea serviciilor din Realtime Database ---------------------
  useEffect(() => {
    const servicesRef = ref(realtimeDB, 'services');
    onValue(servicesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const servicesArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setServices(servicesArray);
      } else {
        setServices([]);
      }
    });
  }, []);

  // --------------------- Preluarea imaginii de fundal (hero image) din nodul "background" ---------------------
  useEffect(() => {
    const backgroundRef = ref(realtimeDB, 'background');
    onValue(backgroundRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Dacă background-ul este stocat ca mai multe elemente, extragem primul
        const backgroundArray = Object.keys(data).map((key) => data[key]);
        if (backgroundArray.length > 0) {
          setHeroImage(backgroundArray[0].imageBase64);
        }
      } else {
        // Se poate seta o imagine implicită sau un string gol
        setHeroImage('');
      }
    });
  }, []);

  // --------------------- Preluarea setărilor site-ului (inclusiv numele firmei) ---------------------
  useEffect(() => {
    const siteSettingsRef = ref(realtimeDB, 'siteSettings');
    onValue(siteSettingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSiteSettings(snapshot.val());
      }
    });
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        className="hero-section"
        style={{ backgroundImage: heroImage ? `url(${heroImage})` : 'none' }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-text container">
          <h1>Bine ați venit la {siteSettings.companyName}</h1>
          <p>Descoperiți frumusețea naturii și confortul pensiunii noastre.</p>
          <button className="primary-btn" onClick={openBookingModal}>
            Rezervă acum
          </button>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <div className="section-title">
            <h2>Serviciile noastre</h2>
          </div>
          {services.length > 0 ? (
            <ServicesList services={services} />
          ) : (
            <p>Se încarcă serviciile...</p>
          )}
        </div>
      </section>

      {/* Booking Form Modal */}
      {showBookingModal && (
        <div className="modal-overlay" onClick={closeBookingModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeBookingModal}>
              ×
            </button>
            <BookingForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
