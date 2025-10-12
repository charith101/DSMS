const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv'); // Added to load environment variables

dotenv.config(); // Load .env variables

const app = express();

// Middleware
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

// Mount webhook route BEFORE the JSON body parser so we can verify Stripe signature using the raw body
const { webhookHandler } = require('./routes/stripe');
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), webhookHandler);

// Use JSON body parser for normal routes
app.use(bodyParser.json());

// Simple request logger to help debugging
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});

// Health endpoint for quick checks
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// MongoDB Connection
const dbURI = "mongodb+srv://admin:xXZWFcwvTQjrqdJv@cluster0.sjyibwg.mongodb.net/ITP";
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
const financeRoutes = require('./routes/finance');
app.use('/api/finance', financeRoutes);

// Mount Stripe routes (from routes/stripe.js)
const stripeRoutes = require('./routes/stripe');
app.use('/api', stripeRoutes);

// Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
