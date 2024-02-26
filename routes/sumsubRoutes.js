const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const sumsubRoutes = () => {
  const router = express.Router();

  router.post('/generateAccessToken', async (req, res) => {
    const { userId, levelName, ttlInSecs } = req.body;

    try {
      const accessToken = await generateAccessToken(userId, levelName, ttlInSecs);
      res.json(accessToken);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  const generateAccessToken = async (userId, levelName, ttlInSecs = 600) => {
    try {
      const apiUrl = 'https://api.sumsub.com/resources/accessTokens';
      const accessTokenUrl = `${apiUrl}?userId=${encodeURIComponent(userId)}&levelName=${encodeURIComponent(levelName)}&ttlInSecs=${ttlInSecs}`;

      // Get current timestamp in seconds
      const timestamp = Math.floor(Date.now() / 1000);

      // Generate the string to be signed
      const stringToSign = `${timestamp}POST/resources/accessTokens?userId=${encodeURIComponent(userId)}&levelName=${encodeURIComponent(levelName)}&ttlInSecs=${ttlInSecs}`;

      // Sign the string using HMAC-SHA256 and your secret key
      const secretKey = process.env.SUMSUB_SECRET_KEY; // Replace with your actual Sumsub secret key
      const signature = crypto.createHmac('sha256', secretKey).update(stringToSign).digest('hex');

      // Make the request with the required headers
      const response = await axios.post(accessTokenUrl, null, {
        headers: {
          'Accept': 'application/json',
          'X-App-Token': process.env.SUMSUB_APP_TOKEN, // Replace with your actual Sumsub app token
          'X-App-Access-Sig': signature,
          'X-App-Access-Ts': timestamp,
        },
      });

      const { token, userId: generatedUserId } = response.data;
      return { token, userId: generatedUserId };
    } catch (error) {
      console.error('Error generating access token:', error.message);
      throw new Error('Internal Server Error');
    }
  };

  return router;
};

module.exports = sumsubRoutes;
