const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

module.exports = ({ db, auth, bucket }) => {

  // Middleware to handle errors
  const handleRegistrationError = (res, error) => {
    console.error('Error during user registration:', error.message);

    let statusCode = 500;
    let errorMessage = 'Internal Server Error';

    if (error.code === 'auth/email-already-exists') {
      statusCode = 400;
      errorMessage = 'Email already exists';
    } else if (error.code === 'auth/weak-password') {
      statusCode = 400;
      errorMessage = 'Weak password';
    } else if (error.code === 'auth/phone-number-already-exists') {
      statusCode = 400;
      errorMessage = 'Phone number already exists';
    }

    res.status(statusCode).json({ error: errorMessage, details: error.message });
  };

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
      handleRegistrationError(res, error);
    }
  });

  // Update user information
  router.patch('/update-user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { additionalInfo } = req.body;

      // Retrieve the existing user from the database
      const userSnapshot = await db.collection('users').doc(userId).get();

      if (!userSnapshot.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Merge the additional information into the existing user data
      const updatedUser = {
        ...userSnapshot.data(),
        ...additionalInfo,
      };

      // Save the updated user back to the database
      await db.collection('users').doc(userId).set(updatedUser, { merge: true });

      res.json({ message: 'Additional information added to the user successfully' });
    } catch (error) {
      console.error('Error updating user:', error.message);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  return router;
};
