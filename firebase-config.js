// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getDatabase, ref, set, get, query, orderByChild, update } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6I2EUG1Blyl0F0YD-Mrbtv5JwcJG8JSk",
  authDomain: "halloween-project-1f2a0.firebaseapp.com",
  databaseURL: "https://halloween-project-1f2a0-default-rtdb.firebaseio.com",
  projectId: "halloween-project-1f2a0",
  storageBucket: "halloween-project-1f2a0.firebasestorage.app",
  messagingSenderId: "830390917925",
  appId: "1:830390917925:web:66ee632e4bcc67bd1898cc",
  measurementId: "G-MRGCJF1MPV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Firebase helper functions
export async function registerUser(userData) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const uuid = crypto.randomUUID();
  const record = {
    ...userData,
    id,
    uuid,
    createdAt: new Date().toISOString()
  };

  try {
    const qrData = `${window.location.origin}/user/${encodeURIComponent(uuid)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=650x650&data=${encodeURIComponent(qrData)}`;
    
    // Add QR code URL to the record
    const recordWithQr = {
      ...record,
      qrUrl,
      qrData
    };

    await set(ref(database, `registrations/${uuid}`), recordWithQr);
    return { ok: true, id, uuid, qrUrl };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

export async function getUserByUuid(uuid) {
  try {
    const snapshot = await get(ref(database, `registrations/${uuid}`));
    if (snapshot.exists()) {
      return { ok: true, record: snapshot.val() };
    } else {
      return { ok: false, error: 'Record not found' };
    }
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

export async function getRegistrations() {
  try {
    const registrationsRef = ref(database, 'registrations');
    const registrationsQuery = query(registrationsRef, orderByChild('createdAt'));
    const snapshot = await get(registrationsQuery);
    
    if (snapshot.exists()) {
      const rows = [];
      snapshot.forEach((childSnapshot) => {
        rows.push(childSnapshot.val());
      });
      return { ok: true, rows: rows.reverse() };
    } else {
      return { ok: true, rows: [] };
    }
  } catch (error) {
    console.error('Error getting registrations:', error);
    throw error;
  }
}

// Function to update registration data
export async function updateRegistration(uuid, data) {
  try {
    await update(ref(database, `registrations/${uuid}`), data);
    return { ok: true };
  } catch (error) {
    console.error('Error updating registration:', error);
    throw error;
  }
}