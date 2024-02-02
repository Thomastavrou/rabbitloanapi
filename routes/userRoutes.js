const express = require('express');

module.exports = ({ db, auth, bucket }) => {
  const router = express.Router();

  router.post('/register', async (req, res) => {
    try {
      const { name, surname, email, phone, password, selfieBase64 } = req.body;
      // Input validation (you can expand this based on your requirements)
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      // Decode base64 image to buffer
      const selfieBuffer = Buffer.from(selfieBase64, 'base64');

      // Generate a unique filename for the image
      const fileName = `${Date.now()}_${Math.floor(Math.random() * 100000)}.jpeg`;

      // Upload the image to Firebase Storage without creating a specific folder
      const file = bucket.file(fileName);
      await file.save(selfieBuffer, { contentType: 'image/jpeg' });

      // Create a new user in Firebase Authentication
      const userCredential = await auth.createUser({
        email,
        password, // Use the provided password
        displayName: `${name} ${surname}`,
      });

      // Create a corresponding user document in Firestore with additional information
      const newUser = {
        uid: userCredential.uid,
        name: name || '',
        surname: surname || '',
        email: email || '',
        phone: phone || '', // Change the key to match your JSON data
        profileImageUrl: `gs://${process.env.FIREBASE_STORAGE_BUCKET}/${fileName}`,
      };

      // Create a new document in the 'users' collection with user details
      await db.collection('users').doc(userCredential.uid).set(newUser);

      res.json({ message: 'Registration successful', user: newUser });
    } catch (error) {
      console.error('Error during registration:', error.message);

      // Provide more detailed error information in the response
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  return router;
};
