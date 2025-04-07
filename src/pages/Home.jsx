// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import './Home.css';
import heroImage from '../assets/2024-01-25.jpg';
import BookingForm from '../components/BookingForm';
import ServicesList from '../components/ServicesList';
import { ref, onValue } from 'firebase/database';
import { realtimeDB } from '../firebase';

const Home = () => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [services, setServices] = useState([]);

  const openBookingModal = () => setShowBookingModal(true);
  const closeBookingModal = () => setShowBookingModal(false);

  // Fetch services from the 'services' node in Realtime Database
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

  return (
    <div>
      {/* Hero Section */}
      <section
        className="hero-section"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-text container">
          <h1>Bine ați venit la Casa Ciordaș</h1>
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
