const express = require('express');
const router = express.Router();

module.exports = ({ db, auth, bucket }) => {
  // Route to handle user registration
  router.post('/register', async (req, res) => {
    try {
      const { name, surname, email, phone, password } = req.body;

      // Input validation
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Create a new user in Firebase Authentication
      const userCredential = await auth.createUser({
        email,
        password, // Use the provided password
        displayName: `${name} ${surname}`,
      });

      // Get the user ID
      const userId = userCredential.uid;

      // Create a corresponding user document in Firestore with additional information
      const newUser = {
        uid: userId,
        name: name || '',
        surname: surname || '',
        email: email || '',
        phone: phone || '',
      };

      // Update the user document with additional information
      await db.collection('users').doc(userId).set(newUser);

      // Create a folder in Firebase Storage with the user's ID
      const userFolder = `${userId}/`;
      await bucket.file(userFolder).save('');

      res.json({ message: 'Registration successful', user: newUser });
    } catch (error) {
      console.error('Error during registration:', error.message);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

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
  

  router.post('/request-verification/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Perform any necessary actions to initiate the verification process
      // For example, update the user status to "pending verification"
      // You can also trigger an email or notification to inform the admin about the verification request
      // Create a document in the RequestedVerification collection
      
      await db.collection('RequestedVerification').doc(userId).set({
        userId,
        status: 'pending',
        timestamp: new Date(),
        // Add any other relevant information you want to store for verification
      });
  
      res.json({ message: 'Verification request sent successfully', status: 'pending' });
    } catch (error) {
      console.error('Error initiating verification:', error.message);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });
  


  

  return router;
};
