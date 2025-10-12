const express = require('express');
const router = express.Router();
const Payment = require('../../models/Payment');
const Payroll = require('../../models/Payroll');
const Transaction = require('../../model/Transaction'); // Add Transaction model
const mongoose = require('mongoose');

// Get financial summary (total income, expenses, profit)
router.get('/summary', async (req, res) => {
  try {
    // Calculate total income from payments
    const totalIncome = await Payment.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Calculate total expenses from payroll
    const totalExpenses = await Payroll.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$salary' } } }
    ]);
    
    const income = totalIncome.length > 0 ? totalIncome[0].total : 0;
    const expenses = totalExpenses.length > 0 ? totalExpenses[0].total : 0;
    const profit = income - expenses;
    
    res.json({
      income,
      expenses,
      profit
    });
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    res.status(500).json({ error: 'Failed to fetch financial summary' });
  }
});

// Get income by category (student payments grouped by month)
router.get('/income-by-category', async (req, res) => {
  try {
    const incomeByMonth = await Payment.aggregate([
      { $match: { status: 'Paid' } },
      {
        $group: {
          _id: { $month: '$paymentDate' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Map month numbers to names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = incomeByMonth.map(item => ({
      category: monthNames[item._id - 1],
      amount: item.total
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching income by category:', error);
    res.status(500).json({ error: 'Failed to fetch income by category' });
  }
});

// Get expenses by category (payroll expenses grouped by month)
router.get('/expenses-by-category', async (req, res) => {
  try {
    // Get all expense transactions (excluding payroll salaries)
    const expenses = await Transaction.find({
      type: 'expense',
      category: { $ne: 'Salary' }, // Exclude payroll salaries
      description: { $not: /^Salary for/ } // Exclude payroll entries
    }).sort({ date: -1 });
    
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses by category:', error);
    res.status(500).json({ error: 'Failed to fetch expenses by category' });
  }
});

// Get monthly financial data for charts
router.get('/monthly-data', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Get monthly income
    const monthlyIncome = await Payment.aggregate([
      {
        $match: {
          status: 'Paid',
          paymentDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$paymentDate' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get monthly expenses
    const monthlyExpenses = await Payroll.aggregate([
      {
        $match: {
          status: 'Paid',
          month: { $regex: `^${currentYear}` } // Match months in current year
        }
      },
      {
        $group: {
          _id: { $substr: ['$month', 5, 2] }, // Extract month from YYYY-MM format
          total: { $sum: '$salary' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Prepare data for all 12 months
    const monthlyData = [];
    for (let i = 1; i <= 12; i++) {
      const incomeEntry = monthlyIncome.find(item => item._id === i);
      const expenseEntry = monthlyExpenses.find(item => parseInt(item._id) === i);
      
      monthlyData.push({
        month: i,
        income: incomeEntry ? incomeEntry.total : 0,
        expenses: expenseEntry ? expenseEntry.total : 0
      });
    }
    
    res.json(monthlyData);
  } catch (error) {
    console.error('Error fetching monthly financial data:', error);
    res.status(500).json({ error: 'Failed to fetch monthly financial data' });
  }
});

// Get recent transactions (from transactions collection, payments, and payroll)
router.get('/recent-transactions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get recent transactions from transactions collection
    const recentTransactions = await Transaction.find()
      .sort({ date: -1 })
      .limit(limit)
      .lean();
    
    // Get recent payments
    const recentPayments = await Payment.find()
      .sort({ paymentDate: -1 })
      .limit(5)
      .populate('studentId', 'name')
      .lean();
    
    // Get recent payroll entries  
    const recentPayroll = await Payroll.find()
      .sort({ paidDate: -1 })
      .limit(5)
      .populate('employeeId', 'name')
      .lean();
    
    // Format transactions 
    const formattedTransactions = recentTransactions.map(transaction => ({
      _id: transaction._id,
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category
    }));
    
    // Format payments
    const formattedPayments = recentPayments.map(payment => ({
      _id: payment._id,
      date: payment.paymentDate,
      description: `Payment from ${payment.studentId?.name || 'Student'}`,
      amount: payment.amount,
      type: 'income',
      category: 'Tuition Fee',
      status: payment.status
    }));
    
    // Format payroll
    const formattedPayroll = recentPayroll.map(payroll => ({
      _id: payroll._id,
      date: payroll.paidDate || new Date(`${payroll.month}-01`),
      description: `Salary for ${payroll.employeeId?.name || 'Employee'}`,
      amount: payroll.salary,
      type: 'expense',
      category: 'Salary',
      status: payroll.status
    }));
    
    // Combine all transactions and sort by date
    const allTransactions = [...formattedTransactions, ...formattedPayments, ...formattedPayroll]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
    
    res.json(allTransactions);
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    res.status(500).json({ error: 'Failed to fetch recent transactions' });
  }
});

// Get all payments with pagination
router.get('/payments', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const payments = await Payment.find()
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('studentId', 'name email')
      .lean();
    
    const total = await Payment.countDocuments();
    
    res.json({
      data: payments,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get all payroll entries with pagination
router.get('/payroll', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const payroll = await Payroll.find()
      .sort({ month: -1 })
      .skip(skip)
      .limit(limit)
      .populate('employeeId', 'name email')
      .lean();
    
    const total = await Payroll.countDocuments();
    
    res.json({
      data: payroll,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payroll data:', error);
    res.status(500).json({ error: 'Failed to fetch payroll data' });
  }
});

// ========================================
// TRANSACTION CRUD OPERATIONS
// ========================================

// Create new transaction
router.post('/transactions', async (req, res) => {
  try {
    const { date, description, amount, type, category } = req.body;
    
    // Validate required fields
    if (!date || !description || !amount || !type || !category) {
      return res.status(400).json({ 
        success: false,
        error: 'All fields are required: date, description, amount, type, category' 
      });
    }
    
    // Validate amount is positive
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Amount must be a positive number' 
      });
    }
    
    // Create new transaction
    const transaction = new Transaction({
      date: new Date(date),
      description,
      amount: parseFloat(amount),
      type,
      category
    });
    
    const savedTransaction = await transaction.save();
    
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: savedTransaction
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create transaction' 
    });
  }
});

// Update existing transaction
router.put('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, description, amount, type, category } = req.body;
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid transaction ID' 
      });
    }
    
    // Validate required fields
    if (!date || !description || !amount || !type || !category) {
      return res.status(400).json({ 
        success: false,
        error: 'All fields are required: date, description, amount, type, category' 
      });
    }
    
    // Validate amount is positive
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Amount must be a positive number' 
      });
    }
    
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      {
        date: new Date(date),
        description,
        amount: parseFloat(amount),
        type,
        category
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedTransaction) {
      return res.status(404).json({ 
        success: false,
        error: 'Transaction not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTransaction
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update transaction' 
    });
  }
});

// Delete transaction
router.delete('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid transaction ID' 
      });
    }
    
    const deletedTransaction = await Transaction.findByIdAndDelete(id);
    
    if (!deletedTransaction) {
      return res.status(404).json({ 
        success: false,
        error: 'Transaction not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Transaction deleted successfully',
      data: deletedTransaction
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete transaction' 
    });
  }
});

