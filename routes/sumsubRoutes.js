const express = require('express');
const axios = require('axios');

const sumsubRoutes = () => {
  const router = express.Router();

  router.post('/generateAccessToken', async (req, res) => {
    const { userId, levelName, ttlInSecs } = req.body;

    try {
      const accessToken = process.env.SUMSUB_ACCESS_TOKEN;

      if (!accessToken) {
        throw new Error('Sumsub access token is not configured.');
      }

      console.log('Using Access Token:', accessToken);

      const response = await axios.post(
        'https://api.sumsub.com/resources/accessTokens',
        { userId, levelName, ttlInSecs },
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const { token, userId: generatedUserId } = response.data;
      res.json({ token, userId: generatedUserId });
    } catch (error) {
      console.error('Error generating access token:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Add more Sumsub-related routes here if needed

  return router;
};

module.exports = sumsubRoutes;
