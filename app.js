import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import router, { forgetrouter } from "./All Routes/Authentic.Router.js";
import products_router from "./All Routes/Products.router.js";
import cartRouter from "./All Routes/cart.routes.js";
import { paymentrouter } from "./All Routes/Payment.js";

const app = express();

const corsConfig = {
  origin: "https://frontend-shop-now-z7bu.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// 🔥 CORS FIRST
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

// Middlewares
app.use(express.json());
app.use(cookieParser());

// MongoDB
const MONGO_URL = process.env.MONGO_URL;
let isConnected = false;

async function connectionMongo() {
  if (isConnected) return;
  await mongoose.connect(MONGO_URL);
  isConnected = true;
}

app.use(async (req, res, next) => {
  if (!isConnected) await connectionMongo();
  next();
});

// Routes
app.use("/api", router);
app.use("/api", products_router);
app.use("/api", forgetrouter);
app.use("/api", cartRouter);
app.use("/api", paymentrouter);

app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

export default app;
