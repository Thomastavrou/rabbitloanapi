const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

module.exports = ({ db, auth, bucket }) => {
  
  // Register a new user
  router.post('/register', async (req, res) => {
    try {
      const { name, surname, email, phone, password } = req.body;

      // Create user in Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: `${name} ${surname}`, // Optionally set display name
      });

      // Store additional user data in Firestore
      const usersCollection = db.collection('users');
      const userData = {
        uid: userRecord.uid, // Add the UID field
        name,
        surname,
        email,
        phone,
        // Add other user-related data if needed
      };

      await usersCollection.doc(userRecord.uid).set(userData);

      res.status(201).json({ message: 'User registered successfully', userId: userRecord.uid });
    } catch (error) {
      console.error('Error during user registration:', error.message);

      // Handle specific error cases with more details
      if (error.code === 'auth/email-already-exists') {
        res.status(400).json({ error: 'Email already exists', details: error.message });
      } else if (error.code === 'auth/weak-password') {
        res.status(400).json({ error: 'Weak password', details: error.message });
      } else if (error.code === 'auth/phone-number-already-exists') {
        res.status(400).json({ error: 'Phone number already exists', details: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
      }
    }
  });

  return router;
};
