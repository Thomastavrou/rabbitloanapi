const express = require('express');
const router = express.Router();

module.exports = ({ db }) => {
  // Create a lending product
  router.post('/create-product', async (req, res) => {
    try {
      const { title, description, details, duration, amount, interest } = req.body;

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

  // Create the loan Request
  router.post('/loan-request', async (req, res) => {
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
        handleError(res, error, 'Error during loan request processing');
      }
    });

    // Get the loan Request to see the approval
    router.get('/loan-requests', async (req, res) => {
        try {
          const loanRequestsCollection = db.collection('LoanRequests');
          const snapshot = await loanRequestsCollection.get();
      
          const loanRequests = snapshot.docs.map(doc => ({
            loanRequestId: doc.id,
            ...doc.data(),
          }));
      
          res.json({ loanRequests });
        } catch (error) {
          handleError(res, error, 'Error during loan requests retrieval');
        }
      });

      // router.post('/active-loans', async (req, res) => {
        // //   try {
        // //     const { loanRequestId, productId, loanDetails } = req.body;
        // //     validateActiveLoan(res, loanRequestId, productId, loanDetails);
        
        // //     const activeLoansCollection = db.collection('ActiveLoans');
        // //     const activeLoanData = {
        // //       loanRequestId,
        // //       productId,
        // //       loanDetails,
        // //     };
        
        // //     const newActiveLoanRef = await activeLoansCollection.add(activeLoanData);
        
        // //     res.json({ message: 'Active loan created successfully', activeLoanId: newActiveLoanRef.id });
        // //   } catch (error) {
        // //     handleError(res, error, 'Error during active loan creation');
        // //   }
        // // });

        // router.put('/loan-status/:loanRequestId', async (req, res) => {
          //   try {
          //     const { loanRequestId } = req.params;
          //     const { status, reason } = req.body;
          
          //     validateLoanStatus(res, loanRequestId, status);
          
          //     const loanRequestsCollection = db.collection('LoanRequests');
          //     const loanRequestDoc = await loanRequestsCollection.doc(loanRequestId).get();
          
          //     if (!loanRequestDoc.exists) {
          //       return res.status(404).json({ error: 'Not Found', details: 'Loan request not found' });
          //     }
          
          //     const updatedStatus = status.toLowerCase();
          //     const updateData = { status: updatedStatus };
          
          //     if (reason !== undefined) {
          //       updateData.reason = reason;
          //     }
          
          //     await loanRequestsCollection.doc(loanRequestId).update(updateData);
          
          //     res.json({ loanRequestId, status: updatedStatus, reason });
          //   } catch (error) {
          //     handleError(res, error, 'Error during loan request status update');
          //   }
          // });
        
  return router;
};
