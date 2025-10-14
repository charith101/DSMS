const express = require('express');
const router = express.Router();
const Transaction = require('../model/Transaction');

// @route   POST api/finance/transactions
// @desc    Add a new transaction
router.post('/transactions', async (req, res) => {
  const { date, description, amount, type, category } = req.body;

  try {
    const newTransaction = new Transaction({
      date,
      description,
      amount,
      type,
      category
    });

    const transaction = await newTransaction.save();
    res.json({ success: true, data: transaction, message: "Transaction created successfully!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

//    PUT api/finance/transactions/:id
//    Update a transaction
router.put('/transactions/:id', async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: transaction, message: "Transaction updated successfully!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

//  DELETE api/finance/transactions/:id
//  Delete a transaction
router.delete('/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    await transaction.deleteOne();

    res.json({ success: true, message: 'Transaction removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});


//---------------------------older version--------------------------------------------
// @route   GET api/finance/summary
// @desc    Get financial summary
router.get('/summary', async (req, res) => {
  try {
    const income = await Transaction.aggregate([
      { $match: { type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const expenses = await Transaction.aggregate([
      { $match: { type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalIncome = income.length > 0 ? income[0].total : 0;
    const totalExpenses = expenses.length > 0 ? expenses[0].total : 0;
    const netProfit = totalIncome - totalExpenses;

    res.json({
      income: totalIncome,
      expenses: totalExpenses,
      profit: netProfit
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET api/finance/recent-transactions
// @desc    Get all transactions
router.get('/recent-transactions', async (req, res) => {
    try {
      const transactions = await Transaction.find().sort({ date: -1 });
      res.json(transactions);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });


// @route   GET api/finance/income-by-category
// @desc    Get income by category
router.get('/income-by-category', async (req, res) => {
    try {
      const incomeByCategory = await Transaction.aggregate([
        { $match: { type: 'income' } },
        { $group: { _id: '$category', amount: { $sum: '$amount' } } },
        { $project: { _id: 0, category: '$_id', amount: '$amount' } }
      ]);
      res.json(incomeByCategory);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

// @route   GET api/finance/expenses-by-category
// @desc    Get expenses by category
router.get('/expenses-by-category', async (req, res) => {
    try {
      const expensesByCategory = await Transaction.aggregate([
        { $match: { type: 'expense' } },
        { $group: { _id: '$category', amount: { $sum: '$amount' } } },
        { $project: { _id: 0, category: '$_id', amount: '$amount' } }
      ]);
      res.json(expensesByCategory);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

// @route   GET api/finance/monthly-data
// @desc    Get monthly financial data
router.get('/monthly-data', async (req, res) => {
    try {
      const monthlyData = await Transaction.aggregate([
        {
          $group: {
            _id: { month: { $month: '$date' } },
            income: {
              $sum: {
                $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
              }
            },
            expenses: {
              $sum: {
                $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
              }
            }
          }
        },
        { $sort: { '_id.month': 1 } },
        { $project: { _id: 0, month: '$_id.month', income: '$income', expenses: '$expenses' } }
      ]);
      res.json(monthlyData);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });


module.exports = router;