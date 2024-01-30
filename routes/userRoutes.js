// userRoutes.js
const express = require('express');
const admin = require('firebase-admin');
const config = require('./config');

const router = express.Router();
const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket(); // Initialize Firebase Storage bucket

router.post('/register', async (req, res) => {
  try {
    const { name, surname, email, phoneNumber, selfieBase64 } = req.body;

    // Decode base64 image to buffer
    const selfieBuffer = Buffer.from(selfieBase64, 'base64');

    // Generate a unique filename for the image
    const fileName = `${Date.now()}_${Math.floor(Math.random() * 100000)}.png`;

    // Upload the image to Firebase Storage
    const file = bucket.file(fileName);
    await file.save(selfieBuffer, { contentType: 'image/png' });

    // Create a new user in Firebase Authentication
    const userCredential = await auth.createUser({
      email,
      password: 'temporarypassword', // Set a temporary password, you may want to generate a secure password
      displayName: `${name} ${surname}`,
    });

    // Create a corresponding user document in Firestore with additional information
    const newUser = {
      uid: userCredential.uid,
      name,
      surname,
      email,
      phoneNumber,
      profileImageUrl: `gs://${config.firebaseStorageBucket}/${fileName}`, // Save the image URL
    };

    await db.collection('users').doc(userCredential.uid).set(newUser);

    res.json({ message: 'Registration successful', user: newUser });
  } catch (error) {
    console.error('Error during registration:', error.message);

    if (error.code === 'auth/email-already-exists') {
      res.status(400).json({ error: 'Email already in use' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

module.exports = router;
