const express = require('express');
const router = express.Router();
const docx = require('docx');
const { Packer } = docx;
const User = require('../models/User');

// Helper function to create table header cells
function createTableHeaderCell(text, widthPercentage) {
  return new docx.TableCell({
    children: [
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text,
            bold: true,
            size: 24,
            color: "FFFFFF"
          })
        ],
        alignment: docx.AlignmentType.CENTER
      })
    ],
    width: {
      size: widthPercentage,
      type: docx.WidthType.PERCENTAGE
    },
    borders: {
      top: { style: docx.BorderStyle.SINGLE, size: 1, color: "FFFFFF" },
      bottom: { style: docx.BorderStyle.SINGLE, size: 1, color: "FFFFFF" },
      left: { style: docx.BorderStyle.SINGLE, size: 1, color: "FFFFFF" },
      right: { style: docx.BorderStyle.SINGLE, size: 1, color: "FFFFFF" }
    },
    properties: {
      shading: {
        fill: "2E7D32" // Green header background
      }
    }
  });
}

// Helper function to create table data cells
function createTableDataCell(text, alignment = 'left') {
  const alignType = alignment === 'center' ? docx.AlignmentType.CENTER : docx.AlignmentType.LEFT;
  
  return new docx.TableCell({
    children: [
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: text || 'N/A',
            size: 22,
            color: "000000"
          })
        ],
        alignment: alignType
      })
    ],
    borders: {
      top: { style: docx.BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      bottom: { style: docx.BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      left: { style: docx.BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      right: { style: docx.BorderStyle.SINGLE, size: 1, color: "DDDDDD" }
    }
  });
}

