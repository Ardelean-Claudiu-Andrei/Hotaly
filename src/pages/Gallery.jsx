// src/pages/Gallery.js
import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { realtimeDB } from '../firebase';
import './Gallery.css';

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    setLoading(true);
    const galleryRef = ref(realtimeDB, 'gallery');
    onValue(galleryRef, snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const galleryArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
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
          {galleryItems.map(item => (
            <div key={item.id} className="gallery-item">
              {item.imageBase64 ? (
                <div
                  className="img-container"
                  onClick={() => setSelectedImage(item.imageBase64)}
                >
                  <img
                    src={item.imageBase64}
                    alt={item.title}
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="no-image">Fără imagine</div>
              )}
              <h3>{item.title}</h3>
            </div>
          ))}
        </div>
      )}
      {selectedImage && (
        <div
          className="lightbox-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Enlarged view"
            className="lightbox-image"
          />
        </div>
      )}
    </div>
  );
};

export default Gallery;
