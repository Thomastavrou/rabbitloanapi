const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes.js');
const imageRoutes = require('./routes/imageRoute.js');
const lendingRoutes = require('./routes/lendingRoutes.js');  

// Load environment variables from .env file
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Set the payload size limit
app.use(express.json());

// Firebase Initialization
try {
  const firebaseConfig = {
    credential: admin.credential.cert({
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  };

  admin.initializeApp(firebaseConfig);
} catch (error) {
  console.error('Error initializing Firebase:', error.message);
  process.exit(1);
}

// Initialize Firebase services used in userRoutes.js
const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

// Pass the initialized services and the config object to userRoutes
app.use('/user', userRoutes({ db, auth, bucket }));
app.use('/images', imageRoutes({ bucket }));
app.use('/lending', lendingRoutes({ db, auth }));  // Use the lendingRoutes for the /lending endpoint

// Other routes
// app.use('/openai', openaiRoutes);
// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