// Helper function to get formatted date for filename
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Main route to download all students as Word document
router.get('/download-students', async (req, res) => {
  try {
    console.log('Starting student report generation...');
    
    // Fetch all students from User collection where role is "student"
    const students = await User.find({ role: 'student' })
      .select('name email age nic level licenseType createdAt')
      .lean();
    
    console.log(`Found ${students.length} students to export`);
    
    if (!students || students.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No students found to export' 
      });
    }

    // Create a new document
    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: [
          // Title
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: "STUDENT MANAGEMENT REPORT",
                bold: true,
                size: 36,
                color: "000000"
              })
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          // Subtitle
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: "Driving School Student List",
                italic: true,
                size: 28,
                color: "666666"
              })
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 600 }
          }),
          // Generation date
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `Generated on: ${new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  hour12: true 
                })}`,
                size: 22,
                color: "999999"
              })
            ],
            alignment: docx.AlignmentType.RIGHT,
            spacing: { after: 800 }
          }),
          // Empty line
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: "",
                size: 24
              })
            ],
            spacing: { after: 400 }
          })
        ]
      }]
    });

    // Create header table
    const headerTable = new docx.Table({
      rows: [
        new docx.TableRow({
          children: [
            new docx.TableCell({
              children: [
                new docx.Paragraph({
                  children: [
                    new docx.TextRun({
                      text: "STUDENT LIST REPORT",
                      bold: true,
                      size: 28,
                      color: "FFFFFF"
                    })
                  ],
                  alignment: docx.AlignmentType.CENTER
                })
              ],
              width: {
                size: 100,
                type: docx.WidthType.PERCENTAGE
              },
              columnSpan: 6
            })
          ]
        })
      ]
    });

    // Style header
    headerTable.getRows()[0].getCells()[0].properties.shading = { fill: "2E7D32" };
    
    // Add header to document
    doc.addSection({
      children: [headerTable],
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 720, right: 720 }
        }
      }
    });

    // Create main data table
    const table = new docx.Table({
      rows: [
        // Header row
        new docx.TableRow({
          children: [
            createTableHeaderCell("Name", 20),
            createTableHeaderCell("Email", 25),
            createTableHeaderCell("Age", 8),
            createTableHeaderCell("NIC", 15),
            createTableHeaderCell("Level", 10),
            createTableHeaderCell("License Type", 22)
          ]
        })
      ]
    });

    // Add student data rows - only using fields from student list
    students.forEach((student, index) => {
      console.log(`Processing student ${index + 1}: ${student.name}`);
      
      const licenseTypes = Array.isArray(student.licenseType) 
        ? student.licenseType.filter(type => type && type.trim() !== '').join(', ')
        : '';
      
      const row = new docx.TableRow({
        children: [
          createTableDataCell(student.name || 'N/A', 'left'),
          createTableDataCell(student.email || 'N/A', 'left'),
          createTableDataCell(student.age || 'N/A', 'center'),
          createTableDataCell(student.nic || 'N/A', 'left'),
          createTableDataCell(student.level || 'N/A', 'center'),
          createTableDataCell(licenseTypes || 'N/A', 'left')
        ]
      });
      
      table.root.push(row);
    });

    // Add summary section
    const summarySpacing = new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: "",
          size: 24
        })
      ],
      spacing: { before: 800, after: 400 }
    });
    
    const summaryText = new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: `TOTAL STUDENTS: ${students.length}`,
          bold: true,
          size: 28,
          color: "2E7D32"
        })
      ],
      spacing: { after: 400 },
      alignment: docx.AlignmentType.CENTER
    });
    
    const footerText = new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: "This report was generated by the Driving School Management System",
          italic: true,
          size: 20,
          color: "666666"
        })
      ],
      alignment: docx.AlignmentType.CENTER,
      spacing: { before: 400, after: 200 }
    });

    // Add table and summary to document
    doc.addSection({
      children: [table, summarySpacing, summaryText, footerText],
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 720, right: 720 }
        }
      }
    });

    console.log('Document generated successfully, preparing download...');
    
    // Generate the document blob
    const blob = await Packer.toBlob(doc);
    
    // Set headers for Word document download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="Student_Report_${getCurrentDate()}.docx"`);
    res.setHeader('Content-Length', blob.size);
    
    console.log(`Sending document with size: ${blob.size} bytes`);
    
    // Send the blob as binary data
    const arrayBuffer = await blob.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
    
    console.log('Document sent successfully');
    
  } catch (error) {
    console.error('Error generating student report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate student report', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

// Route to download filtered students (by level)
router.get('/download-students/:level', async (req, res) => {
  try {
    const { level } = req.params;
    console.log(`Generating report for Level ${level} students...`);
    
    // Fetch students by level from User collection
    const students = await User.find({ 
      role: 'student',
      level: parseInt(level)
    })
      .select('name email age nic level licenseType createdAt')
      .lean();
    
    console.log(`Found ${students.length} students for level ${level}`);
    
    if (!students || students.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `No students found for level ${level}` 
      });
    }

    // Create document with filtered title
    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: [
          // Title
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `LEVEL ${level.toUpperCase()} STUDENT REPORT`,
                bold: true,
                size: 36,
                color: "000000"
              })
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          // Subtitle
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `Driving School Student List - Level ${level}`,
                italic: true,
                size: 28,
                color: "666666"
              })
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 600 }
          }),
          // Generation date
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `Generated on: ${new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  hour12: true 
                })}`,
                size: 22,
                color: "999999"
              })
            ],
            alignment: docx.AlignmentType.RIGHT,
            spacing: { after: 800 }
          }),
          // Empty line
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: "",
                size: 24
              })
            ],
            spacing: { after: 400 }
          })
        ]
      }]
    });

    // Create header table
    const headerTable = new docx.Table({
      rows: [
        new docx.TableRow({
          children: [
            new docx.TableCell({
              children: [
                new docx.Paragraph({
                  children: [
                    new docx.TextRun({
                      text: `LEVEL ${level.toUpperCase()} STUDENTS`,
                      bold: true,
                      size: 28,
                      color: "FFFFFF"
                    })
                  ],
                  alignment: docx.AlignmentType.CENTER
                })
              ],
              width: {
                size: 100,
                type: docx.WidthType.PERCENTAGE
              },
              columnSpan: 6
            })
          ]
        })
      ]
    });

    // Style header
    headerTable.getRows()[0].getCells()[0].properties.shading = { fill: "2E7D32" };
    
    // Add header to document
    doc.addSection({
      children: [headerTable],
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 720, right: 720 }
        }
      }
    });

    // Create main data table
    const table = new docx.Table({
      rows: [
        // Header row
        new docx.TableRow({
          children: [
            createTableHeaderCell("Name", 20),
            createTableHeaderCell("Email", 25),
            createTableHeaderCell("Age", 8),
            createTableHeaderCell("NIC", 15),
            createTableHeaderCell("Level", 10),
            createTableHeaderCell("License Type", 22)
          ]
        })
      ]
    });

    // Add filtered student data rows
    students.forEach((student, index) => {
      console.log(`Processing student ${index + 1} for level ${level}: ${student.name}`);
      
      const licenseTypes = Array.isArray(student.licenseType) 
        ? student.licenseType.filter(type => type && type.trim() !== '').join(', ')
        : '';
      
      const row = new docx.TableRow({
        children: [
          createTableDataCell(student.name || 'N/A', 'left'),
          createTableDataCell(student.email || 'N/A', 'left'),
          createTableDataCell(student.age || 'N/A', 'center'),
          createTableDataCell(student.nic || 'N/A', 'left'),
          createTableDataCell(student.level || 'N/A', 'center'),
          createTableDataCell(licenseTypes || 'N/A', 'left')
        ]
      });
      
      table.root.push(row);
    });

    // Add summary section
    const summarySpacing = new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: "",
          size: 24
        })
      ],
      spacing: { before: 800, after: 400 }
    });
    
    const summaryText = new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: `TOTAL LEVEL ${level.toUpperCase()} STUDENTS: ${students.length}`,
          bold: true,
          size: 28,
          color: "2E7D32"
        })
      ],
      spacing: { after: 400 },
      alignment: docx.AlignmentType.CENTER
    });
    
    const footerText = new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: "This report was generated by the Driving School Management System",
          italic: true,
          size: 20,
          color: "666666"
        })
      ],
      alignment: docx.AlignmentType.CENTER,
      spacing: { before: 400, after: 200 }
    });

    // Add table and summary to document
    doc.addSection({
      children: [table, summarySpacing, summaryText, footerText],
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 720, right: 720 }
        }
      }
    });

    console.log(`Level ${level} document generated successfully`);
    
    // Generate the document blob
    const blob = await Packer.toBlob(doc);
    
    // Set headers for Word document download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="Level_${level}_Students_${getCurrentDate()}.docx"`);
    res.setHeader('Content-Length', blob.size);
    
    console.log(`Sending level ${level} document with size: ${blob.size} bytes`);
    
    // Send the blob as binary data
    const arrayBuffer = await blob.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
    
    console.log(`Level ${level} document sent successfully`);
    
  } catch (error) {
    console.error(`Error generating level ${req.params.level} student report:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate filtered student report', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

// Route to get export statistics (for dashboard)
router.get('/export-stats', async (req, res) => {
  try {
    console.log('Fetching export statistics...');
    
    // Count total students (users with role: "student")
    const totalStudents = await User.countDocuments({ role: 'student' });
    
    const studentsByLevel = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    const licenseTypeStats = await User.aggregate([
      { $match: { role: 'student' } },
      { $unwind: '$licenseType' },
      { $group: { _id: '$licenseType', count: { $sum: 1 } } },
      { $match: { _id: { $ne: null } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`Export stats: ${totalStudents} total students, ${studentsByLevel.length} levels, ${licenseTypeStats.length} license types`);
    
    res.json({
      success: true,
      data: {
        totalStudents,
        studentsByLevel: studentsByLevel.map(stat => ({
          level: stat._id || 'Unknown',
          count: stat.count
        })),
        licenseTypeStats: licenseTypeStats
          .filter(stat => stat._id && stat._id.trim() !== '')
          .map(stat => ({
            licenseType: stat._id,
            count: stat.count
          })),
        lastUpdated: new Date()
      }
    });
    
  } catch (error) {
    console.error('Error fetching export stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch export statistics', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

// Route to get basic student count for quick checks
router.get('/student-count', async (req, res) => {
  try {
    // Count students from User collection
    const totalStudents = await User.countDocuments({ role: 'student' });
    const levels = await User.distinct('level', { role: 'student' });
    
    const levelsWithCounts = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$level', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalStudents,
        availableLevels: levels,
        levelsWithCounts
      }
    });
    
  } catch (error) {
    console.error('Error fetching student count:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch student count', 
      error: error.message 
    });
  }
});

module.exports = router;