// ========================================
// PAYROLL CRUD OPERATIONS
// ========================================

// Create new payroll entry
router.post('/payroll', async (req, res) => {
  try {
    const { employeeId, month, totalHours, hourlyRate, paidDate, status } = req.body;
    
    // Calculate salary
    const salary = totalHours * hourlyRate;
    
    const payrollData = {
      employeeId,
      month,
      totalHours,
      hourlyRate,
      salary,
      paidDate,
      status: status || 'Pending'
    };
    
    const newPayroll = new Payroll(payrollData);
    const savedPayroll = await newPayroll.save();
    
    // Populate employee data for response
    const populatedPayroll = await Payroll.findById(savedPayroll._id)
      .populate('employeeId', 'name email role')
      .lean();
    
    res.status(201).json({
      success: true,
      message: 'Payroll entry created successfully',
      data: populatedPayroll
    });
  } catch (error) {
    console.error('Error creating payroll entry:', error);
    if (error.code === 11000) {
      res.status(400).json({ 
        success: false,
        error: 'Payroll entry already exists for this employee and month' 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Failed to create payroll entry' 
      });
    }
  }
});

// Update payroll entry
router.put('/payroll/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, month, totalHours, hourlyRate, paidDate, status } = req.body;
    
    // Calculate salary if hours or rate changed
    const salary = totalHours * hourlyRate;
    
    const updateData = {
      employeeId,
      month,
      totalHours,
      hourlyRate,
      salary,
      paidDate,
      status
    };
    
    const updatedPayroll = await Payroll.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('employeeId', 'name email role');
    
    if (!updatedPayroll) {
      return res.status(404).json({ 
        success: false,
        error: 'Payroll entry not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Payroll entry updated successfully',
      data: updatedPayroll
    });
  } catch (error) {
    console.error('Error updating payroll entry:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update payroll entry' 
    });
  }
});

// Delete payroll entry
router.delete('/payroll/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedPayroll = await Payroll.findByIdAndDelete(id);
    
    if (!deletedPayroll) {
      return res.status(404).json({ 
        success: false,
        error: 'Payroll entry not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Payroll entry deleted successfully',
      data: deletedPayroll
    });
  } catch (error) {
    console.error('Error deleting payroll entry:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete payroll entry' 
    });
  }
});

// Get employees for payroll (instructors, officers, managers, etc.)
router.get('/employees', async (req, res) => {
  try {
    const User = require('../../models/Users');
    const employees = await User.find({ 
      role: { $in: ['instructor', 'financial_manager', 'receptionist', 'manager', 'officer', 'admin'] }
    }).select('name email role').lean();
    
    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch employees' 
    });
  }
});

module.exports = router;