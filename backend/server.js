const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
// In backend/server.js

app.use(cors({
  // Change this line from 3002 back to 3000
  origin: 'http://localhost:3000', 
  credentials: true
}));
app.use(bodyParser.json());

// MongoDB Connection
const dbURI = "mongodb+srv://admin:xXZWFcwvTQjrqdJv@cluster0.sjyibwg.mongodb.net/ITP";
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
const financeRoutes = require('./routes/finance');
app.use('/api/finance', financeRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));