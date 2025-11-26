const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  try {
    const { category, search, featured, limit, sort } = req.query;
    const query = {};

    if (category && category !== 'All') query.category = category;
    if (featured) query.featured = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } }
      ];
    }

    let productsQuery = Product.find(query);

    if (sort === 'price-asc') productsQuery = productsQuery.sort({ price: 1 });
    else if (sort === 'price-desc') productsQuery = productsQuery.sort({ price: -1 });
    else productsQuery = productsQuery.sort({ createdAt: -1 });

    if (limit) productsQuery = productsQuery.limit(parseInt(limit));

    const products = await productsQuery;
    res.json({ status: 'success', data: products, count: products.length });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    res.json({ status: 'success', data: product });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;