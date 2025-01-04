import express from 'express';
import * as productService from './productService.js';
import { upload } from '../../config/config.js';
import { errorResponse } from '../util/util.js';

const router = express.Router();

router.post('/', upload.array('images'), async (req, res) => {
  productService
    .createProduct(req.body, req.files)
    .then((product) => {
      res.json(product);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send(errorResponse(500, 'Xin lỗi, có lỗi xảy ra'));
    });
});

router.get('/', async (req, res) => {
  productService
    .fetchProductWithQuery(req.query)
    .then((products) => {
      res.json(products);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send(errorResponse(500, 'Xin lỗi, có lỗi xảy ra'));
    });
});

router.get('/:id', async (req, res) => {
  productService
    .fetchProductById(req.params.id)
    .then((product) => {
      res.json(product);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send(errorResponse(500, 'Xin lỗi, có lỗi xảy ra'));
    });
});

router.put('/:id', async (req, res) => {
  productService
    .updateProduct(parseInt(req.params.id, 10), req.body)
    .then((result) => {
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).send(result);
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send(errorResponse(500, 'Xin lỗi, có lỗi xảy ra'));
    });
});

export default router;
