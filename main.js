const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const openaiRoutes = require('./openaiRoutes');
const userRoutes = require('./userRoutes');
const config = require('./config');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

try {
  admin.initializeApp({
    credential: admin.credential.cert(require(config.firebaseServiceAccountPath)),
  });
} catch (error) {
  console.error('Error initializing Firebase:', error.message);
  process.exit(1);
}

app.use('/openai', openaiRoutes);
app.use('/user', userRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
