const express = require('express');
const router = express.Router();
const Payment = require('../../models/Payment');
const Payroll = require('../../models/Payroll');
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
    const expensesByMonth = await Payroll.aggregate([
      { $match: { status: 'Paid' } },
      {
        $group: {
          _id: { $substr: ['$month', 5, 2] }, // Extract month from YYYY-MM format
          total: { $sum: '$salary' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Map month numbers to names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = expensesByMonth.map(item => ({
      category: monthNames[parseInt(item._id) - 1],
      amount: item.total
    }));
    
    res.json(result);
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

// Get recent transactions (both payments and payroll)
router.get('/recent-transactions', async (req, res) => {
  try {
    // Get recent payments
    const recentPayments = await Payment.find()
      .sort({ paymentDate: -1 })
      .limit(10)
      .populate('studentId', 'name')
      .lean();
    
    // Get recent payroll entries
    const recentPayroll = await Payroll.find()
      .sort({ paidDate: -1 })
      .limit(10)
      .populate('employeeId', 'name')
      .lean();
    
    // Format payments
    const formattedPayments = recentPayments.map(payment => ({
      id: payment._id,
      date: payment.paymentDate,
      description: `Payment from ${payment.studentId?.name || 'Student'}`,
      amount: payment.amount,
      type: 'income',
      status: payment.status
    }));
    
    // Format payroll
    const formattedPayroll = recentPayroll.map(payroll => ({
      id: payroll._id,
      date: payroll.paidDate || new Date(`${payroll.month}-01`),
      description: `Salary for ${payroll.employeeId?.name || 'Employee'}`,
      amount: payroll.salary,
      type: 'expense',
      status: payroll.status
    }));
    
    // Combine and sort by date
    const transactions = [...formattedPayments, ...formattedPayroll]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
    
    res.json(transactions);
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

module.exports = router;