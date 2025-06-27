import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';

function AdminRedirect() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userEmail = userCredential.user.email;

      if (userEmail === 'aclaudiuandrei586@gmail.com') {
        navigate('/admindev');
      } else if (userEmail === 'adresaclient@gmail.com') {
        navigate('/adminpage');
      } else {
        alert('Acces interzis.');
        await signOut(auth);
      }
    } catch (error) {
      console.error('Eroare la autentificare:', error);
      alert('Email sau parolă greșită!');
    }
  };

  return (
    <div className="admin-login login-container">
      <h2>Autentificare Administrator</h2>
      <form onSubmit={handleLogin}>
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
          <label>Parolă:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Autentificare</button>
      </form>
    </div>
  );
}

export default AdminRedirect;
