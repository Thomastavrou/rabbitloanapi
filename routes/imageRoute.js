const express = require('express');
const multer = require('multer');
// const multer = require('multer');
const upload = multer();
module.exports = ({ bucket }) => {
  const router = express.Router();

  // Multer configuration
  const upload = multer();

  // Endpoint to get an image
  router.get('/get-image/:folder/:filename', async (req, res) => {
    try {
      const { folder, filename } = req.params;

      if (!folder || !filename) {
        return res.status(400).json({ error: 'Folder and filename are required' });
      }

      const file = bucket.file(`${folder}/${filename}`);
      const [exists] = await file.exists();

      if (!exists) {
        return res.status(404).json({ error: 'Image not found' });
      }

      const fileStream = file.createReadStream();

      // Headers for debugging
      res.setHeader('Debug-Endpoint', 'get-image');
      res.setHeader('Debug-Folder', folder);
      res.setHeader('Debug-Filename', filename);

      // Log headers
      console.log('Headers:', req.headers);

      fileStream.pipe(res);
    } catch (error) {
      console.error('Error fetching image:', error.message);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  // Endpoint to upload an image using Multer
  router.post('/upload-image', upload.single('image'), async (req, res) => {
    console.log('Entered POST route');
    console.log('Request Body:', req.body);
    console.log('Request File:', req.file);
  
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
  
      const userId = req.body.userId;
      const name = req.body.name;
  
      if (!userId || !name) {
        return res.status(400).json({ error: 'User ID and name are required' });
      }
  
      const userFolder = `${userId}`;
      const fileUpload = bucket.file(`${userFolder}/${name}`);
  
      // Write the buffer to the Firebase Storage bucket
      await fileUpload.save(req.file.buffer, { contentType: req.file.mimetype });
  
      // Headers for debugging
      res.setHeader('Debug-Endpoint', 'upload-image');
      res.setHeader('Debug-UserId', userId);
      res.setHeader('Debug-Name', name);
  
      // Log headers
      console.log('Headers:', req.headers);
  
      res.json({
        message: 'Image uploaded successfully',
        imageUrl: `gs://${process.env.FIREBASE_STORAGE_BUCKET}/${userFolder}/${name}`
      });
    } catch (error) {
      console.error('Error during image upload:', error.message);
      console.error('Error stack trace:', error.stack);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });
  return router;
};
