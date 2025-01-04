import express from "express";
import apiRoute from "./api.js";
import userRoute from "./user.js";

const router = express.Router();

// Use this route for RESTful API (AJAX)
router.use(`/api`, apiRoute);

// Use this route for all SSR
router.use("", userRoute);

export default router;
