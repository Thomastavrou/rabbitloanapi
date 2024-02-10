const express = require('express');
const multer = require('multer');

module.exports = ({ bucket }) => {
  const router = express.Router();

  // Configure multer for handling file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
  });

  // Helper function to get content type based on file extension
  const getContentTypeFromFilename = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();

    switch (ext) {
      case 'jpeg':
      case 'jpg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'pdf':
        return 'application/pdf';
      default:
        return null; // Unknown content type
    }
  };

  // Endpoint to get an image
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

      // Determine Content-Type based on file extension or type
      const contentType = getContentTypeFromFilename(filename);
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }

      // Headers for debugging
      res.setHeader('Debug-Endpoint', 'get-image');
      res.setHeader('Debug-Folder', folder);
      res.setHeader('Debug-Filename', filename);

      // Pipe the file stream to the response object
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error fetching image:', error.message);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  // Endpoint to upload an image
  router.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
      // Extracting userId and name from the request body
      const { userId, name } = req.body;

      // Input validation
      if (!userId || !req.file || !name) {
        return res.status(400).json({ error: 'User ID, image data, and name are required' });
      }

      // Get the image buffer from the uploaded file
      const imageBuffer = req.file.buffer;

      // Specify the user folder using the userId
      const userFolder = `${userId}`;

      // Upload the image to Firebase Storage within the user folder with the specified name
      const file = bucket.file(`${userFolder}/${name}`);
      await file.save(imageBuffer, { contentType: getContentTypeFromFilename(name) });

      // Headers for debugging
      res.setHeader('Debug-Endpoint', 'upload-image');
      res.setHeader('Debug-UserId', userId);
      res.setHeader('Debug-Name', name);

      res.json({ message: 'Image uploaded successfully', imageUrl: `gs://${process.env.FIREBASE_STORAGE_BUCKET}/${userFolder}/${name}` });
    } catch (error) {
      console.error('Error during image upload:', error.message);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  return router;
};
