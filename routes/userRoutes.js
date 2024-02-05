  const express = require('express');
  const router = express.Router();

  module.exports = ({ db, auth, bucket }) => {
  // Create a lending product
  router.post('/create-product', async (req, res) => {
    try {
      const { title, description, details, duration, amount, interest } = req.body;

      // Implement validation logic if needed
      // ...

      const lendingProductsCollection = db.collection('LendingProducts');
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

  // Get all lending products
  router.get('/lending-products', async (req, res) => {
    try {
      const lendingProductsCollection = db.collection('LendingProducts');
      const snapshot = await lendingProductsCollection.get();

      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json({ message: 'Lending products retrieved successfully', products });
    } catch (error) {
      console.error('Error during lending product retrieval:', error.message);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });

  // Add other lending routes here

  return router;
};
