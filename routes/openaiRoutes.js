// require('dotenv').config();
// const express = require('express');
// const { OpenAI } = require('openai');
// const router = express.Router();

// const openai = new OpenAI({ apiKey: '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' });

// router.post('/send-message', async (req, res) => {
//   try {
//     const { message } = req.body;
//     const chatCompletion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{ "role": "user", "content": message }],
//     });
//     console.log(chatCompletion.choices[0].message);
//     res.json({ response: chatCompletion.choices[0].message.content });
//   } catch (error) {
//     console.error('Error handling request:', error.message);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
// module.exports = router;
