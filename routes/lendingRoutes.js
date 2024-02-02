const express = require('express');
const router = express.Router();
// ... (other imports and setup)

module.exports = ({ db, auth }) => {
    const router = express.Router();
  
    // Endpoint to create a lending product
    router.post('/lending-request', async (req, res) => {
      try {
        // Your logic to create a lending product here
  
        res.json({ message: 'Lending product created successfully' });
      } catch (error) {
        console.error('Error during lending product creation:', error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
      }
    });
  
    // Endpoint to get all lending products
    router.get('/lending-products', async (req, res) => {
      try {
        // Retrieve all lending products from the 'LendingProducts' collection
        const lendingProductsCollection = db.collection('LendingProducts');
        const snapshot = await lendingProductsCollection.get();
  
        // Extract data from the snapshot
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
  
        res.json({ message: 'Lending products retrieved successfully', products });
      } catch (error) {
        console.error('Error during lending product retrieval:', error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
      }
    });
  
    // Endpoint to create a lending product (additional route)
    router.post('/create-product', async (req, res) => {
      try {
        const { title, description, details, duration, amount, interest } = req.body;
  
        // Validate request body
        if (!title || !description || !details || !duration || !amount || !interest) {
          return res.status(400).json({ error: 'Bad Request', details: 'Missing required fields' });
        }
  
        // Use the firestore instance passed from main.js
        const lendingProductsCollection = db.collection('LendingProducts');
  
        // Create a new document in the collection with the provided data
        const productData = {
          title,
          description,
          details,
          duration,
          amount,
          interest,
        };
  
        const newProductRef = await lendingProductsCollection.add(productData);
  
        res.json({ message: 'Product created successfully', productId: newProductRef.id });
      } catch (error) {
        console.error('Error during product creation:', error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
      }
    });
  
    return router;
  };
  