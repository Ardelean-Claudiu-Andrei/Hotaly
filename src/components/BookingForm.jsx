// src/components/BookingForm.js
import React, { useState, useEffect } from 'react';
import { realtimeDB } from '../firebase';
import { ref, onValue, push, set, update, get } from 'firebase/database';
import './BookingForm.css';

// Verifică dacă intervalul selectat se suprapune cu cele rezervate
function isRoomAvailable(bookedIntervals, selectedStart, selectedEnd) {
  if (!bookedIntervals) return true;
  const intervals = bookedIntervals
    .split(";")
    .map(i => i.trim())
    .filter(Boolean);
  const s = new Date(selectedStart);
  const e = new Date(selectedEnd);
  const regex = /(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/;
  for (const interval of intervals) {
    const m = interval.match(regex);
    if (m) {
      const start = new Date(m[1]);
      const end = new Date(m[2]);
      if (s <= end && e >= start) return false;
    }
  }
  return true;
}

const BookingForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAlert, setShowAlert] = useState(false);

  const [rooms, setRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);

  // Încarcă camerele
  useEffect(() => {
    const roomsRef = ref(realtimeDB, 'rooms');
    onValue(roomsRef, snap => {
      if (snap.exists()) {
        const data = snap.val();
        setRooms(
          Object.keys(data).map(key => ({ id: key, ...data[key] }))
        );
      }
    });
  }, []);

  // Filtrează camerele disponibile
  useEffect(() => {
    if (checkIn && checkOut) {
      const filtered = rooms.filter(room =>
        isRoomAvailable(room.bookedIntervals, checkIn, checkOut) &&
        +room.capacity >= +guests
      );
      setAvailableRooms(filtered);
      setSelectedRooms([]);
    }
  }, [rooms, checkIn, checkOut, guests]);

  const toggleRoomSelection = roomId => {
    setSelectedRooms(prev =>
      prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  // Validează câmpurile
  const validate = () => {
    const newErrors = {};
    if (!/^[A-Za-zÀ-ž\s]+$/.test(name.trim()))
      newErrors.name = 'Doar litere și spații';
    if (!/.+@.+\..+/.test(email.trim()))
      newErrors.email = 'Email invalid';
    if (!/^\d{10}$/.test(phone.trim()))
      newErrors.phone = 'Telefon: exact 10 cifre';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setShowAlert(false);
    if (!validate()) {
      setShowAlert(true);
      return;
    }
    if (selectedRooms.length === 0) {
      setErrors(prev => ({ ...prev, rooms: 'Selectează cel puțin o cameră.' }));
      setShowAlert(true);
      return;
    }
    try {
      // Salvează rezervarea
      const bookingsRef = ref(realtimeDB, 'bookings');
      const newBookingRef = push(bookingsRef);
      await set(newBookingRef, {
        name,
        email,
        phone,
        checkIn,
        checkOut,
        guests,
        message,
        selectedRooms,
        createdAt: Date.now(),
      });
      // Actualizează bookedIntervals
      const newInterval = `${checkIn} - ${checkOut}`;
      for (const id of selectedRooms) {
        const roomRef = ref(realtimeDB, `rooms/${id}`);
        const snap = await get(roomRef);
        if (snap.exists()) {
          const cur = snap.val().bookedIntervals || '';
          const updated = cur ? `${cur}; ${newInterval}` : newInterval;
          await update(roomRef, { bookedIntervals: updated });
        }
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Eroare la rezervare:', err);
    }
  };

  return (
    <div className="booking-form">
      <h2>Rezervare</h2>
      {submitted ? (
        <p className="success">Rezervarea a fost trimisă și veți fi contactat în cel mai scurt timp. Vă mulțumim!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          {showAlert && (
            <div className="alert">
              Te rog corectează câmpurile evidențiate.
            </div>
          )}

          <div className="form-group">
            <label>Nume:</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className={errors.name ? 'error-field' : ''}
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={errors.email ? 'error-field' : ''}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Telefon:</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className={errors.phone ? 'error-field' : ''}
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label>Număr de persoane:</label>
            <input
              type="number"
              min="1"
              value={guests}
              onChange={e => setGuests(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Data sosirii:</label>
            <input
              type="date"
              value={checkIn}
              onChange={e => setCheckIn(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Data plecării:</label>
            <input
              type="date"
              value={checkOut}
              onChange={e => setCheckOut(e.target.value)}
            />
          </div>

          <div className="form-group full">
            <label>Mesaj:</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>

          {checkIn && checkOut && (
            <div className="room-selection">
              <h3>Camere disponibile</h3>
              {availableRooms.length === 0 ? (
                <p>Nicio cameră disponibilă.</p>
              ) : (
                <ul>
                  {availableRooms.map(r => (
                    <li key={r.id}>
                      <span>
                        Camera {r.number} – {r.capacity} pers. – {r.price} RON
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleRoomSelection(r.id)}
                      >
                        {selectedRooms.includes(r.id)
                          ? 'Anulează'
                          : 'Selectează'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <button type="submit">Trimite rezervarea</button>
        </form>
      )}
    </div>
  );
};

export default BookingForm;

