const Transaction = require('../../model/Transaction');

// @desc    Get all transactions with filtering
// @route   GET /api/finance/transactions
// @access  Private
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

// @desc    Get single transaction
// @route   GET /api/finance/transactions/:id
// @access  Private
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

// @desc    Create new transaction
// @route   POST /api/finance/transactions
// @access  Private
exports.createTransaction = async (req, res) => {
  try {
    // Validate required fields
    const { amount, description, category, type } = req.body;
    
    if (!amount || !description || !category || !type) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields: amount, description, category, and type'
      });
    }
    
    // Validate amount is a positive number
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive number'
      });
    }
    
    // Add user to request body
    if (req.user && req.user.id) {
      req.body.createdBy = req.user.id;
      req.body.updatedBy = req.user.id;
    }
    
    // Create transaction in database
    const transaction = await Transaction.create(req.body);
    
    // Return success response with created transaction
    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      console.error('Error creating transaction:', err);
      res.status(500).json({
        success: false,
        error: 'Server Error - Failed to create transaction'
      });
    }
  }
};

// @desc    Update transaction
// @route   PUT /api/finance/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res) => {
  try {
    // Validate transaction ID
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction ID format'
      });
    }
    
    // Validate required fields
    const { amount, description, category, type } = req.body;
    
    if (!amount || !description || !category || !type) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields: amount, description, category, and type'
      });
    }
    
    // Validate amount is a positive number
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive number'
      });
    }
    
    // Check if transaction exists
    let transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    // Add updatedBy field
    if (req.user && req.user.id) {
      req.body.updatedBy = req.user.id;
    }
    
    // Update updatedAt timestamp
    req.body.updatedAt = Date.now();
    
    // Update transaction in database
    transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('createdBy', 'name').populate('updatedBy', 'name');
    
    // Return success response with updated transaction
    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      console.error('Error updating transaction:', err);
      res.status(500).json({
        success: false,
        error: 'Server Error - Failed to update transaction'
      });
    }
  }
};

// @desc    Delete transaction
// @route   DELETE /api/finance/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res) => {
  try {
    // Validate transaction ID
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction ID format'
      });
    }
    
    // Find transaction by ID
    const transaction = await Transaction.findById(req.params.id);
    
    // Check if transaction exists
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    // Delete transaction from database
    await Transaction.findByIdAndDelete(req.params.id);
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: {}
    });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error - Failed to delete transaction'
    });
  }
};