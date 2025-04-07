// src/pages/Gallery.js
import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { realtimeDB } from '../firebase';
import './Gallery.css';

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const galleryRef = ref(realtimeDB, 'gallery');
    onValue(galleryRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const galleryArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        }));
        setGalleryItems(galleryArray);
      } else {
        setGalleryItems([]);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="gallery-container container">
      <h1>Galerie Foto</h1>
      {loading ? (
        <p>Se încarcă galeria...</p>
      ) : (
        <div className="gallery-grid">
          {galleryItems.map((item) => (
            <div key={item.id} className="gallery-item">
              {item.imageBase64 ? (
                <img src={item.imageBase64} alt={item.title} />
              ) : (
                <div className="no-image">Fără imagine</div>
              )}
              <h3>{item.title}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
