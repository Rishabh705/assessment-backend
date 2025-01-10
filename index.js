require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN, 
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); 

mongoose.connect('mongodb://localhost:27017/invoice', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const invoiceSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerAddress: { type: String, required: true },
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  taxRate: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
};

app.post('/api/invoices', async (req, res, next) => {
  try {
    const { 
      customerName, customerEmail, customerAddress, 
      items, taxRate, subtotal, tax, total 
    } = req.body;

    if (!customerName || !customerEmail || !customerAddress || !items) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const invoice = new Invoice(req.body);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
});

app.get('/api/invoices', async (req, res, next) => {
  try {
    const invoices = await Invoice.find()
      .sort({ createdAt: -1 })
      .select('-__v');
    res.json(invoices);
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});