const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const openaiRoutes = require('./routes/openaiRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const config = require('./config');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Firebase Initialization
try {
  const firebaseConfig = {
    credential: admin.credential.cert(require(config.firebaseServiceAccountPath)),
    storageBucket: config.firebaseStorageBucket,
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
app.use('/user', userRoutes({ db, auth, bucket, config }));

// Other routes
app.use('/openai', openaiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
