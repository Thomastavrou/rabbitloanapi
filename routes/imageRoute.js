const express = require('express');

module.exports = ({ bucket }) => {
  const router = express.Router();

  router.get('/get-image/:folder/:filename', async (req, res) => {
    try {
      const { folder, filename } = req.params;
  
      // Check if folder and filename are provided
      if (!folder || !filename) {
        return res.status(400).json({ error: 'Folder and filename are required' });
      }
  
      // Create a reference to the file in Firebase Storage
      const file = bucket.file(`${folder}/${filename}`);
  
      // Check if the file exists
      const [exists] = await file.exists();
      if (!exists) {
        return res.status(404).json({ error: 'Image not found' });
      }
  
      // Get a readable stream of the file from Firebase Storage
      const fileStream = file.createReadStream();
  
      // Set the response headers
      res.setHeader('Content-Type', 'image/jpeg'); // Set the appropriate content type
  
      // Pipe the file stream to the response object
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error fetching image:', error.message);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });
  
  
   
  router.post('/upload-image', async (req, res) => {
    try {
      const { userId, imageBase64, name } = req.body;
  
      // Input validation
      if (!userId || !imageBase64 || !name) {
        return res.status(400).json({ error: 'User ID, image data, and name are required' });
      }
  
      // Decode base64 image to buffer
        const imageBuffer = Buffer.from(imageBase64, 'base64');
  
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
