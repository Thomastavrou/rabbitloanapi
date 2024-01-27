// Import dependencies
require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');
const admin = require('firebase-admin');

// Import configuration settings
const config = require('./config');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({ apiKey: config.openaiApiKey });

// Initialize Firebase Admin SDK without databaseURL
try {
  admin.initializeApp({
    credential: admin.credential.cert(require(config.firebaseServiceAccountPath)),
    // No databaseURL needed for Firestore
  });
} catch (error) {
  console.error('Error initializing Firebase:', error.message);
  process.exit(1); // Exit the process in case of an error
}

// Access Firestore
const db = admin.firestore();
const auth = admin.auth();

// Define API endpoint for sending messages
app.post('/send-message', async (req, res) => {
  try {
    // Extract message from request body
    const { message } = req.body;

    // Call OpenAI API for chat completions
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ "role": "user", "content": message }],
    });

    // Log the response for debugging purposes
    console.log(chatCompletion.choices[0].message);

    // Send the response back to the client
    res.json({ response: chatCompletion.choices[0].message.content });
  } catch (error) {
    // Handle errors and send an internal server error response
    console.error('Error handling request:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define API endpoint for user registration
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Create a new user in Firebase Authentication
    const userCredential = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Create a corresponding user document in Firestore
    const newUser = {
      uid: userCredential.uid,
      name,
      email,
    };

    await db.collection('users').doc(userCredential.uid).set(newUser);

    res.json({ message: 'Registration successful', user: newUser });
  } catch (error) {
    console.error('Error during registration:', error.message);

    // Check for specific errors (e.g., email already in use) and send an appropriate response
    if (error.code === 'auth/email-already-exists') {
      res.status(400).json({ error: 'Email already in use' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
