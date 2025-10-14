const Transaction = require('../../model/Transaction');

// Get all transactions with filtering
// GET /api/finance/transactions

exports.getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type, category, sort, page = 1, limit = 10, search } = req.query;
    
    // Build query
    const query = {};
    
    // Add filters if provided
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }
    
    if (type) query.type = type;
    if (category) query.category = category;
    
    // Add search functionality
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort
    let sortOptions = { date: -1 }; // Default sort by date desc
    if (sort) {
      const [field, order] = sort.split(':');
      sortOptions = { [field]: order === 'asc' ? 1 : -1 };
    }
    
    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Execute query with pagination
    const transactions = await Transaction.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    // Get total count for pagination
    const totalCount = await Transaction.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      data: transactions
    });
  } catch (err) {
    console.error('Error retrieving transactions:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error - Failed to retrieve transactions'
    });
  }
};

//   Get single transaction
//   GET /api/finance/transactions/:id
//   Private
exports.getTransaction = async (req, res) => {
  try {
    // Validate transaction ID
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction ID format'
      });
    }
    
    const transaction = await Transaction.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (err) {
    console.error('Error retrieving transaction:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error - Failed to retrieve transaction'
    });
  }
};

// Delegate create/update/delete to financeAPI handlers to avoid duplication
const financeAPI = require('./financeAPI');

exports.createTransaction = (req, res, next) => {
  // financeAPI.createTransaction expects (req, res)
  return financeAPI.createTransaction(req, res, next);
};

exports.updateTransaction = (req, res, next) => {
  return financeAPI.updateTransaction(req, res, next);
};

exports.deleteTransaction = (req, res, next) => {
  return financeAPI.deleteTransaction(req, res, next);
};