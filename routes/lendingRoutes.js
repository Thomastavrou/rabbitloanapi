const express = require('express');
const router = express.Router();
// ... (other imports and setup)

module.exports = ({ db, auth }) => {
    const router = express.Router();
  
    // Endpoint to create a lending product
router.post('/loan-request', async (req, res) => {
  try {
    const { userId, productId, amount } = req.body;

    // Validate request body
    if (!userId || !productId || !amount) {
      return res.status(400).json({ error: 'Bad Request', details: 'Missing required fields' });
    }

    // Ensure the user is authenticated (replace with your actual authentication logic)
    const isAuthenticated = /* Your authentication logic based on the provided userId */ true;

    if (!isAuthenticated) {
      return res.status(401).json({ error: 'Unauthorized', details: 'User not authenticated' });
    }

    // Check if the user already has a loan request
    const existingLoanRequest = await db.collection('LoanRequests')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (!existingLoanRequest.empty) {
      return res.status(400).json({ error: 'Bad Request', details: 'User already has a loan request' });
    }

    // Get the current date and time
    const currentDate = new Date();

    // Your logic to handle the loan request goes here
    // Store the loan request in a 'LoanRequests' collection
    const loanRequestsCollection = db.collection('LoanRequests');

    // Add the "status" field and set it to "pending"
    const loanRequestData = {
      userId,
      productId,
      amount,
      date: currentDate,
      status: 'pending',  // Add this line to set the status to "pending"
      // Additional fields if needed
    };

    const newLoanRequestRef = await loanRequestsCollection.add(loanRequestData);

    res.json({ message: 'Loan request processed successfully', loanRequestId: newLoanRequestRef.id });
  } catch (error) {
    console.error('Error during loan request processing:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Endpoint to process loan request status
router.put('/loan-status/:loanRequestId', async (req, res) => {
  try {
    const { loanRequestId } = req.params;
    const { status, reason } = req.body;

    // Validate request body
    if (!loanRequestId || !status) {
      return res.status(400).json({ error: 'Bad Request', details: 'Missing required fields' });
    }

    // Your authentication or authorization logic goes here if needed

    // Get the 'LoanRequests' collection
    const loanRequestsCollection = db.collection('LoanRequests');

    // Retrieve the specific loan request
    const loanRequestDoc = await loanRequestsCollection.doc(loanRequestId).get();

    if (!loanRequestDoc.exists) {
      return res.status(404).json({ error: 'Not Found', details: 'Loan request not found' });
    }

    // Update the status based on the provided decision
    const updatedStatus = status.toLowerCase(); // Ensure lowercase for consistency

    if (updatedStatus === 'accepted' || updatedStatus === 'rejected') {
      // Update the status field
      const updateData = { status: updatedStatus };

      // Include the reason field only if it's present in the request body
      if (reason !== undefined) {
        updateData.reason = reason;
      }

      await loanRequestsCollection.doc(loanRequestId).update(updateData);

      // Respond with the updated status
      res.json({ loanRequestId, status: updatedStatus, reason });
    } else {
      // Invalid status provided
      res.status(400).json({ error: 'Bad Request', details: 'Invalid status provided' });
    }
  } catch (error) {
    console.error('Error during loan request status update:', error.message);
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
  