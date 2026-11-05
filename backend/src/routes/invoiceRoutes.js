import express from 'express';
import { getInvoicesList, getInvoiceById, createInvoice } from '../services/invoiceService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const list = await getInvoicesList(50);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

router.post('/', async (req, res) => {
  try {
    const invoice = await createInvoice(req.body);
    res.status(201).json(invoice);
  } catch (err) {
    console.error('Create invoice error:', err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

export default router;

