// src/components/BookingForm.js
import React, { useState, useEffect } from 'react';
import { realtimeDB } from '../firebase';
import { ref, onValue, push, set, update, get } from 'firebase/database';
import './BookingForm.css';

/**
 * Funcție de verificare a disponibilității
 * bookedIntervals: string cu format "2025-04-02 - 2025-04-05; 2025-05-10 - 2025-05-15"
 */
function isRoomAvailable(bookedIntervals, selectedStart, selectedEnd) {
  if (!bookedIntervals) return true; // dacă nu există rezervări, camera e liberă

  // Împărțim după ";" ca să obținem fiecare interval
  const intervals = bookedIntervals.split(";").map(i => i.trim()).filter(Boolean);
  const selectedStartDate = new Date(selectedStart);
  const selectedEndDate = new Date(selectedEnd);

  // Expresie regulată pentru "YYYY-MM-DD - YYYY-MM-DD"
  const regex = /(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/;

  for (const interval of intervals) {
    const match = interval.match(regex);
    if (match) {
      const startDate = new Date(match[1]);
      const endDate = new Date(match[2]);
      // Dacă intervalul selectat se intersectează cu intervalul rezervat
      if (selectedStartDate <= endDate && selectedEndDate >= startDate) {
        return false;
      }
    }
  }
  return true;
}

const BookingForm = () => {
  // State pentru datele formularului
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // State pentru camere
  const [rooms, setRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);

  // === 1. Citire camere din Realtime Database ===
  useEffect(() => {
    const roomsRef = ref(realtimeDB, 'rooms');
    onValue(roomsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Transformăm obiectul într-un array
        const roomsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        }));
        setRooms(roomsArray);
      } else {
        setRooms([]);
      }
    });
  }, []);

  // Filtrare camere disponibile pe baza datelor selectate și a capacității cerute
useEffect(() => {
  if (checkIn && checkOut) {
    const filtered = rooms.filter(room =>
      isRoomAvailable(room.bookedIntervals, checkIn, checkOut) &&
      parseInt(room.capacity, 10) >= parseInt(guests, 10)
    );
    setAvailableRooms(filtered);
    setSelectedRooms([]); // resetăm selecția dacă se schimbă intervalul sau numărul de persoane
  }
}, [rooms, checkIn, checkOut, guests]);


  // === Selecția multiplă de camere ===
  const toggleRoomSelection = (roomId) => {
    setSelectedRooms(prev =>
      prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  // === 3. Trimiterea rezervării ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // a) Salvăm rezervarea în nodul "bookings"
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

      // b) Pentru fiecare cameră selectată, actualizăm bookedIntervals
      const newInterval = `${checkIn} - ${checkOut}`;

      for (const roomId of selectedRooms) {
        const roomRef = ref(realtimeDB, `rooms/${roomId}`);
        // Luăm datele camerei din DB (ca să vedem bookedIntervals curent)
        const roomSnapshot = await get(roomRef);
        if (roomSnapshot.exists()) {
          const roomData = roomSnapshot.val();
          const currentIntervals = roomData.bookedIntervals || "";
          const updatedIntervals = currentIntervals
            ? `${currentIntervals}; ${newInterval}`
            : newInterval;
          // Facem update
          await update(roomRef, { bookedIntervals: updatedIntervals });
        }
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Eroare la trimiterea rezervării:", error);
    }
  };

  return (
    <div className="booking-form">
      <h2>Rezervare</h2>
      {submitted ? (
        <p>Rezervarea a fost trimisă. Vă mulțumim!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Câmpuri formular */}
          <div className="form-group">
            <label>Nume:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Telefon:</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Data sosirii:</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Data plecării:</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Număr de persoane:</label>
            <input
              type="number"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label>Mesaj:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Lista camerelor disponibile (dacă avem datele completate) */}
          {checkIn && checkOut && (
            <div className="room-selection">
              <h3>Camere disponibile</h3>
              {availableRooms.length === 0 ? (
                <p>Nicio cameră disponibilă pentru perioada selectată.</p>
              ) : (
                <ul>
                  {availableRooms.map((room) => (
                    <li key={room.id}>
                      <span>
                        Camera {room.number} – Capacitate: {room.capacity} – Preț: {room.price} RON
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleRoomSelection(room.id)}
                      >
                        {selectedRooms.includes(room.id)
                          ? "Anulează selecția"
                          : "Selectează"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {selectedRooms.length > 0 && (
                <div className="selected-rooms">
                  <h4>Camere selectate:</h4>
                  <ul>
                    {selectedRooms.map((id) => {
                      const room = availableRooms.find((r) => r.id === id);
                      return room ? <li key={id}>Camera {room.number}</li> : null;
                    })}
                  </ul>
                </div>
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
