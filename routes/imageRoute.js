const express = require('express');

module.exports = ({ bucket }) => {
  const router = express.Router();

  // Route to get an image by filename
  router.get('/get-image/:filename', async (req, res) => {
    try {
      const { filename } = req.params;

      // Check if filename is provided
      if (!filename) {
        return res.status(400).json({ error: 'Filename is required' });
      }

      // Create a reference to the file in Firebase Storage
      const file = bucket.file(filename);

      // Check if the file exists
      const [exists] = await file.exists();
      if (!exists) {
        return res.status(404).json({ error: 'Image not found' });
      }

      // Get a readable stream of the file from Firebase Storage
      const fileStream = file.createReadStream();

      // Set the response headers
      res.setHeader('Content-Type', 'image/png'); // Set the appropriate content type

      // Pipe the file stream to the response object
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error fetching image:', error.message);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  return router;
};
