const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const UserModel = require('./models/Users');
const studentRouter = require('./controllers/student/studentAPI');
const authRouter = require('./controllers/auth/authAPI');
const employeeRouter = require('./controllers/Employee/employeeAPI');
const receptionistRouter = require('./controllers/receptionist/receptionistAPI');
const userProfileRouter = require('./controllers/userProfile/userProfileAPI.js');
const vehicleRouter = require('./controllers/vehicle/vehicleAPI.js');

const app = express();

// Configure CORS to allow frontend origin
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: FRONTEND_URL, credentials: true }));


// Mount Stripe webhook route BEFORE the JSON body parser so we can verify Stripe signature using the raw body
const stripeRoutes = require('./routes/stripe');
const { webhookHandler } = stripeRoutes;
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), webhookHandler);

// JSON parser for normal routes
app.use(express.json());

app.listen(3001, () => {
  console.log("Server is running");
});

// Non-destructive convenience redirect to frontend payments page
app.get('/payments', (req, res) => {
  return res.redirect(`${FRONTEND_URL}/payments`);
});

// Route registrations 
app.use('/student', studentRouter);
app.use('/auth', authRouter);
app.use('/employee', employeeRouter);
app.use('/receptionist', receptionistRouter);
app.use('/vehicle', vehicleRouter);
//app.use('/finance', require('./controllers/payment/financeAPI'));
app.use('/api/finance', require('./controllers/payment/financeAPI'));
app.use('/api/finance/transactions', require('./controllers/payment/transactionRoutes'));
app.use('/users', userProfileRouter);

// Mount Stripe routes under /api so create-checkout-session and verify-session are available
app.use('/api', stripeRoutes);

// MongoDB Connection and server start (single, deterministic listen)
const PORT = process.env.PORT || 3005;
const dbURI = process.env.MONGODB_URI || 'mongodb+srv://admin:xXZWFcwvTQjrqdJv@cluster0.sjyibwg.mongodb.net/ITP';

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');

    
    // Warn if Stripe secret key is not configured (helps debug payment failures)
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('WARNING: STRIPE_SECRET_KEY is not set. Card payments will fail until this is configured.');
    }

    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));