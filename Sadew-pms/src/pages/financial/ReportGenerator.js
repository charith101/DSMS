import React, { useState } from 'react';
import { Card, Button, Input, Select } from '../../components/shared';

/**
 * Report Generator Page - Generate financial reports and analytics
 */
const ReportGenerator = () => {
  const [reportConfig, setReportConfig] = useState({
    reportType: 'revenue',
    dateFrom: '',
    dateTo: '',
    groupBy: 'month',
    includeRefunds: true,
    format: 'pdf'
  });
  
  const [generatingReport, setGeneratingReport] = useState(false);
  const [recentReports, setRecentReports] = useState([
    {
      id: 'RPT-001',
      name: 'Monthly Revenue Report - January 2024',
      type: 'revenue',
      generatedDate: '2024-01-31',
      fileSize: '245 KB',
      format: 'pdf'
    },
    {
      id: 'RPT-002',
      name: 'Payment Methods Analysis - Q4 2023',
      type: 'payment_methods',
      generatedDate: '2024-01-15',
      fileSize: '180 KB',
      format: 'csv'
    },
    {
      id: 'RPT-003',
      name: 'Student Payment History - December 2023',
      type: 'student_payments',
      generatedDate: '2024-01-05',
      fileSize: '520 KB',
      format: 'excel'
    }
  ]);
  
  const reportTypes = [
    { value: 'revenue', label: 'Revenue Report' },
    { value: 'payment_methods', label: 'Payment Methods Analysis' },
    { value: 'student_payments', label: 'Student Payment History' },
    { value: 'outstanding', label: 'Outstanding Payments' },
    { value: 'refunds', label: 'Refunds Summary' },
    { value: 'package_performance', label: 'Package Performance' },
    { value: 'financial_summary', label: 'Financial Summary' }
  ];
  
  const groupByOptions = [
    { value: 'day', label: 'Daily' },
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
    { value: 'quarter', label: 'Quarterly' },
    { value: 'year', label: 'Yearly' }
  ];
  
  const formatOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'csv', label: 'CSV File' }
  ];
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReportConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const generateReport = async (e) => {
    e.preventDefault();
    setGeneratingReport(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create new report entry
      const newReport = {
        id: `RPT-${String(recentReports.length + 1).padStart(3, '0')}`,
        name: getReportName(),
        type: reportConfig.reportType,
        generatedDate: new Date().toISOString().split('T')[0],
        fileSize: '325 KB',
        format: reportConfig.format
      };
      
      setRecentReports(prev => [newReport, ...prev]);
      
      // In a real app, this would trigger a file download
      console.log('Report generated:', newReport);
      
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGeneratingReport(false);
    }
  };
  
  const getReportName = () => {
    const typeLabel = reportTypes.find(t => t.value === reportConfig.reportType)?.label;
    const fromDate = new Date(reportConfig.dateFrom).toLocaleDateString();
    const toDate = new Date(reportConfig.dateTo).toLocaleDateString();
    return `${typeLabel} - ${fromDate} to ${toDate}`;
  };
  
  const downloadReport = (report) => {
    console.log('Downloading report:', report.id);
    // In a real app, this would trigger file download
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const quickReports = [
    {
      title: 'Outstanding Payments',
      description: 'All pending and overdue payments',
      action: () => {
        setReportConfig({
          ...reportConfig,
          reportType: 'outstanding',
          dateFrom: '',
          dateTo: '',
          groupBy: 'month'
        });
      }
    },
    {
      title: 'Last Quarter Summary',
      description: 'Comprehensive financial summary for Q4',
      action: () => {
        const now = new Date();
        const quarterStart = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        const quarterEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        setReportConfig({
          ...reportConfig,
          reportType: 'financial_summary',
          dateFrom: quarterStart.toISOString().split('T')[0],
          dateTo: quarterEnd.toISOString().split('T')[0],
          groupBy: 'month'
        });
      }
    }
  ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="content-header">
        <h1 className="content-title">Report Generator</h1>
        <p className="content-description">
          Generate comprehensive financial reports and analytics.
        </p>
      </div>
      
      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickReports.map((report, index) => (
          <Card key={index} interactive onClick={report.action}>
            <Card.Body className="text-center">
              <h3 className="font-semibold mb-2">{report.title}</h3>
              <p className="text-sm text-secondary mb-4">{report.description}</p>
              <Button size="sm" variant="outline">
                Generate Report
              </Button>
            </Card.Body>
          </Card>
        ))}
      </div>
      
      {/* Report Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header title="Report Configuration" />
          <Card.Body>
            <form onSubmit={generateReport} className="space-y-6">
              <Select
                name="reportType"
                label="Report Type"
                value={reportConfig.reportType}
                onChange={handleInputChange}
                options={reportTypes}
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="dateFrom"
                  label="From Date"
                  type="date"
                  value={reportConfig.dateFrom}
                  onChange={handleInputChange}
                  required
                />
                
                <Input
                  name="dateTo"
                  label="To Date"
                  type="date"
                  value={reportConfig.dateTo}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <Select
                name="groupBy"
                label="Group By"
                value={reportConfig.groupBy}
                onChange={handleInputChange}
                options={groupByOptions}
                helpText="How to group the data in the report"
              />
              
              <Select
                name="format"
                label="Export Format"
                value={reportConfig.format}
                onChange={handleInputChange}
                options={formatOptions}
              />
              
              <div className="form-check">
                <input
                  type="checkbox"
                  name="includeRefunds"
                  className="form-check-input"
                  checked={reportConfig.includeRefunds}
                  onChange={handleInputChange}
                />
                <label className="form-check-label">
                  Include refunds in calculations
                </label>
              </div>
              
              <Button
                type="submit"
                variant="primary"
                block
                loading={generatingReport}
                disabled={generatingReport}
              >
                {generatingReport ? 'Generating Report...' : 'Generate Report'}
              </Button>
            </form>
          </Card.Body>
        </Card>
        
        {/* Report Preview */}
        <Card>
          <Card.Header title="Report Preview" />
          <Card.Body>
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">Report Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary">Type:</span>
                    <span>{reportTypes.find(t => t.value === reportConfig.reportType)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Date Range:</span>
                    <span>
                      {reportConfig.dateFrom && reportConfig.dateTo
                        ? `${formatDate(reportConfig.dateFrom)} - ${formatDate(reportConfig.dateTo)}`
                        : 'Not specified'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Grouping:</span>
                    <span>{groupByOptions.find(g => g.value === reportConfig.groupBy)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Format:</span>
                    <span>{formatOptions.find(f => f.value === reportConfig.format)?.label}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">What's Included</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {reportConfig.reportType === 'revenue' && (
                    <>
                      <li>• Total revenue by time period</li>
                      <li>• Payment method breakdown</li>
                      <li>• Package performance metrics</li>
                      {reportConfig.includeRefunds && <li>• Refund impact analysis</li>}
                    </>
                  )}
                  {reportConfig.reportType === 'outstanding' && (
                    <>
                      <li>• Pending payment details</li>
                      <li>• Overdue payment analysis</li>
                      <li>• Student contact information</li>
                    </>
                  )}
                  {reportConfig.reportType === 'financial_summary' && (
                    <>
                      <li>• Complete financial overview</li>
                      <li>• Revenue vs. expenses</li>
                      <li>• Key performance indicators</li>
                      <li>• Growth metrics</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
      
      {/* Recent Reports */}
      <Card>
        <Card.Header title="Recent Reports" />
        <Card.Body>
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{report.name}</h4>
                  <div className="flex items-center gap-4 mt-1 text-xs text-secondary">
                    <span>Generated: {formatDate(report.generatedDate)}</span>
                    <span>Size: {report.fileSize}</span>
                    <span className="uppercase">{report.format}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadReport(report)}
                  >
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                  >
                    Share
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ReportGenerator;