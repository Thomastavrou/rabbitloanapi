// main.js

const express = require('express');
const bodyParser = require('body-parser');
const { OpenAIAPI } = require('openai-api');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// OpenAI API setup
const openai = new OpenAIAPI({ apiKey: 'your_openai_api_key' });

// Endpoint to receive messages from Flutter
app.post('/send-message', async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Send user message to ChatGPT and get response
    const chatGptResponse = await openai.complete({
      prompt: userMessage,
      max_tokens: 150,
    });

    // Send the response back to Flutter
    res.json({ response: chatGptResponse.choices[0].text.trim() });
  } catch (error) {
    console.error('Error handling request:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
