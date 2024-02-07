const express = require('express');
const router = express.Router();

module.exports = ({ db, auth, bucket }) => {
  
  // Register a new user
  router.post('/register', async (req, res) => {
    try {
      const { name, surname, email, phone, password } = req.body;

      // Implement registration logic, including validation, user creation, etc.
      // ...

      // Assume you have a 'Users' collection in your database
      const usersCollection = db.collection('Users');
      const userData = {
        name,
        surname,
        email,
        phone,
        password,
        // Add other user-related data if needed
      };

      const newUserRef = await usersCollection.add(userData);

      res.json({ message: 'User registered successfully', userId: newUserRef.id });
    } catch (error) {
      console.error('Error during user registration:', error.message);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  
  return router;
};
