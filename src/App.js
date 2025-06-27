// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import AdminPanel from './pages/AdminPanel';
import AdminPanelClient from './pages/AdminPanelClient';
import AdminRedirect from './pages/AdminRedirect';
import { ref, onValue } from 'firebase/database';
import { realtimeDB } from './firebase';
import './App.css'; // asigură-te că importi fișierul cu stiluri

function App() {

  const [companyName, setCompanyName] = useState('Casa Ciordaş');

  useEffect(() => {
    const settingsRef = ref(realtimeDB, 'siteSettings');
    onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const settings = snapshot.val();
        if (settings.companyName) {
          setCompanyName(settings.companyName);
          // Actualizează titlul documentului:
          document.title = settings.companyName;
        }
      }
    });
  }, []);

  return (
    <Router>
      <div className="app-container">
      <Helmet>
        <title>{companyName}</title>
        {/* Poți adăuga și alte meta tag-uri aici */}
      </Helmet>
        <Header />
        <main className="main-content container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/adminpage" element={<AdminPanelClient />} />
            <Route path="/admindev" element={<AdminPanel />} />
            <Route path="/admin" element={<AdminRedirect />} />

          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
