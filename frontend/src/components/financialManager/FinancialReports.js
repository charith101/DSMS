import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  AlertTitle
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FinancialManagerNav from './FinancialManagerNav';

// Import visualization components
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';

// Import export libraries
import * as XLSX from 'xlsx';


// ======================================================================================
// API Configuration
// ======================================================================================
const API_BASE_URL = 'http://localhost:3005';



const FinancialReports = () => {
  // State variables
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('revenue');
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [startDate, setStartDate] = useState(startOfMonth(subMonths(new Date(), 11))); // 1 year ago
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [financialData, setFinancialData] = useState({
    revenue: [],
    expenses: [],
    transactions: []
  });
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    transactionCount: 0
  });
  const [openTransactionModal, setOpenTransactionModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [transactionForm, setTransactionForm] = useState({
    id: '',
    date: new Date(),
    description: '',
    amount: '',
    type: 'income'
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const processMultipleApiData = useCallback((data) => {
    const { summary, transactions = [] } = data;
    
    console.log('=== PROCESSING API DATA (TRANSACTIONS ONLY) ===');
    console.log('Raw data received:', { 
      summary, 
      transactionsCount: transactions.length
    });
    console.log('Date range filter:', { 
      startDate: format(startDate, 'yyyy-MM-dd'), 
      endDate: format(endDate, 'yyyy-MM-dd') 
    });

    // Use transactions data directly
    const actualTransactions = transactions;
    
    console.log('Using transactions data only:', { 
      transactionsCount: actualTransactions.length
    });
    
    // Convert transactions collection data (only source of data)
    const allTransactions = actualTransactions.map(transactionItem => {
      let transactionDate;
      try {
        if (transactionItem.date) {
          transactionDate = new Date(transactionItem.date);
          // Validate the date
          if (isNaN(transactionDate.getTime())) {
            console.warn('Invalid transaction date:', transactionItem.date);
            transactionDate = new Date();
          }
        } else {
          transactionDate = new Date();
        }
      } catch (error) {
        console.warn('Failed to parse transaction date:', transactionItem.date);
        transactionDate = new Date();
      }
      
      return {
        id: transactionItem._id || transactionItem.id || `transaction_${Date.now()}_${Math.random()}`,
        date: transactionDate,
        description: transactionItem.description || 'Transaction',
        amount: Number(transactionItem.amount) || 0,
        type: transactionItem.type || 'income',
        formattedDate: format(transactionDate, 'MMM dd, yyyy'),
        formattedAmount: `LKR ${Number(transactionItem.amount || 0).toFixed(2)}`
      };
    });
    console.log('=== ALL TRANSACTIONS (FROM TRANSACTIONS COLLECTION ONLY) ===');
    console.log('Total transactions:', allTransactions.length);
    
    // Show all transaction dates to help debug
    if (allTransactions.length > 0) {
      console.log('All transactions with dates:');
      allTransactions.forEach((transaction, index) => {
        console.log(`  ${index + 1}. ${transaction.formattedDate} (${transaction.date.toISOString().split('T')[0]}) - ${transaction.description} - LKR ${transaction.amount} (${transaction.type})`);
      });
    } else {
      console.log('❌ NO TRANSACTIONS FOUND IN DATABASE');
    }
    
    // Simple date filtering - convert dates to YYYY-MM-DD format for comparison
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');
    
    console.log('=== DATE FILTERING ===');
    console.log('Filter range (strings):', { startDateStr, endDateStr });
    
    const filteredTransactions = allTransactions.filter(transaction => {
      try {
        const transactionDateStr = format(transaction.date, 'yyyy-MM-dd');
        const isInRange = transactionDateStr >= startDateStr && transactionDateStr <= endDateStr;
        
        console.log(`Checking transaction: ${transactionDateStr} >= ${startDateStr} && ${transactionDateStr} <= ${endDateStr} = ${isInRange}`);
        
        return isInRange;
      } catch (error) {
        console.error('Error comparing dates for transaction:', transaction, error);
        return false;
      }
    });

    console.log('=== FILTERED RESULTS ===');
    console.log('Transactions after date filtering:', filteredTransactions.length);
    
    if (filteredTransactions.length > 0) {
      console.log('Filtered transactions:');
      filteredTransactions.forEach((transaction, index) => {
        console.log(`  ${index + 1}. ${transaction.formattedDate} - ${transaction.description} - LKR ${transaction.amount} (${transaction.type})`);
      });
    } else {
      console.log('❌ NO TRANSACTIONS FOUND IN DATE RANGE');
      console.log('This could mean:');
      console.log('1. No transactions exist in the database');
      console.log('2. All transactions are outside the selected date range');
      console.log('3. There is an issue with date parsing');
    }

    // Separate revenue and expenses from filtered transactions
    const revenue = filteredTransactions.filter(t => t.type === 'income');
    const expenses = filteredTransactions.filter(t => t.type === 'expense');

    console.log('Separated data:', {
      revenue: revenue.length,
      expenses: expenses.length,
      total: filteredTransactions.length
    });

    // Calculate totals from filtered data only
    const calculatedRevenue = revenue.reduce((sum, item) => sum + Number(item.amount), 0);
    const calculatedExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const calculatedProfit = calculatedRevenue - calculatedExpenses;

    console.log('=== FINAL SUMMARY ===');
    console.log('Calculated totals:', {
      revenue: calculatedRevenue,
      expenses: calculatedExpenses,
      profit: calculatedProfit,
      transactionCount: filteredTransactions.length
    });

    // Update state with filtered data
    setFinancialData({
      revenue,
      expenses,
      transactions: filteredTransactions
    });

    // Use calculated values from filtered data
    setSummary({
      totalRevenue: calculatedRevenue,
      totalExpenses: calculatedExpenses,
      netProfit: calculatedProfit,
      transactionCount: filteredTransactions.length
    });

    console.log('=== DATA PROCESSING COMPLETE ===');
    console.log('✅ Summary cards should now show:', {
      totalRevenue: calculatedRevenue,
      totalExpenses: calculatedExpenses,
      netProfit: calculatedProfit,
      transactionCount: filteredTransactions.length
    });
  }, [startDate, endDate]);

  const fetchFinancialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Testing API endpoints...');
      
      // Test endpoints one by one to identify which one is failing
      let summaryData = null;
      let recentTransactionsData = null;
      let transactionsData = []; // Only using transactions data
      
      try {
        console.log('Calling /api/finance/summary...');
        const summaryResponse = await axios.get(`${API_BASE_URL}/api/finance/summary`);
        summaryData = summaryResponse.data;
        console.log('Summary response:', summaryData);
      } catch (err) {
        console.error('Summary endpoint failed:', err.response?.status, err.response?.data);
      }
      
      try {
        console.log('Calling /api/finance/recent-transactions...');
        const recentResponse = await axios.get(`${API_BASE_URL}/api/finance/recent-transactions`);
        recentTransactionsData = recentResponse.data;
        console.log('Recent transactions response:', recentTransactionsData);
        
        // Use all transactions data without filtering
        transactionsData = recentTransactionsData || [];
        console.log('All transactions data:', transactionsData);
      } catch (err) {
        console.error('Recent transactions endpoint failed:', err.response?.status, err.response?.data);
      }
      
      // Skip payments and payroll endpoints - using only transactions collection
      console.log('Using only transactions collection to avoid data duplication');
      
      // Process the data from transactions collection only
      processMultipleApiData({
        summary: summaryData,
        recentTransactions: recentTransactionsData,
        payments: [], // Empty array - not using payments data
        payroll: [], // Empty array - not using payroll data
        transactions: transactionsData // Only use transactions data
      });
      
    } catch (err) {
      console.error('Error fetching financial data:', err);
      setError(`Failed to connect to the server. Details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [processMultipleApiData]);
  
  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData, reportType, timeFrame]);


  const handleSaveTransaction = async () => {
    setLoading(true);
    setError(null);
    try {
      const transactionData = {
        ...transactionForm,
        date: format(transactionForm.date, 'yyyy-MM-dd'),
        amount: Number(transactionForm.amount)
      };

      if (currentTransaction) {
        await axios.put(`${API_BASE_URL}/api/finance/transactions/${transactionForm.id}`, transactionData);
      } else {
        await axios.post(`${API_BASE_URL}/api/finance/transactions`, transactionData);
      }
      fetchFinancialData();
      handleCloseTransactionModal();
    } catch (err) {
      console.error('Error saving transaction:', err);
      setError(err.response?.data?.message || 'Failed to save the transaction.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/api/finance/transactions/${id}`);
      fetchFinancialData();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError(err.response?.data?.message || 'Failed to delete the transaction.');
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  // Handle opening transaction modal for adding new transaction
  const handleAddTransaction = () => {
    setCurrentTransaction(null);
    setTransactionForm({
      id: '',
      date: new Date(),
      description: '',
      amount: '',
      type: 'income'
    });
    setOpenTransactionModal(true);
  };

  // Handle opening transaction modal for editing existing transaction
  const handleEditTransaction = (transaction) => {
    setCurrentTransaction(transaction);
    setTransactionForm({
      id: transaction.id,
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type
    });
    setOpenTransactionModal(true);
  };

  // Handle closing transaction modal
  const handleCloseTransactionModal = () => {
    setOpenTransactionModal(false);
    setCurrentTransaction(null);
  };

  // Handle opening delete confirmation dialog
  const handleOpenDeleteConfirm = (transaction) => {
    setCurrentTransaction(transaction);
    setDeleteConfirmOpen(true);
  };

  // Handle closing delete confirmation dialog
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setCurrentTransaction(null);
  };

  // Handle form field changes
  const handleFormChange = (field, value) => {
    setTransactionForm({
      ...transactionForm,
      [field]: value
    });
  };

  // Get chart data based on report type and time frame
  const getChartData = () => {
    const { revenue, expenses } = financialData;
    let data = [];

    console.log('Generating chart data for date range:', {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      revenueCount: revenue.length,
      expensesCount: expenses.length
    });

    // Data is already filtered by date range in processMultipleApiData
    // group by the selected time frame

    if (timeFrame === 'monthly') {
      // Group by month
      const months = {};
      
      console.log('=== MONTHLY CHART DATA PROCESSING ===');
      console.log('Processing revenue transactions:', revenue.length);
      
      // Process revenue
      revenue.forEach((item, index) => {
        if (!item.date) return; // Skip if no date
        
        try {
          const itemDate = new Date(item.date);
          // Validate the date
          if (isNaN(itemDate.getTime())) {
            console.warn('Invalid revenue item date:', item.date);
            return;
          }
          
          const monthKey = format(itemDate, 'yyyy-MM');
          const monthLabel = format(itemDate, 'MMM yyyy');
          
          if (!months[monthKey]) {
            months[monthKey] = { 
              name: monthLabel, 
              revenue: 0, 
              expenses: 0,
              sortDate: itemDate
            };
            console.log(`Created new month entry: ${monthLabel} (${monthKey})`);
          }
          
          const previousRevenue = months[monthKey].revenue;
          months[monthKey].revenue += Number(item.amount || 0);
          
          console.log(`Revenue ${index + 1}: ${item.description} - LKR ${item.amount} added to ${monthLabel}`);
          console.log(`  Previous total: LKR ${previousRevenue} -> New total: LKR ${months[monthKey].revenue}`);
        } catch (err) {
          console.error('Error processing revenue item:', item, err);
        }
      });
      
      console.log('Processing expense transactions:', expenses.length);
      
      // Process expenses
      expenses.forEach((item, index) => {
        if (!item.date) return; // Skip if no date
        
        try {
          const itemDate = new Date(item.date);
          // Validate the date
          if (isNaN(itemDate.getTime())) {
            console.warn('Invalid expense item date:', item.date);
            return;
          }
          
          const monthKey = format(itemDate, 'yyyy-MM');
          const monthLabel = format(itemDate, 'MMM yyyy');
          
          if (!months[monthKey]) {
            months[monthKey] = { 
              name: monthLabel, 
              revenue: 0, 
              expenses: 0,
              sortDate: itemDate
            };
            console.log(`Created new month entry: ${monthLabel} (${monthKey})`);
          }
          
          const previousExpenses = months[monthKey].expenses;
          months[monthKey].expenses += Number(item.amount || 0);
          
          console.log(`Expense ${index + 1}: ${item.description} - LKR ${item.amount} added to ${monthLabel}`);
          console.log(`  Previous total: LKR ${previousExpenses} -> New total: LKR ${months[monthKey].expenses}`);
        } catch (err) {
          console.error('Error processing expense item:', item, err);
        }
      });
      
      console.log('=== MONTHLY AGGREGATION SUMMARY ===');
      Object.keys(months).forEach(monthKey => {
        const month = months[monthKey];
        console.log(`${month.name}: Revenue LKR ${month.revenue}, Expenses LKR ${month.expenses}`);
      });
      
      // Convert to array and sort by date
      data = Object.values(months).sort((a, b) => a.sortDate - b.sortDate);
    } else {
      // Daily view
      const days = {};
      
      // Process revenue
      revenue.forEach(item => {
        if (!item.date) return; // Skip if no date
        
        try {
          const itemDate = new Date(item.date);
          // Validate the date
          if (isNaN(itemDate.getTime())) {
            console.warn('Invalid daily revenue item date:', item.date);
            return;
          }
          
          const dayKey = format(itemDate, 'yyyy-MM-dd');
          const dayLabel = format(itemDate, 'MMM dd');
          
          if (!days[dayKey]) {
            days[dayKey] = { 
              name: dayLabel, 
              revenue: 0, 
              expenses: 0,
              sortDate: itemDate
            };
          }
          days[dayKey].revenue += Number(item.amount || 0);
        } catch (err) {
          console.error('Error processing daily revenue item:', item, err);
        }
      });
      
      // Process expenses
      expenses.forEach(item => {
        if (!item.date) return; // Skip if no date
        
        try {
          const itemDate = new Date(item.date);
          // Validate the date
          if (isNaN(itemDate.getTime())) {
            console.warn('Invalid daily expense item date:', item.date);
            return;
          }
          
          const dayKey = format(itemDate, 'yyyy-MM-dd');
          const dayLabel = format(itemDate, 'MMM dd');
          
          if (!days[dayKey]) {
            days[dayKey] = { 
              name: dayLabel, 
              revenue: 0, 
              expenses: 0,
              sortDate: itemDate
            };
          }
          days[dayKey].expenses += Number(item.amount || 0);
        } catch (err) {
          console.error('Error processing daily expense item:', item, err);
        }
      });
      
      // Convert to array and sort by date
      data = Object.values(days).sort((a, b) => a.sortDate - b.sortDate);
    }

    // Clean up the data for chart display
    data = data.map(item => ({
      name: item.name,
      revenue: Number(item.revenue.toFixed(2)),
      expenses: Number(item.expenses.toFixed(2))
    }));

    // If no data from transactions within the date range, create placeholder
    if (data.length === 0) {
      console.log('No chart data found for selected date range, creating placeholder');
      const placeholderLabel = timeFrame === 'monthly' 
        ? format(startDate, 'MMM yyyy')
        : format(startDate, 'MMM dd');
      
      data = [{
        name: placeholderLabel,
        revenue: 0,
        expenses: 0
      }];
    }

    console.log('Final chart data:', data);
    return data;
  };

  // Export data to Excel
  const exportToExcel = () => {
    const { transactions } = financialData;
    
    // Prepare data for export
    const exportData = transactions.map(item => ({
      'Transaction ID': item.id,
      'Date': item.formattedDate,
      'Description': item.description,
      'Type': item.type === 'income' ? 'Income' : 'Expense',
      'Amount': item.formattedAmount
    }));
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    
    // Generate filename with date range
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');
    const fileName = `Financial_Report_${startDateStr}_to_${endDateStr}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, fileName);
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <FinancialManagerNav />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        {/* Header */}
        <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom>
              Financial Reports
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleAddTransaction}
              sx={{ mr: 1 }}
            >
              Add Transaction
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />} 
              onClick={fetchFinancialData}
              sx={{ mr: 1 }}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  label="Report Type"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="revenue">Revenue</MenuItem>
                  <MenuItem value="expenses">Expenses</MenuItem>
                  <MenuItem value="profit">Profit/Loss</MenuItem>
                  <MenuItem value="transactions">All Transactions</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Time Frame</InputLabel>
                <Select
                  value={timeFrame}
                  label="Time Frame"
                  onChange={(e) => setTimeFrame(e.target.value)}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </Paper>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h5" component="div">
                  LKR   {summary.totalRevenue.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Expenses
                </Typography>
                <Typography variant="h5" component="div">
                  LKR   {summary.totalExpenses.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Net Profit
                </Typography>
                <Typography variant="h5" component="div" color={summary.netProfit >= 0 ? 'success.main' : 'error.main'}>
                  LKR   {summary.netProfit.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Transactions
                </Typography>
                <Typography variant="h5" component="div">
                  {summary.transactionCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Chart */}
        {reportType !== 'transactions' && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" component="h2">
                {reportType === 'revenue' ? 'Revenue' : reportType === 'expenses' ? 'Expenses' : 'Profit/Loss'} Chart
              </Typography>
              <Box>
                <Tooltip title="Export to Excel">
                  <IconButton onClick={exportToExcel}>
                    <FileDownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Print">
                  <IconButton onClick={handlePrint}>
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Box sx={{ height: 300 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    {(reportType === 'revenue' || reportType === 'profit') && (
                      <Bar dataKey="revenue" name="Revenue" fill="#4caf50" />
                    )}
                    {(reportType === 'expenses' || reportType === 'profit') && (
                      <Bar dataKey="expenses" name="Expenses" fill="#f44336" />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        )}

        {/* Transactions Table */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" component="h2">
              Transactions
            </Typography>
            <Box>
              <Tooltip title="Export to Excel">
                <IconButton onClick={exportToExcel}>
                  <FileDownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Print">
                <IconButton onClick={handlePrint}>
                  <PrintIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {financialData.transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No transactions found for the selected period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    financialData.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.formattedDate}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          {transaction.type === 'income' ? 'Income' : 'Expense'}
                        </TableCell>
                        <TableCell align="right" sx={{ color: transaction.type === 'income' ? 'success.main' : 'error.main' }}>
                          {transaction.formattedAmount}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEditTransaction(transaction)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleOpenDeleteConfirm(transaction)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      {/* Transaction Form Modal */}
      <Dialog open={openTransactionModal} onClose={handleCloseTransactionModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentTransaction ? 'Edit Transaction' : 'Add New Transaction'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={transactionForm.date}
                  onChange={(newValue) => handleFormChange('date', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={transactionForm.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={transactionForm.type}
                  label="Type"
                  onChange={(e) => handleFormChange('type', e.target.value)}
                >
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Amount"
                type="number"
                value={transactionForm.amount}
                onChange={(e) => handleFormChange('amount', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">LKR</InputAdornment>,
                }}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransactionModal}>Cancel</Button>
          <Button 
            onClick={handleSaveTransaction} 
            variant="contained" 
            disabled={!transactionForm.description || !transactionForm.amount}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this transaction? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button 
            onClick={() => handleDeleteTransaction(currentTransaction?.id)} 
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FinancialReports;