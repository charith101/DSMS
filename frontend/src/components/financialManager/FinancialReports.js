import React, { useState, useEffect } from 'react';
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
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
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
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';


// ======================================================================================
// API Configuration
// ======================================================================================
// Remove the CORS proxy as it's causing issues and may not be necessary
// if the backend is properly configured with CORS headers
const API_BASE_URL = 'http://localhost:3001';
// ======================================================================================


const FinancialReports = () => {
  // State variables
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('revenue');
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [startDate, setStartDate] = useState(startOfMonth(subMonths(new Date(), 5)));
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

  const fetchFinancialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const response = await axios.get(`${API_BASE_URL}/api/finance/reports`, {
        params: { startDate: formattedStartDate, endDate: formattedEndDate }
      });
      
      if (response.data && response.data.transactions) {
        processApiData(response.data);
      } else {
        setError('The server responded, but the data format is incorrect.');
      }
    } catch (err) {
      console.error('Error fetching financial data:', err);
      setError(err.response?.data?.message || 'Failed to connect to the server. Ensure the backend is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };
  
  // (useEffect and processApiData remain the same)
  useEffect(() => {
    fetchFinancialData();
  }, [reportType, timeFrame, startDate, endDate]);

  const processApiData = (data) => {
    // Process transactions data
    const transactions = data.transactions.map(transaction => ({
      ...transaction,
      date: transaction.date ? parseISO(transaction.date) : new Date(),
      formattedDate: transaction.date ? format(parseISO(transaction.date), 'MMM dd, yyyy') : 'N/A',
      formattedAmount: `$${Number(transaction.amount).toFixed(2)}`
    }));

    // Separate revenue and expenses
    const revenue = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');

    // Calculate summary
    const totalRevenue = revenue.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const netProfit = totalRevenue - totalExpenses;

    // Update state
    setFinancialData({
      revenue,
      expenses,
      transactions
    });

    setSummary({
      totalRevenue,
      totalExpenses,
      netProfit,
      transactionCount: transactions.length
    });
  };


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

    if (timeFrame === 'monthly') {
      // Group by month
      const months = {};
      
      // Process revenue
      revenue.forEach(item => {
        const monthKey = format(item.date, 'yyyy-MM');
        const monthLabel = format(item.date, 'MMM yyyy');
        
        if (!months[monthKey]) {
          months[monthKey] = { name: monthLabel, revenue: 0, expenses: 0 };
        }
        months[monthKey].revenue += Number(item.amount);
      });
      
      // Process expenses
      expenses.forEach(item => {
        const monthKey = format(item.date, 'yyyy-MM');
        const monthLabel = format(item.date, 'MMM yyyy');
        
        if (!months[monthKey]) {
          months[monthKey] = { name: monthLabel, revenue: 0, expenses: 0 };
        }
        months[monthKey].expenses += Number(item.amount);
      });
      
      // Convert to array and sort by date
      data = Object.values(months).sort((a, b) => 
        new Date(a.name) - new Date(b.name)
      );
    } else {
      // Daily view
      const days = {};
      
      // Process revenue
      revenue.forEach(item => {
        const dayKey = format(item.date, 'yyyy-MM-dd');
        const dayLabel = format(item.date, 'MMM dd');
        
        if (!days[dayKey]) {
          days[dayKey] = { name: dayLabel, revenue: 0, expenses: 0 };
        }
        days[dayKey].revenue += Number(item.amount);
      });
      
      // Process expenses
      expenses.forEach(item => {
        const dayKey = format(item.date, 'yyyy-MM-dd');
        const dayLabel = format(item.date, 'MMM dd');
        
        if (!days[dayKey]) {
          days[dayKey] = { name: dayLabel, revenue: 0, expenses: 0 };
        }
        days[dayKey].expenses += Number(item.amount);
      });
      
      // Convert to array and sort by date
      data = Object.values(days).sort((a, b) => 
        new Date(a.name) - new Date(b.name)
      );
    }

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

  // Export data to PDF
  const exportToPDF = () => {
    const { transactions } = financialData;
    const startDateStr = format(startDate, 'MMM dd, yyyy');
    const endDateStr = format(endDate, 'MMM dd, yyyy');
    
    // Create PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Financial Transaction Report', 14, 22);
    
    // Add date range
    doc.setFontSize(12);
    doc.text(`Period: ${startDateStr} to ${endDateStr}`, 14, 32);
    
    // Add summary
    doc.text(`Total Revenue: $${summary.totalRevenue.toFixed(2)}`, 14, 42);
    doc.text(`Total Expenses: $${summary.totalExpenses.toFixed(2)}`, 14, 52);
    doc.text(`Net Profit: $${summary.netProfit.toFixed(2)}`, 14, 62);
    doc.text(`Total Transactions: ${summary.transactionCount}`, 14, 72);
    
    // Prepare data for table
    const tableData = transactions.map(item => [
      item.id,
      item.formattedDate,
      item.description,
      item.type === 'income' ? 'Income' : 'Expense',
      item.formattedAmount
    ]);
    
    // Add table
    doc.autoTable({
      startY: 80,
      head: [['ID', 'Date', 'Description', 'Type', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    // Save PDF
    doc.save(`Financial_Report_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.pdf`);
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
                  ${summary.totalRevenue.toFixed(2)}
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
                  ${summary.totalExpenses.toFixed(2)}
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
                  ${summary.netProfit.toFixed(2)}
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
                <Tooltip title="Export to PDF">
                  <IconButton onClick={exportToPDF}>
                    <PictureAsPdfIcon />
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
              <Tooltip title="Export to PDF">
                <IconButton onClick={exportToPDF}>
                  <PictureAsPdfIcon />
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
                  startAdornment: <span>$</span>,
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