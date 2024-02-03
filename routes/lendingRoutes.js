const express = require('express');
const router = express.Router();

// Middleware for validating user authentication
const authenticateUser = (req, res, next) => {
  const isAuthenticated = /* Your authentication logic based on the provided userId */ true;

  if (!isAuthenticated) {
    return res.status(401).json({ error: 'Unauthorized', details: 'User not authenticated' });
  }

  next();
};

// Middleware for checking existing loan request
const checkExistingLoanRequest = async (req, res, next) => {
  const { userId } = req.body;
  const existingLoanRequest = await db.collection('LoanRequests')
    .where('userId', '==', userId)
    .limit(1)
    .get();

  if (!existingLoanRequest.empty) {
    return res.status(400).json({ error: 'Bad Request', details: 'User already has a loan request' });
  }

  next();
};

// Endpoint to create a loan request
router.post('/loan-request', authenticateUser, checkExistingLoanRequest, async (req, res) => {
  try {
    const { userId, productId, amount } = req.body;
    const currentDate = new Date();

    const loanRequestsCollection = db.collection('LoanRequests');
    const loanRequestData = {
      userId,
      productId,
      amount,
      date: currentDate,
      status: 'pending',
    };

    const newLoanRequestRef = await loanRequestsCollection.add(loanRequestData);

    res.json({ message: 'Loan request processed successfully', loanRequestId: newLoanRequestRef.id });
  } catch (error) {
    console.error('Error during loan request processing:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Endpoint to process loan request status
router.put('/loan-status/:loanRequestId', authenticateUser, async (req, res) => {
  try {
    const { loanRequestId } = req.params;
    const { status, reason } = req.body;

    if (!loanRequestId || !status) {
      return res.status(400).json({ error: 'Bad Request', details: 'Missing required fields' });
    }

    const loanRequestsCollection = db.collection('LoanRequests');
    const loanRequestDoc = await loanRequestsCollection.doc(loanRequestId).get();

    if (!loanRequestDoc.exists) {
      return res.status(404).json({ error: 'Not Found', details: 'Loan request not found' });
    }

    const updatedStatus = status.toLowerCase();

    if (updatedStatus === 'accepted' || updatedStatus === 'rejected') {
      const updateData = { status: updatedStatus };

      if (reason !== undefined) {
        updateData.reason = reason;
      }

      await loanRequestsCollection.doc(loanRequestId).update(updateData);

      res.json({ loanRequestId, status: updatedStatus, reason });
    } else {
      res.status(400).json({ error: 'Bad Request', details: 'Invalid status provided' });
    }
  } catch (error) {
    console.error('Error during loan request status update:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Endpoint to create an active loan
router.post('/active-loans', authenticateUser, async (req, res) => {
  try {
    const { loanRequestId, productId, loanDetails } = req.body;

    if (!loanRequestId || !productId || !loanDetails) {
      return res.status(400).json({ error: 'Bad Request', details: 'Missing required fields' });
    }

    const activeLoansCollection = db.collection('ActiveLoans');
    const activeLoanData = {
      loanRequestId,
      productId,
      loanDetails,
    };

    const newActiveLoanRef = await activeLoansCollection.add(activeLoanData);

    res.json({ message: 'Active loan created successfully', activeLoanId: newActiveLoanRef.id });
  } catch (error) {
    console.error('Error during active loan creation:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Endpoint to get a list of loan requests
router.get('/loan-requests', authenticateUser, async (req, res) => {
  try {
    const loanRequestsCollection = db.collection('LoanRequests');
    const snapshot = await loanRequestsCollection.get();

    const loanRequests = snapshot.docs.map(doc => ({
      loanRequestId: doc.id,
      ...doc.data(),
    }));

    res.json({ loanRequests });
  } catch (error) {
    console.error('Error during loan requests retrieval:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Endpoint to create a lending product (additional route)
router.post('/create-product', async (req, res) => {
  try {
    const { title, description, details, duration, amount, interest } = req.body;

    if (!title || !description || !details || !duration || !amount || !interest) {
      return res.status(400).json({ error: 'Bad Request', details: 'Missing required fields' });
    }

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


module.exports = router;
