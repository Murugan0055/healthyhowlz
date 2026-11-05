import express from 'express';
import { getProducts, processPosCheckout } from '../services/posService.js';

const router = express.Router();

router.get('/products', async (req, res) => {
  try {
    const prods = await getProducts();
    res.json(prods);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch POS products' });
  }
});

router.post('/checkout', async (req, res) => {
  try {
    const { items, paymentMethod, customerName, customerPhone, staffId, staffName } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Cart items are required' });
    }
    const result = await processPosCheckout({ items, paymentMethod, customerName, customerPhone, staffId, staffName });
    res.json(result);
  } catch (err) {
    console.error('POS checkout error:', err);
    res.status(400).json({ error: err.message || 'POS checkout failed' });
  }
});

export default router;

