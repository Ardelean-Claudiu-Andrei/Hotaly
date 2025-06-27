import React, { useState, useEffect } from 'react';
import { auth, realtimeDB, storage } from '../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, onValue, push, set, update, remove, get } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

// ================== Helper Functions ==================

// Convert file to Base64
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// ================== Componentul Principal - AdminPanel ==================

const AdminPanelClient = () => {
  // ================== State-uri Generale & Autentificare ==================
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sidebar selection: 'camere', 'rezervari', 'altele', 'galerie', 'datele'
  const [selectedMenuItem, setSelectedMenuItem] = useState('camere');

  // ================== State-uri pentru gestionarea camerelor ==================
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newRoom, setNewRoom] = useState({ number: '', capacity: '', price: '' });
  const [editRoom, setEditRoom] = useState({ id: '', number: '', capacity: '', price: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // ================== State-uri pentru gestionarea rezervărilor ==================
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [editBooking, setEditBooking] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: '',
    message: '',
    selectedRooms: []
  });
  const [showEditBookingModal, setShowEditBookingModal] = useState(false);

  // ================== State-uri pentru setările site-ului (Datele noastre) ==================
  const [siteSettings, setSiteSettings] = useState({ phone: '', about: '', email: '', address: '', companyName: 'Your Name', mapSrc: ''});
  const [settingsLoading, setSettingsLoading] = useState(false);

  // ================== State-uri pentru gestionarea serviciilor ==================
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [newService, setNewService] = useState({ title: '', description: '' });
  const [serviceImageFile, setServiceImageFile] = useState(null);
  const [editService, setEditService] = useState({ id: '', title: '', description: '', imageUrl: '' });
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);

  // New state for background image file (for services) – Notificare: folosit similar cu imageFile în alte secțiuni
  const [serviceBgImageFile, svetServiceBgImageFile] = useState(null);

  // ================== State-uri pentru gestionarea galeriei ==================
  const [gallery, setGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [newGallery, setNewGallery] = useState({ title: '' });
  const [galleryImageFile, setGalleryImageFile] = useState(null);
  const [editGallery, setEditGallery] = useState({ id: '', title: '', imageBase64: '' });
  const [showAddGalleryModal, setShowAddGalleryModal] = useState(false);
  const [showEditGalleryModal, setShowEditGalleryModal] = useState(false);

  // State-uri pentru background
  const [background, setBackground] = useState([]);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [newBackground, setNewBackground] = useState({ title: '', description: '' });
  const [backgroundImageFile, setBackgroundImageFile] = useState(null);
  const [editBackground, setEditBackground] = useState({ id: '', title: '', description: '', imageBase64: '' });

  // Pentru modale (dacă le folosești separat)
  const [showAddBackgroundModal, setShowAddBackgroundModal] = useState(false);
  const [showEditBackgroundModal, setShowEditBackgroundModal] = useState(false);

  // ================== Funcții de Autentificare ==================
  const navigate = useNavigate();
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
      });
    
      return () => unsubscribe();
    }, []);
    
    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        const email = userCredential.user.email;
    
        if (email === 'aclaudiuandrei586@gmail.com') {
          navigate('/admindev');
        } else if (email === 'adresaclient@gmail.com') {
          navigate('/adminpage');
        } else {
          alert("Acces interzis.");
          await signOut(auth);
        }
      } catch (error) {
        console.error("Eroare la login:", error);
      }
    };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate('/admin');
    } catch (error) {
      console.error("Eroare la logout:", error);
    }
  };

  // ================== Funcții pentru gestionarea camerelor ==================

  // Preluare camere din baza de date
  const fetchRooms = async () => {
    setLoading(true);
    const roomsRef = ref(realtimeDB, 'rooms');
    onValue(roomsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const roomsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        }));
        setRooms(roomsArray);
      } else {
        setRooms([]);
      }
      setLoading(false);
    });
  };

  // Adăugare cameră nouă
  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const roomsRef = ref(realtimeDB, 'rooms');
      const newRoomRef = push(roomsRef);
      await set(newRoomRef, {
        number: newRoom.number,
        capacity: parseInt(newRoom.capacity, 10),
        price: parseFloat(newRoom.price),
        bookedIntervals: ""
      });
      setNewRoom({ number: '', capacity: '', price: '' });
      setShowAddModal(false);
    } catch (error) {
      console.error("Eroare la adăugarea camerei:", error);
    }
  };

  // Deschide modalul de editare a unei camere
  const handleOpenEditModal = (room) => {
    setEditRoom({
      id: room.id,
      number: room.number,
      capacity: room.capacity,
      price: room.price
    });
    setShowEditModal(true);
  };

  // Editare cameră existentă
  const handleEditRoom = async (e) => {
    e.preventDefault();
    try {
      const roomRef = ref(realtimeDB, `rooms/${editRoom.id}`);
      await update(roomRef, {
        number: editRoom.number,
        capacity: parseInt(editRoom.capacity, 10),
        price: parseFloat(editRoom.price)
      });
      setShowEditModal(false);
    } catch (error) {
      console.error("Eroare la actualizarea camerei:", error);
    }
  };

  // Ștergere cameră
  const handleDeleteRoom = async (id) => {
    try {
      const roomRef = ref(realtimeDB, `rooms/${id}`);
      await remove(roomRef);
    } catch (error) {
      console.error("Eroare la ștergerea camerei:", error);
    }
  };

  // ================== Funcții pentru gestionarea rezervărilor ==================

  // Preluare rezervări din baza de date
  const fetchBookings = async () => {
    setBookingsLoading(true);
    const bookingsRef = ref(realtimeDB, 'bookings');
    onValue(bookingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const bookingsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        }));
        setBookings(bookingsArray);
      } else {
        setBookings([]);
      }
      setBookingsLoading(false);
    });
  };

  // Deschide modalul pentru editarea unei rezervări
  const handleOpenEditBookingModal = (booking) => {
    setEditBooking({ ...booking });
    setShowEditBookingModal(true);
  };

  // Editare rezervare
  const handleEditBooking = async (e) => {
    e.preventDefault();
    try {
      const bookingRef = ref(realtimeDB, `bookings/${editBooking.id}`);
      await update(bookingRef, {
        name: editBooking.name,
        email: editBooking.email,
        phone: editBooking.phone,
        checkIn: editBooking.checkIn,
        checkOut: editBooking.checkOut,
        guests: editBooking.guests,
        message: editBooking.message,
        selectedRooms: editBooking.selectedRooms,
      });
      setShowEditBookingModal(false);
    } catch (error) {
      console.error("Eroare la actualizarea rezervării:", error);
    }
  };

  // Ștergere rezervare
  const handleDeleteBooking = async (id) => {
    try {
      const bookingRef = ref(realtimeDB, `bookings/${id}`);
      await remove(bookingRef);
    } catch (error) {
      console.error("Eroare la ștergerea rezervării:", error);
    }
  };

  // ================== Funcții pentru setările site-ului (Datele noastre) ==================

  // Preluare setări site
  const fetchSiteSettings = async () => {
    setSettingsLoading(true);
    const settingsRef = ref(realtimeDB, 'siteSettings');
    const snapshot = await get(settingsRef);
    if (snapshot.exists()) {
      setSiteSettings(snapshot.val());
    }
    setSettingsLoading(false);
  };

  // Salvare setări site
  const handleSiteSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const settingsRef = ref(realtimeDB, 'siteSettings');
      await update(settingsRef, siteSettings);
      alert("Setările au fost actualizate!");
    } catch (error) {
      console.error("Eroare la actualizarea setărilor:", error);
    }
  };
  

  // ================== Funcții pentru gestionarea serviciilor si background-ului ==================

  // Preluare servicii
  const fetchServices = async () => {
    setServicesLoading(true);
    const servicesRef = ref(realtimeDB, 'services');
    onValue(servicesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const servicesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        }));
        setServices(servicesArray);
      } else {
        setServices([]);
      }
      setServicesLoading(false);
    });
  };
  const fetchBackground = async () => {
    setBackgroundLoading(true);
    const backgroundRef = ref(realtimeDB, 'background');
    onValue(backgroundRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Dacă background este un singur obiect, poți seta starea direct,
        // sau dacă e listă, mapează cheile ca la celelalte funcții.
        const backgroundArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setBackground(backgroundArray);
      } else {
        setBackground([]);
      }
      setBackgroundLoading(false);
    });
  };
  

  // Adăugare serviciu (fără Storage, folosind Base64)
  const handleAddService = async (e) => {
    e.preventDefault();
    let imageBase64 = "";
    try {
      if (serviceImageFile) {
        imageBase64 = await convertFileToBase64(serviceImageFile);
      }
      const servicesRef = ref(realtimeDB, 'services');
      const newServiceRef = push(servicesRef);
      await set(newServiceRef, {
        title: newService.title,
        description: newService.description,
        imageBase64
      });
      setNewService({ title: '', description: '' });
      setServiceImageFile(null);
      setShowAddServiceModal(false);
    } catch (error) {
      console.error("Eroare la adăugarea serviciului:", error);
    }
  };

  const handleAddBackground = async (e) => {
    e.preventDefault();
  
    // Check if a background already exists.
    if (background.length > 0) {
      alert("Un background există deja. Ștergeți-l înainte de a adăuga altul.");
      return;
    }
  
    try {
      if (!backgroundImageFile) {
        alert("Selectează o imagine pentru background!");
        return;
      }
      const imageBase64 = await convertFileToBase64(backgroundImageFile);
      const backgroundRef = ref(realtimeDB, 'background');
      const newBackgroundRef = push(backgroundRef);
      await set(newBackgroundRef, {
        title: newBackground.title,
        description: newBackground.description,
        imageBase64: imageBase64,
      });
      setNewBackground({ title: '', description: '' });
      setBackgroundImageFile(null);
      setShowAddBackgroundModal(false);
    } catch (error) {
      console.error("Eroare la adăugarea background-ului:", error);
    }
  };
  
  

  // Deschide modalul pentru editarea unui serviciu
  const handleOpenEditServiceModal = (service) => {
    setEditService({
      id: service.id,
      title: service.title,
      description: service.description,
      imageUrl: service.imageBase64 // folosim imageBase64 ca imagine existentă
    });
    setShowEditServiceModal(true);
  };

  // Editare serviciu
  const handleEditService = async (e) => {
    e.preventDefault();
    let imageBase64 = editService.imageUrl;
    try {
      if (serviceImageFile) {
        imageBase64 = await convertFileToBase64(serviceImageFile);
      }
      const serviceRef = ref(realtimeDB, `services/${editService.id}`);
      await update(serviceRef, {
        title: editService.title,
        description: editService.description,
        imageBase64,
      });
      setShowEditServiceModal(false);
    } catch (error) {
      console.error("Eroare la editarea serviciului:", error);
    }
  };

  const handleEditBackground = async (e) => {
    e.preventDefault();
    let imageBase64 = editBackground.imageBase64;
    try {
      if (backgroundImageFile) {
        imageBase64 = await convertFileToBase64(backgroundImageFile);
      }
      const backgroundRef = ref(realtimeDB, `background/${editBackground.id}`);
      await update(backgroundRef, {
        title: editBackground.title,
        description: editBackground.description,
        imageBase64,
      });
      setShowEditBackgroundModal(false);
    } catch (error) {
      console.error("Eroare la editarea background-ului:", error);
    }
  };
  

  // Ștergere serviciu
  const handleDeleteService = async (id) => {
    try {
      const serviceRef = ref(realtimeDB, `services/${id}`);
      await remove(serviceRef);
    } catch (error) {
      console.error("Eroare la ștergerea serviciului:", error);
    }
  };

  const handleDeleteBackground = async (id) => {
    try {
      const backgroundRef = ref(realtimeDB, `background/${id}`);
      await remove(backgroundRef);
    } catch (error) {
      console.error("Eroare la ștergerea background-ului:", error);
    }
  };
  

  // ================== Funcții pentru gestionarea galeriei ==================

  // Preluare galerie
  const fetchGallery = async () => {
    setGalleryLoading(true);
    const galleryRef = ref(realtimeDB, 'gallery');
    onValue(galleryRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const galleryArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setGallery(galleryArray);
      } else {
        setGallery([]);
      }
      setGalleryLoading(false);
    });
  };

  // Adăugare imagine în galerie
  const handleAddGallery = async (e) => {
    e.preventDefault();
    try {
      if (!galleryImageFile) {
        alert("Please select an image file.");
        return;
      }
      console.log("Converting file to Base64...");
      const imageBase64 = await convertFileToBase64(galleryImageFile);
      console.log("Image converted:", imageBase64);
  
      const galleryRef = ref(realtimeDB, 'gallery');
      const newGalleryRef = push(galleryRef);
      await set(newGalleryRef, {
        title: newGallery.title,
        imageBase64: imageBase64,
      });
      console.log("Gallery item added successfully!");
      setNewGallery({ title: '' });
      setGalleryImageFile(null);
      setShowAddGalleryModal(false);
    } catch (error) {
      console.error("Error adding gallery image:", error);
    }
  };

  // Ștergere element galerie
  const handleDeleteGallery = async (id) => {
    try {
      const galleryRef = ref(realtimeDB, `gallery/${id}`);
      await remove(galleryRef);
    } catch (error) {
      console.error("Eroare la ștergerea galeriei:", error);
    }
  };

  // Deschide modalul pentru editarea unui element din galerie
  const handleOpenEditGalleryModal = (item) => {
    setEditGallery({
      id: item.id,
      title: item.title,
      imageBase64: item.imageBase64,
    });
    setShowEditGalleryModal(true);
  };

  // Editare element galerie
  const handleEditGallery = async (e) => {
    e.preventDefault();
    let imageBase64 = editGallery.imageBase64;
    try {
      if (galleryImageFile) {
        imageBase64 = await convertFileToBase64(galleryImageFile);
      }
      const galleryRef = ref(realtimeDB, `gallery/${editGallery.id}`);
      await update(galleryRef, {
        title: editGallery.title,
        imageBase64,
      });
      setShowEditGalleryModal(false);
    } catch (error) {
      console.error("Eroare la editarea galeriei:", error);
    }
  };

  // ================== useEffect pentru preluarea datelor ==================
  useEffect(() => {
    if (user) {
      fetchRooms();
      fetchBookings();
      fetchSiteSettings();
      fetchServices();
      fetchGallery();
      fetchBackground();
    }
  }, [user]);

  // ================== Funcții de Render pentru diferite secțiuni ==================

  // ---- Render pentru setările site-ului (Datele noastre)
  const renderSiteSettings = () => {
    return (
      <div className="admin-content site-settings">
        <h2>Datele noastre</h2>
        {settingsLoading ? (
          <p>Se încarcă setările...</p>
        ) : (
          <form onSubmit={handleSiteSettingsSubmit}>
            <div className="form-group">
              <label>Numele firmei:</label>
              <input
                type="text"
                value={siteSettings.companyName}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, companyName: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Telefon:</label>
              <input
                type="text"
                value={siteSettings.phone}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, phone: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={siteSettings.email}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, email: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>About Us:</label>
              <textarea
                value={siteSettings.about}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, about: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Adresa:</label>
              <input
                type="text"
                value={siteSettings.address}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, address: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Map Source:</label>
              <input
                type="text"
                value={siteSettings.mapSrc}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, mapSrc: e.target.value })
                }
                required
              />
            </div>
            <button type="submit">Salvează</button>
          </form>
        )}
      </div>
    );
  };
  
  

  // ---- Render pentru serviciile noastre
  const renderServices = () => {
    return (
      <div className="admin-content">
        <h2>Serviciile noastre</h2>
        <button className="add-button" onClick={() => setShowAddServiceModal(true)}>
          Adăugare serviciu
        </button>
        {servicesLoading ? (
          <p>Se încarcă serviciile...</p>
        ) : (
          <table className="services-table">
            <thead>
              <tr>
                <th>Imagine</th>
                <th>Titlu</th>
                <th>Descriere</th>
                <th>Opțiuni</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service.id}>
                  <td>
                    {service.imageBase64 ? (
                      <img src={service.imageBase64} alt={service.title} style={{ width: '100px' }} />
                    ) : (
                      'Fără imagine'
                    )}
                  </td>
                  <td>{service.title}</td>
                  <td>{service.description}</td>
                  <td>
                    <button className="action-button" onClick={() => handleOpenEditServiceModal(service)}>Edit</button>
                    <button className="action-button" onClick={() => handleDeleteService(service.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // ---- Render pentru galeria de imagini
  const renderGallery = () => {
    return (
      <div className="admin-content">
        <h2>Galerie</h2>
        <button className="add-button" onClick={() => setShowAddGalleryModal(true)}>
          Adăugare imagine
        </button>
        {galleryLoading ? (
          <p>Se încarcă galeria...</p>
        ) : gallery.length === 0 ? (
          <p>Galeria este goală.</p>
        ) : (
          <table className="gallery-table">
            <thead>
              <tr>
                <th>Imagine</th>
                <th>Titlu</th>
                <th>Opțiuni</th>
              </tr>
            </thead>
            <tbody>
              {gallery.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.imageBase64 ? (
                      <img src={item.imageBase64} alt={item.title} style={{ width: '100px' }} />
                    ) : (
                      'Fără imagine'
                    )}
                  </td>
                  <td>{item.title}</td>
                  <td>
                    <button className="action-button" onClick={() => handleOpenEditGalleryModal(item)}>Edit</button>
                    <button className="action-button" onClick={() => handleDeleteGallery(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // ---- Render pentru conținutul principal pe baza selecției din sidebar
  const renderContent = () => {
    if (selectedMenuItem === 'camere') {
      return (
        <div className="admin-content">
          <h2>Camere existente</h2>
          <button className="add-button" onClick={() => setShowAddModal(true)}>
            Adăugare cameră
          </button>
          {loading ? <p>Se încarcă camerele...</p> : (
            <table className="rooms-table">
              <thead>
                <tr>
                  <th>Număr</th>
                  <th>Capacitate</th>
                  <th>Preț</th>
                  <th>Opțiuni</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr key={room.id}>
                    <td>{room.number}</td>
                    <td>{room.capacity}</td>
                    <td>{room.price}</td>
                    <td>
                      <button className="action-button" onClick={() => handleOpenEditModal(room)}>Edit</button>
                      <button className="action-button" onClick={() => handleDeleteRoom(room.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      );
    } else if (selectedMenuItem === 'rezervari') {
      return (
        <div className="admin-content">
          <h2>Lista Rezervări</h2>
          {bookingsLoading ? (
            <p>Se încarcă rezervările...</p>
          ) : bookings.length === 0 ? (
            <p>Nu există rezervări.</p>
          ) : (
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Nume</th>
                  <th>Email</th>
                  <th>Telefon</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Persoane</th>
                  <th>Mesaj</th>
                  <th>Camera</th>
                  <th>Opțiuni</th>
                  <th>ID Camere</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.name}</td>
                    <td>{booking.email}</td>
                    <td>{booking.phone}</td>
                    <td>{booking.checkIn}</td>
                    <td>{booking.checkOut}</td>
                    <td>{booking.guests}</td>
                    <td>{booking.message}</td>
                    <td>
                      {booking.selectedRooms 
                        ? booking.selectedRooms
                            .map(id => {
                              const room = rooms.find(r => r.id === id);
                              return room ? room.number : id;
                            })
                            .join(", ")
                        : ""}
                    </td>
                    <td>
                      <button className="action-button" onClick={() => handleOpenEditBookingModal(booking)}>Edit</button>
                      <button className="action-button" onClick={() => handleDeleteBooking(booking.id)}>Delete</button>
                    </td>
                    <td>{booking.selectedRooms ? booking.selectedRooms.join(", ") : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      );
    } else if (selectedMenuItem === 'background') {
      return (
        <div className="admin-content">
          <h2>Background</h2>
          {backgroundLoading ? (
            <p>Se încarcă background-ul...</p>
          ) : background.length === 0 ? (
            <>
              <button className="add-button" onClick={() => setShowAddBackgroundModal(true)}>
                Adăugare Background
              </button>
              <p>Nu există background adăugat.</p>
            </>
          ) : (
            <>
              <p>Există deja un background. Pentru a modifica, puteți edita sau șterge background-ul curent.</p>
              <table className="background-table">
                <thead>
                  <tr>
                    <th>Imagine</th>
                    <th>Titlu</th>
                    <th>Descriere</th>
                    <th>Opțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {background.map(item => (
                    <tr key={item.id}>
                      <td>
                        {item.imageBase64 ? (
                          <img src={item.imageBase64} alt={item.title} style={{ width: '100px' }} />
                        ) : (
                          'Fără imagine'
                        )}
                      </td>
                      <td>{item.title}</td>
                      <td>{item.description}</td>
                      <td>
                        <button className="action-button" onClick={() => {
                          setEditBackground(item);
                          setShowEditBackgroundModal(true);
                        }}>
                          Edit
                        </button>
                        <button className="action-button" onClick={() => handleDeleteBackground(item.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      );
    }
    
     else if (selectedMenuItem === 'servicii') {
      // Dacă folosești alt nume (de ex. 'altele') pentru servicii, ajustează aici:
      return renderServices();
    } else if (selectedMenuItem === 'galerie') {
      return renderGallery();
    } else if (selectedMenuItem === 'datele') {
      return renderSiteSettings();
    } else {
      return <div className="admin-content"><h2>Selectează o opțiune din meniu.</h2></div>;
    }
  };

  // ================== Funcții de Render pentru Modale ==================

  // ---- Modal pentru adăugarea unui serviciu
  const renderAddServiceModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Adăugare serviciu</h2>
        <form onSubmit={handleAddService}>
          <div className="form-group">
            <label>Titlu</label>
            <input
              type="text"
              value={newService.title}
              onChange={(e) => setNewService({ ...newService, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Descriere</label>
            <textarea
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Imagine</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  console.log("File selected:", e.target.files[0]); // Debug log
                  setGalleryImageFile(e.target.files[0]);
                }
              }}
            />
          </div>
          <button className="action-button" type="submit">Salvează</button>
          <button type="button" onClick={() => setShowAddServiceModal(false)}>
            Anulează
          </button>
        </form>
      </div>
    </div>
  );

  const renderAddBackgroundModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Adăugare Background</h2>
        <form onSubmit={handleAddBackground}>
          <div className="form-group">
            <label>Titlu</label>
            <input
              type="text"
              value={newBackground.title}
              onChange={(e) => setNewBackground({ ...newBackground, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Descriere</label>
            <textarea
              value={newBackground.description}
              onChange={(e) => setNewBackground({ ...newBackground, description: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Imagine</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setBackgroundImageFile(e.target.files[0]);
                }
              }}
            />
          </div>
          <button type="submit" className="action-button">Salvează</button>
          <button type="button" onClick={() => setShowAddBackgroundModal(false)}>Anulează</button>
        </form>
      </div>
    </div>
  );
  

  // ---- Modal pentru editarea unui serviciu
  const renderEditServiceModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Editare serviciu</h2>
        <form onSubmit={handleEditService}>
          <div className="form-group">
            <label>Titlu</label>
            <input
              type="text"
              value={editService.title}
              onChange={(e) => setEditService({ ...editService, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Descriere</label>
            <textarea
              value={editService.description}
              onChange={(e) => setEditService({ ...editService, description: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Imagine (lasă necompletat pentru a păstra actuala)</label>
            <input
              type="file"
              onChange={(e) => setServiceImageFile(e.target.files[0])}
            />
          </div>
          <button className="action-button" type="submit">Salvează</button>
          <button type="button" onClick={() => setShowEditServiceModal(false)}>
            Anulează
          </button>
        </form>
      </div>
    </div>
  );

  const renderEditBackgroundModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Editare Background</h2>
        <form onSubmit={handleEditBackground}>
          <div className="form-group">
            <label>Titlu</label>
            <input
              type="text"
              value={editBackground.title}
              onChange={(e) => setEditBackground({ ...editBackground, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Descriere</label>
            <textarea
              value={editBackground.description}
              onChange={(e) => setEditBackground({ ...editBackground, description: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Imagine (lasă necompletat pentru a păstra actuala)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if(e.target.files && e.target.files[0]){
                  setBackgroundImageFile(e.target.files[0]);
                }
              }}
            />
          </div>
          <button type="submit" className="action-button">Salvează</button>
          <button type="button" onClick={() => setShowEditBackgroundModal(false)}>Anulează</button>
        </form>
      </div>
    </div>
  );
  

  // ---- Modal pentru editarea unei rezervări
  const renderEditBookingModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Editare Rezervare</h2>
        <form onSubmit={handleEditBooking}>
          <div className="form-group">
            <label>Nume:</label>
            <input
              type="text"
              value={editBooking.name}
              onChange={(e) => setEditBooking({ ...editBooking, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={editBooking.email}
              onChange={(e) => setEditBooking({ ...editBooking, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Telefon:</label>
            <input
              type="text"
              value={editBooking.phone}
              onChange={(e) => setEditBooking({ ...editBooking, phone: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Check In:</label>
            <input
              type="date"
              value={editBooking.checkIn}
              onChange={(e) => setEditBooking({ ...editBooking, checkIn: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Check Out:</label>
            <input
              type="date"
              value={editBooking.checkOut}
              onChange={(e) => setEditBooking({ ...editBooking, checkOut: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Număr de persoane:</label>
            <input
              type="number"
              value={editBooking.guests}
              onChange={(e) => setEditBooking({ ...editBooking, guests: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Mesaj:</label>
            <textarea
              value={editBooking.message}
              onChange={(e) => setEditBooking({ ...editBooking, message: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Camere selectate:</label>
            <input
              type="text"
              value={editBooking.selectedRooms ? editBooking.selectedRooms.join(", ") : ""}
              onChange={(e) =>
                setEditBooking({
                  ...editBooking,
                  selectedRooms: e.target.value.split(',').map(s => s.trim()),
                })
              }
              placeholder="ID-uri separate prin virgulă"
            />
          </div>
          <button className="action-button" type="submit">Salvează</button>
          <button type="button" onClick={() => setShowEditBookingModal(false)}>
            Anulează
          </button>
        </form>
      </div>
    </div>
  );

  // ---- Modal pentru adăugarea unei camere
  const renderAddRoomModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Adăugare cameră</h2>
        <form onSubmit={handleAddRoom}>
          <div className="form-group">
            <label>Număr cameră</label>
            <input
              type="text"
              value={newRoom.number}
              onChange={(e) => setNewRoom({ ...newRoom, number: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Capacitate</label>
            <input
              type="number"
              value={newRoom.capacity}
              onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Preț</label>
            <input
              type="number"
              step="0.01"
              value={newRoom.price}
              onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
              required
            />
          </div>
          <button className="action-button" type="submit">Salvează</button>
          <button type="button" onClick={() => setShowAddModal(false)}>
            Anulează
          </button>
        </form>
      </div>
    </div>
  );

  // ---- Modal pentru editarea unei camere
  const renderEditRoomModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Editare cameră</h2>
        <form onSubmit={handleEditRoom}>
          <div className="form-group">
            <label>Număr cameră</label>
            <input
              type="text"
              value={editRoom.number}
              onChange={(e) => setEditRoom({ ...editRoom, number: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Capacitate</label>
            <input
              type="number"
              value={editRoom.capacity}
              onChange={(e) => setEditRoom({ ...editRoom, capacity: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Preț</label>
            <input
              type="number"
              step="0.01"
              value={editRoom.price}
              onChange={(e) => setEditRoom({ ...editRoom, price: e.target.value })}
              required
            />
          </div>
          <button className="action-button" type="submit">Salvează</button>
          <button type="button" onClick={() => setShowEditModal(false)}>
            Anulează
          </button>
        </form>
      </div>
    </div>
  );

  // ---- Modal pentru adăugarea unui element în galerie
  const renderAddGalleryModal = () => (
    <div className="modal-overlay" onClick={() => setShowAddGalleryModal(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Adăugare imagine în galerie</h2>
        <form onSubmit={handleAddGallery}>
          <div className="form-group">
            <label>Titlu</label>
            <input
              type="text"
              value={newGallery.title}
              onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Imagine</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setGalleryImageFile(e.target.files[0]);
                }
              }}
            />
          </div>
          <button className="action-button" type="submit">Salvează</button>
          <button type="button" onClick={() => setShowAddGalleryModal(false)}>
            Anulează
          </button>
        </form>
      </div>
    </div>
  );

  // ---- Modal pentru editarea unui element din galerie
  const renderEditGalleryModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Editare imagine în galerie</h2>
        <form onSubmit={handleEditGallery}>
          <div className="form-group">
            <label>Titlu</label>
            <input
              type="text"
              value={editGallery.title}
              onChange={(e) => setEditGallery({ ...editGallery, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Imagine (lasă necompletat pentru a păstra actuala)</label>
            <input
              type="file"
              onChange={(e) => setGalleryImageFile(e.target.files[0])}
            />
          </div>
          <button className="action-button" type="submit">Salvează</button>
          <button type="button" onClick={() => setShowEditGalleryModal(false)}>
            Anulează
          </button>
        </form>
      </div>
    </div>
  );

  // ================== Render final ==================
  // Dacă utilizatorul nu este autentificat, afișăm formularul de login
//   if (user === null) {
//     return <p>Se verifică autentificarea...</p>; // fallback până se inițializează auth
    
//   }
  if (!user) {
    return (
      <div className="admin-login login-container">
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Parolă:</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  // Layout-ul principal pentru administrator
  return (
    <div className="admin-panel">
      {/* Bara de sus */}
      <div className="top-bar">
        <h1>Panou de comanda</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="admin-container">
        {/* Sidebar */}
        <div className="sidebar">
          <ul>
            <li
              className={selectedMenuItem === 'camere' ? 'active' : ''}
              onClick={() => setSelectedMenuItem('camere')}
            >
              Camere existente
            </li>
            <li
              className={selectedMenuItem === 'rezervari' ? 'active' : ''}
              onClick={() => setSelectedMenuItem('rezervari')}
            >
              Lista Rezervări
            </li>
          </ul>
        </div>

        {/* Conținutul din dreapta */}
        <div className="content-area">
          {renderContent()}
          {showEditBookingModal && renderEditBookingModal()}
          {showAddServiceModal && renderAddServiceModal()}
          {showEditServiceModal && renderEditServiceModal()}
          {showAddModal && renderAddRoomModal()}
          {showEditModal && renderEditRoomModal()}
          {showAddGalleryModal && renderAddGalleryModal()}
          {showEditGalleryModal && renderEditGalleryModal()}
          {showAddBackgroundModal && renderAddBackgroundModal()}
          {showEditBackgroundModal && renderEditBackgroundModal()}

        </div>
      </div>
    </div>
  );
};

export default AdminPanelClient;
