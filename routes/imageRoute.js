const express = require('express');
const multer = require('multer');

module.exports = ({ bucket }) => {
  const router = express.Router();

  // Configure multer for handling file uploads
  const upload = multer();

  router.get('/get-image/:folder/:filename', async (req, res) => {
    try {
      // ... (unchanged code for fetching images)
    } catch (error) {
      console.error('Error fetching image:', error.message);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  router.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
      const { userId, name } = req.body;

      // Input validation
      if (!userId || !req.file || !name) {
        return res.status(400).json({ error: 'User ID, image data, and name are required' });
      }

      const imageBuffer = req.file.buffer;

      // Specify the user folder using the userId
      const userFolder = `${userId}`;

      // Upload the image to Firebase Storage within the user folder with the specified name
      const file = bucket.file(`${userFolder}/${name}`);
      await file.save(imageBuffer, { contentType: 'image/jpeg' });

      res.json({ message: 'Image uploaded successfully', imageUrl: `gs://${process.env.FIREBASE_STORAGE_BUCKET}/${userFolder}/${name}` });
    } catch (error) {
      console.error('Error during image upload:', error.message);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  return router;
};
