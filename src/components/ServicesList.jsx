// src/components/ServicesList.js
import React from 'react';
import './ServicesList.css';

const ServicesList = ({ services }) => {
  return (
    <div className="services-list">
      {services.map((service, index) => (
        <div
          key={service.id}
          className="service-box animate-item"
          style={{ animationDelay: `${index * 0.1}s` }}  // decalaj în animație
        >
          {service.imageBase64 ? (
            <img src={service.imageBase64} alt={service.title} className="service-image" />
          ) : (
            <div className="no-image">No image</div>
          )}
          <h3 className="service-title">{service.title}</h3>
          <p className="service-description">{service.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ServicesList;
