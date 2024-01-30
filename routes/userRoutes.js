const express = require('express');

module.exports = ({ db, auth, bucket, config }) => {
  const router = express.Router();

  router.post('/register', async (req, res) => {
    try {
      const { name, surname, email, phone, password, selfieBase64 } = req.body;


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
        profileImageUrl: `gs://${config.firebaseStorageBucket}/${fileName}`,
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

  return router;
};
