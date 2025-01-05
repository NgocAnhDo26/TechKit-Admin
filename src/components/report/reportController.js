import express from 'express';
import * as reportService from './reportService.js';
import { errorResponse } from '../util/util.js';

const router = express.Router();

// View report by query
router.get('/', (req, res) => {
  reportService
    .viewReport(req.query)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send(errorResponse(500, 'Xin lỗi, có lỗi xảy ra'));
    });
});

export default router;
