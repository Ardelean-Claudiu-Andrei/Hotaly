// functions/index.js
const functions   = require('firebase-functions');
const admin       = require('firebase-admin');
const nodemailer  = require('nodemailer');

admin.initializeApp();

// În Firebase CLI: 
// firebase functions:config:set smtp.user="contul.tau@gmail.com" smtp.pass="app_password" admin.email="aclaudiuandrei586@gmail.com"
const { user: SMTP_USER, pass: SMTP_PASS } = functions.config().smtp;
const ADMIN_EMAIL = functions.config().admin.email;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: SMTP_USER, pass: SMTP_PASS }
});

exports.sendBookingEmail = functions.database
  .ref('/bookings/{bookingId}')
  .onCreate(async (snap, ctx) => {
    const b = snap.val();
    const rooms = (b.selectedRooms||[]).join(', ');
    const html = `
      <h3>Rezervare nouă de la ${b.name}</h3>
      <ul>
        <li>Email: ${b.email}</li>
        <li>Telefon: ${b.phone}</li>
        <li>Check-in: ${b.checkIn}</li>
        <li>Check-out: ${b.checkOut}</li>
        <li>Persoane: ${b.guests}</li>
        <li>Camere: ${rooms}</li>
        <li>Mesaj: ${b.message||'–'}</li>
      </ul>
    `;
    try {
      await transporter.sendMail({
        from: `"Casa Ciordaș" <${SMTP_USER}>`,
        to: ADMIN_EMAIL,
        subject: `Rezervare de la ${b.name}`,
        html
      });
      console.log('Mail trimis către admin.');
    } catch(err) {
      console.error('Eroare trimitere mail:', err);
    }
  });
