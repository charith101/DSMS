const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const mongoose = require('mongoose');

// Router-level logger to confirm requests reach this router
router.use((req, res, next) => {
  console.log('[stripe router] ', new Date().toISOString(), req.method, req.originalUrl);
  next();
});

// Default currency to use when frontend doesn't provide one. Can be set via STRIPE_CURRENCY env.
const DEFAULT_CURRENCY = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Create Stripe Checkout Session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { studentName, studentId, amount, currency: inputCurrency } = req.body;

    console.log('[stripe] create-checkout-session request', { studentId, amount, inputCurrency });

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const rawAmount = Number(amount);
    if (isNaN(rawAmount) || rawAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Use provided currency if available, otherwise fall back to default
    const chargeCurrency = inputCurrency ? String(inputCurrency).toLowerCase() : DEFAULT_CURRENCY;
    const originalCurrency = inputCurrency ? String(inputCurrency).toUpperCase() : DEFAULT_CURRENCY.toUpperCase();

    // Compute unit amount in the smallest currency unit (most currencies use 2 decimals)
    const unitAmount = Math.round(rawAmount * 100);

    console.log(`[stripe] create-checkout: studentId=${studentId}, rawAmount=${rawAmount}, chargeCurrency=${chargeCurrency}, unitAmount(cents)=${unitAmount}`);

    if (unitAmount <= 0) {
      return res.status(400).json({ error: 'Amount too small. Enter a larger amount.' });
    }

    // Format a friendly label showing the original amount and currency (so Checkout shows what the user entered)
    const originalLabel = `${originalCurrency} ${rawAmount.toFixed ? rawAmount.toFixed(2) : Number(rawAmount).toFixed(2)}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: chargeCurrency,
            product_data: {
              name: `Tuition Fee - ${studentName || 'Student'} — ${originalLabel}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${FRONTEND_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/payments/cancel`,
      metadata: {
        studentId: studentId,
        originalAmount: rawAmount,
        originalCurrency,
      },
    });

    // Return the created session URL, session id and the charged amount (in the charged currency) for frontend confirmation
    res.json({ url: session.url, sessionId: session.id, amountCharged: rawAmount, currency: chargeCurrency.toUpperCase() });
  } catch (error) {
    console.error('Stripe session error:', error);
    if (error && error.stack) console.error(error.stack);
    // Return diagnostic info in development to help debug (do not expose in production)
    res.status(500).json({ error: 'Unable to create Stripe session', message: error?.message, type: error?.type });
  }
});

// Verify a Checkout Session (used by frontend after redirect)
router.post('/verify-session', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['payment_intent'] });

    // If the session is completed and paid, ensure we have a Payment record (idempotent)
    try {
      if (session.payment_status === 'paid') {
        const fullSession = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['payment_intent'] });
        const amountCents = fullSession.amount_total || (fullSession.payment_intent && fullSession.payment_intent.amount) || 0;
        const amount = Number(amountCents) / 100.0;
        const studentId = fullSession.metadata && fullSession.metadata.studentId ? fullSession.metadata.studentId : null;
        const chargedCurrency = fullSession.currency ? String(fullSession.currency).toUpperCase() : (fullSession.payment_intent && fullSession.payment_intent.currency ? String(fullSession.payment_intent.currency).toUpperCase() : 'USD');

        if (studentId) {
          // Check if payment with this sessionId already exists
          const existing = await Payment.findOne({ sessionId: sessionId });
          if (!existing) {
            const originalAmount = fullSession.metadata && fullSession.metadata.originalAmount ? Number(fullSession.metadata.originalAmount) : null;
            const originalCurrency = fullSession.metadata && fullSession.metadata.originalCurrency ? fullSession.metadata.originalCurrency : chargedCurrency;

            const paymentPayload = {
              // store studentId as the raw value (string) to match /student/addPayment behavior
              studentId: studentId,
              amount,
              currency: chargedCurrency,
              originalCurrency,
              originalAmount,
              sessionId: sessionId,
              paymentDate: new Date((fullSession.created || Date.now()) * 1000),
              paymentMethod: 'Card',
              description: fullSession.payment_intent && fullSession.payment_intent.description ? fullSession.payment_intent.description : `Stripe Checkout ${sessionId}`,
              status: 'Paid'
            };

            try {
              const created = await Payment.create(paymentPayload);
              console.log('Payment created via verify-session for student', studentId, 'amount', amount, 'docId', created._id);
            } catch (saveErr) {
              console.error('Failed to create payment in verify-session:', saveErr);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error ensuring payment save in verify-session:', err);
    }

    return res.json({ session });
  } catch (err) {
    console.error('Error verifying session:', err);
    return res.status(500).json({ error: 'Unable to verify session' });
  }
});

//  check Stripe API connectivity and key validity
router.get('/debug/stripe', async (req, res) => {
  try {
    // helps to validate API key and network access
    const bal = await stripe.balance.retrieve();
    return res.json({ ok: true, balance: bal });
  } catch (err) {
    console.error('Stripe debug error:', err);
    return res.status(500).json({ ok: false, message: err.message, type: err.type, raw: err.raw || null });
  }
});

//list recent payments (read-only) to verify webhook saves
router.get('/debug/payments', async (req, res) => {
  try {
    const recent = await Payment.find().sort({ paymentDate: -1 }).limit(20).lean();
    return res.json({ ok: true, count: recent.length, payments: recent });
  } catch (err) {
    console.error('Error fetching recent payments:', err);
    return res.status(500).json({ ok: false, error: 'Unable to fetch payments' });
  }
});

module.exports = router;

// Webhook handler 
module.exports.webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log('[stripe webhook] signature validated');
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('[stripe webhook] checkout.session.completed received for session', session.id);

    try {
      // Retrieve full session with expanded payment_intent for details
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, { expand: ['payment_intent'] });

      console.log('[stripe webhook] fullSession payment_status=', fullSession.payment_status, 'amount_total=', fullSession.amount_total, 'currency=', fullSession.currency, 'metadata=', fullSession.metadata);

  const amountCents = fullSession.amount_total || (fullSession.payment_intent && fullSession.payment_intent.amount) || 0;
  const amount = Number(amountCents) / 100.0;
  const studentId = fullSession.metadata && fullSession.metadata.studentId ? fullSession.metadata.studentId : null;
  // Use the currency reported by Stripe for the session
  const chargedCurrency = fullSession.currency ? String(fullSession.currency).toUpperCase() : (fullSession.payment_intent && fullSession.payment_intent.currency ? String(fullSession.payment_intent.currency).toUpperCase() : 'USD');

      if (!studentId) {
        console.warn('No studentId in session metadata; skipping DB save for session', session.id);
      } else {
        const originalAmount = fullSession.metadata && fullSession.metadata.originalAmount ? Number(fullSession.metadata.originalAmount) : null;
        const originalCurrency = fullSession.metadata && fullSession.metadata.originalCurrency ? fullSession.metadata.originalCurrency : chargedCurrency;


            const paymentPayload = {
              // store studentId as the raw value (string) to match /student/addPayment behavior
              studentId: studentId,
          amount,
          currency: chargedCurrency,
          originalCurrency,
          originalAmount,
          sessionId: session.id,
          paymentDate: new Date((fullSession.created || Date.now()) * 1000),
          paymentMethod: 'Card',
          description: fullSession.payment_intent && fullSession.payment_intent.description ? fullSession.payment_intent.description : `Stripe Checkout ${session.id}`,
          status: 'Paid'
        };

        try {
          const created = await Payment.create(paymentPayload);
          console.log('Payment created for student', studentId, 'amount', amount, 'session', session.id, 'docId', created._id);
        } catch (saveErr) {
          console.error('Failed to create payment doc:', saveErr);
          //  return 200 to Stripe so it doesn't keep retrying while debugging
        }
      }
    } catch (err) {
      console.error('Error handling checkout.session.completed webhook:', err);
      
      return res.status(500).send();
    }
  }

  // Return a 200 to acknowledge receipt of the event
  res.json({ received: true });
};
