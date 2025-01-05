import express from 'express';
import * as orderService from './orderService.js';
import { errorResponse } from '../util/util.js';

const router = express.Router();

// View orders by query
router.get('/', (req, res) => {
  orderService
    .fetchOrderWithQuery(req.query)
    .then((orders) => {
      res.json(orders);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send(errorResponse(500, 'Xin lỗi, có lỗi xảy ra'));
    });
});

// View order by ID
router.get('/:id', (req, res) => {
  orderService
    .fetchOrderById(req.params.id)
    .then((order) => {
      res.json(order);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send(errorResponse(500, 'Xin lỗi, có lỗi xảy ra'));
    });
});

// Update order status
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await orderService.updateOrderStatus(req.params.id, status);
    res.json({ success: true, updated });
  } catch (error) {
    console.error(error);
    res.status(500).send(errorResponse(500, 'Xin lỗi, có lỗi xảy ra'));
  }
});

export default router;
