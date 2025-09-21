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
  Tooltip
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

// Import visualization components
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

// Import export libraries
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const FinancialReports = () => {
  // State variables
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('revenue');
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [startDate, setStartDate] = useState(startOfMonth(subMonths(new Date(), 6)));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [financialData, setFinancialData] = useState({
    revenue: [],
    expenses: [],
    profits: [],
    transactions: []
  });
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    transactionCount: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Fetch financial data
  useEffect(() => {
    fetchFinancialData();
  }, [reportType, timeFrame, startDate, endDate]);
  
  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      // Format dates for API request
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      // API calls for different data types
      // In a real application, these would be actual API endpoints
      // For now, we'll use mock data
      
      // Use mock data for development/demo purposes
      generateMockData();
    } catch (error) {
      console.error('Error fetching financial data:', error);
      // Use mock data as fallback
      generateMockData();
    } finally {
      setLoading(false);
    }
  };
  
  // Generate mock data for development/demo purposes
  const generateMockData = () => {
    const mockRevenue = [];
    const mockExpenses = [];
    const mockTransactions = [];
    
    // Generate data for the last 6 months
    for (let i = 0; i < 6; i++) {
      const date = format(subMonths(new Date(), i), 'yyyy-MM-dd');
      const monthName = format(subMonths(new Date(), i), 'MMM yyyy');
      
      // Revenue by category
      const tuitionFees = Math.floor(Math.random() * 50000) + 100000;
      const registrationFees = Math.floor(Math.random() * 10000) + 20000;
      const examFees = Math.floor(Math.random() * 15000) + 30000;
      
      mockRevenue.push(
        { date, monthName, amount: tuitionFees, category: 'Tuition Fees' },
        { date, monthName, amount: registrationFees, category: 'Registration Fees' },
        { date, monthName, amount: examFees, category: 'Exam Fees' }
      );
      
      // Expenses by category
      const salaries = Math.floor(Math.random() * 40000) + 80000;
      const utilities = Math.floor(Math.random() * 5000) + 10000;
      const maintenance = Math.floor(Math.random() * 8000) + 15000;
      
      mockExpenses.push(
        { date, monthName, amount: salaries, category: 'Salaries' },
        { date, monthName, amount: utilities, category: 'Utilities' },
        { date, monthName, amount: maintenance, category: 'Maintenance' }
      );
      
      // Generate some transactions
      for (let j = 0; j < 5; j++) {
        mockTransactions.push({
          id: `TR-${i}-${j}`,
          date,
          description: ['Tuition Payment', 'Registration Fee', 'Exam Fee', 'Salary Payment', 'Utility Bill'][j % 5],
          amount: Math.floor(Math.random() * 10000) + 1000,
          type: j < 3 ? 'income' : 'expense'
        });
      }
    }
    
    // Calculate profits
    const profits = mockRevenue.reduce((acc, rev) => {
      const existingProfit = acc.find(p => p.monthName === rev.monthName);
      if (existingProfit) {
        existingProfit.amount += rev.amount;
      } else {
        acc.push({
          date: rev.date,
          monthName: rev.monthName,
          amount: rev.amount,
          category: 'Gross Revenue'
        });
      }
      return acc;
    }, []).map(profit => {
      const monthExpenses = mockExpenses
        .filter(exp => exp.monthName === profit.monthName)
        .reduce((sum, exp) => sum + exp.amount, 0);
      return {
        ...profit,
        amount: profit.amount - monthExpenses,
        category: 'Net Profit'
      };
    });
    
    // Calculate summary metrics
    const totalRevenue = mockRevenue.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = mockExpenses.reduce((sum, item) => sum + item.amount, 0);
    
    setFinancialData({
      revenue: mockRevenue,
      expenses: mockExpenses,
      profits,
      transactions: mockTransactions
    });
    
    setSummary({
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      transactionCount: mockTransactions.length
    });
  };
  
  // Helper function to prepare chart data based on report type
  const getChartData = () => {
    switch (reportType) {
      case 'revenue':
        return prepareChartData(financialData.revenue);
      case 'expenses':
        return prepareChartData(financialData.expenses);
      case 'profits':
        return prepareChartData(financialData.profits);
      default:
        return [];
    }
  };
  
  // Prepare chart data by aggregating by month/category
  const prepareChartData = (data) => {
    if (!data || data.length === 0) return [];
    
    // Group by month
    const groupedByMonth = data.reduce((acc, item) => {
      const monthName = item.monthName || format(parseISO(item.date), 'MMM yyyy');
      
      if (!acc[monthName]) {
        acc[monthName] = {};
      }
      
      if (!acc[monthName][item.category]) {
        acc[monthName][item.category] = 0;
      }
      
      acc[monthName][item.category] += item.amount;
      return acc;
    }, {});
    
    // Convert to chart format
    return Object.keys(groupedByMonth).map(month => {
      return {
        name: month,
        ...groupedByMonth[month]
      };
    });
  };
  
  // Get categories for the selected report type
  const getCategories = () => {
    const data = financialData[reportType] || [];
    return [...new Set(data.map(item => item.category))];
  };
  
  // Export to Excel
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Add summary sheet
    const summaryData = [
      ['Financial Summary Report'],
      ['Period', `${format(startDate, 'MMM dd, yyyy')} to ${format(endDate, 'MMM dd, yyyy')}`],
      [''],
      ['Metric', 'Amount (Rs)'],
      ['Total Revenue', summary.totalRevenue.toLocaleString()],
      ['Total Expenses', summary.totalExpenses.toLocaleString()],
      ['Net Profit', summary.netProfit.toLocaleString()],
      ['Transaction Count', summary.transactionCount]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Add detailed data sheets
    ['revenue', 'expenses', 'profits'].forEach(type => {
      if (financialData[type] && financialData[type].length > 0) {
        const sheetData = [
          [`${type.charAt(0).toUpperCase() + type.slice(1)} Report`],
          ['Date', 'Category', 'Amount (Rs)']
        ];
        
        financialData[type].forEach(item => {
          sheetData.push([
            item.monthName || format(parseISO(item.date), 'MMM dd, yyyy'),
            item.category,
            item.amount.toLocaleString()
          ]);
        });
        
        const sheet = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, sheet, type.charAt(0).toUpperCase() + type.slice(1));
      }
    });
    
    // Generate Excel file
    XLSX.writeFile(workbook, `Financial_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };
  
  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF('portrait', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = margin;
    
    // Add title
    doc.setFontSize(18);
    doc.text('Financial Report', pageWidth / 2, y, { align: 'center' });
    y += 30;
    
    // Add period
    doc.setFontSize(12);
    doc.text(`Period: ${format(startDate, 'MMM dd, yyyy')} to ${format(endDate, 'MMM dd, yyyy')}`, pageWidth / 2, y, { align: 'center' });
    y += 40;
    
    // Add summary table
    doc.setFontSize(14);
    doc.text('Financial Summary', margin, y);
    y += 20;
    
    const summaryData = [
      ['Metric', 'Amount (Rs)'],
      ['Total Revenue', summary.totalRevenue.toLocaleString()],
      ['Total Expenses', summary.totalExpenses.toLocaleString()],
      ['Net Profit', summary.netProfit.toLocaleString()],
      ['Transaction Count', summary.transactionCount.toString()]
    ];
    
    doc.autoTable({
      startY: y,
      head: [summaryData[0]],
      body: summaryData.slice(1),
      margin: { left: margin, right: margin },
      theme: 'grid'
    });
    
    // Save the PDF
    doc.save(`Financial_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };
  
  // Print report
  const printReport = () => {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Financial Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2 { text-align: center; }
            .summary { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Financial Report</h1>
          <h2>Period: ${format(startDate, 'MMM dd, yyyy')} to ${format(endDate, 'MMM dd, yyyy')}</h2>
          
          <div class="summary">
            <h3>Financial Summary</h3>
            <table>
              <tr><th>Metric</th><th>Amount (Rs)</th></tr>
              <tr><td>Total Revenue</td><td>${summary.totalRevenue.toLocaleString()}</td></tr>
              <tr><td>Total Expenses</td><td>${summary.totalExpenses.toLocaleString()}</td></tr>
              <tr><td>Net Profit</td><td>${summary.netProfit.toLocaleString()}</td></tr>
              <tr><td>Transaction Count</td><td>${summary.transactionCount}</td></tr>
            </table>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Print after content is loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Financial Reports
          </Typography>
          
          <Box>
            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchFinancialData} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Toggle Filters">
              <IconButton onClick={() => setShowFilters(!showFilters)}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Export to Excel">
              <IconButton onClick={exportToExcel} disabled={loading}>
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Export to PDF">
              <IconButton onClick={exportToPDF} disabled={loading}>
                <PictureAsPdfIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Print Report">
              <IconButton onClick={printReport} disabled={loading}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Filters */}
        {showFilters && (
          <Box mb={3} p={2} bgcolor="background.default" borderRadius={1}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    label="Report Type"
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <MenuItem value="revenue">Revenue</MenuItem>
                    <MenuItem value="expenses">Expenses</MenuItem>
                    <MenuItem value="profits">Profits</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Time Frame</InputLabel>
                  <Select
                    value={timeFrame}
                    label="Time Frame"
                    onChange={(e) => setTimeFrame(e.target.value)}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}
        
        {/* Summary Cards */}
        {!loading && (
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" component="div">
                    LKR {summary.totalRevenue.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#fff8e1', height: '100%' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Expenses
                  </Typography>
                  <Typography variant="h4" component="div">
                    LKR {summary.totalExpenses.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: summary.netProfit >= 0 ? '#e8f5e9' : '#ffebee', 
                height: '100%' 
              }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Net Profit
                  </Typography>
                  <Typography variant="h4" component="div">
                    LKR {summary.netProfit.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#f3e5f5', height: '100%' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Transactions
                  </Typography>
                  <Typography variant="h4" component="div">
                    {summary.transactionCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {/* Chart Section */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Trends
          </Typography>
          
          <Paper sx={{ p: 2, height: 400 }}>
            {!loading && financialData[reportType].length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getChartData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => `LKR ${value.toLocaleString()}`} />
                  <Legend />
                  {getCategories().map((category, index) => (
                    <Bar 
                      key={category}
                      dataKey={category} 
                      fill={COLORS[index % COLORS.length]} 
                      name={category}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box height="100%" display="flex" justifyContent="center" alignItems="center">
                <Typography variant="body1" color="textSecondary">
                  No data available for the selected period
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
        

        
        {/* Transactions Table */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Recent Transactions
          </Typography>
          
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Amount (Rs)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {financialData.transactions.slice(0, 10).map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell>{format(parseISO(transaction.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Box
                        component="span"
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: transaction.type === 'income' ? '#e8f5e9' : '#ffebee',
                          color: transaction.type === 'income' ? '#2e7d32' : '#c62828'
                        }}
                      >
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </Box>
                    </TableCell>
                    <TableCell align="right">{transaction.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        
        {/* Export Options */}
        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={exportToExcel}
            sx={{ mr: 2 }}
          >
            Export to Excel
          </Button>
          
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={exportToPDF}
            sx={{ mr: 2 }}
          >
            Export to PDF
          </Button>
          
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={printReport}
          >
            Print Report
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default FinancialReports;